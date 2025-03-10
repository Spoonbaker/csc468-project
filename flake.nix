{
  # TODO: use our own nixpkgs?
  inputs.flakelight.url = "github:nix-community/flakelight";

  outputs = { flakelight, ... }: flakelight ./. ({ config, ... }: {
    systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];

    # TODO: containers
    # - staticly compile container stuff?
    # - reduce size
    #   - postgres
    #     - icuSupport = false
    #     - pamSupport = false
    #     - systemdSupport = false
    #     - sqlite!?
    #   - nginx
    #     - no xml stuff
    # - add built image outputs?
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

        # TODO: what does it put here?
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
          dockerTools.binSh # `initdb` needs this # TODO: dash?
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
          # TODO: should we do /bin/postgres? that would remove it from the
          # customization layer
          Cmd = [
            "${lib.getExe dbInit}"
            "${postgresql}/bin/postgres"
            "${postgres-conf}"
            "${postgresql}/bin/initdb"
            "${./containers/init.sql}"
          ];
          User = "nobody:nobody";
          # TODO: does it use both TCP and UDP?
          ExposedPorts = {
            "5432/tcp" = { };
            "5432/udp" = { };
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

      # TODO: check postgres conf
      # TODO: check init.sql

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

    # TODO: do we want multiple devShells?
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

