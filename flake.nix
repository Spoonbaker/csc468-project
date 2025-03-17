{
  inputs.flakelight.url = "github:nix-community/flakelight";

  outputs = { flakelight, ... }: flakelight ./. ({ config, ... }: {
    systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];

    packages = {
      # TODO: blindly copied
      frontend = { buildNpmPackage, importNpmLock }: buildNpmPackage {
        name = "frontend";
        src = ./frontend;
        packageJSON = ./frontend/package.json;
        npmDeps = importNpmLock {
          npmRoot = ./frontend;
        };
        npmConfigHook = importNpmLock.npmConfigHook;
        installPhase = "cp -r dist/ $out";
      };

      frontend-nginx-conf = { substituteAll, frontend, nginx }: substituteAll {
        src = ./containers/nginx.conf;
        webRoot = "${frontend}";
        nginxRoot = "${nginx}";
      };

      frontend-container-stream = { lib, dockerTools, nginx, frontend-nginx-conf, fakeNss }: dockerTools.streamLayeredImage {
        name = "frontend-nginx";
        tag = "latest";

        contents = [
          fakeNss
        ];

        extraCommands = ''
          mkdir tmp
          chmod 1777 tmp
        '';

        config = {
          Entrypoint = [ "${lib.getExe nginx}" "-c" "${frontend-nginx-conf}" ];
          ExposedPorts = {
            "80/tcp" = { };
            "443/tcp" = { };
          };
          Volumes = {
            "/cert" = { }; # Expects cert.crt & key.pem
          };
        };
      };

      dbInit = { rustPlatform }: rustPlatform.buildRustPackage {
        name = "db-init";
        meta.mainProgram = "db-init";

        src = ./containers/db-init;
        cargoLock.lockFile = ./containers/db-init/Cargo.lock;
      };

      postgres-conf = { substituteAll, frontend, nginx }: substituteAll {
        src = ./containers/postgresql.conf;
        hbaFile = "${./containers/pg_hba.conf}";
      };

      db-container-stream = { lib, dockerTools, fakeNss, dbInit, postgresql, postgres-conf }: dockerTools.streamLayeredImage {
        name = "db";
        tag = "latest";

        contents = [
          dockerTools.binSh # `initdb` needs this
          fakeNss
          postgresql # For `podman exec ... psql` and such
        ];

        # Postgres listens on local sockets in `/run/postgresql`
        # We keep this mostly so we can do `podman exec ... psql <args>`
        extraCommands = ''
          mkdir -p run/postgresql
          chmod 777 run/postgresql
        ''; # We do 777 because postgres is the only thing running

        config = {
          Cmd = [
            "${lib.getExe dbInit}"
            "/bin/postgres"
            "${postgres-conf}"
            "/bin/initdb"
            "${./containers/init.sql}"
          ];
          ExposedPorts = {
            "5432/tcp" = { };
          };
          Env = [
            "LANG=C.UTF-8"
            "PGDATA=/db"
          ];
          Volumes = {
            "/db" = { }; # This is initialized automagically
          };
        };
      };

      backend-api = { rustPlatform }: rustPlatform.buildRustPackage {
        name = "backend-api";
        meta.mainProgram = "backend-api";

        src = ./backend-api;
        cargoLock.lockFile = ./backend-api/Cargo.lock;
      };

      backend-api-container-stream = { lib, dockerTools, backend-api }: dockerTools.streamLayeredImage {
        name = "backend-api";
        tag = "latest";

        config = {
          Entrypoint = [
            "${lib.getExe backend-api}"
          ];
          Env = [
            "DB_HOST=db"
          ];
          ExposedPorts = {
            "3000/tcp" = { };
          };
        };
      };

      raw-report = { runCommand, typst }: runCommand "report-raw.pdf"
        { nativeBuildInputs = [ typst ]; }
        "typst compile ${./report}/main.typ $out";

      final-report = { runCommand, qpdf, raw-report }: runCommand "final-report.pdf"
        { nativeBuildInputs = [ qpdf ]; }
        "qpdf --empty --deterministic-id --pages ${raw-report} ${./report/resumes}/*.pdf -- $out";

    };

    checks = {
      # Flakelight implicit checks:
      # - All packages
      # - Formatting of all files
      # - NixOS systems with same `system`

      report-matches = { runCommand, final-report, ... }: runCommand "report-matches" { } ''
        diff -q ${final-report} ${./report.pdf} |\
          sed 's/Files .* and .* differ/Report not updated! Run `just report`./g'
        touch $out
      '';

      frontend-checks = { frontend, ... }: frontend.overrideAttrs {
        name = "frontend-checks";
        installPhase = "touch $out;";
        npmBuildScript = "check";
      };
    };

    devShell.packages = pkgs: __attrValues {
      inherit (pkgs)
        just
        fd
        nodejs
        typescript-language-server
        vscode-langservers-extracted
        ;
    };

    formatters = pkgs:
      let
        prettier = (config.formatters pkgs)."*.md";
      in
      {
        "*.js" = prettier;
        "*.ts" = prettier;
        "*.css" = prettier;
        "*.html" = prettier;
      };
  });
}

