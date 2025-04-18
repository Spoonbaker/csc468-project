{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flakelight = {
      url = "github:nix-community/flakelight";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    garnix-lib = {
      url = "github:garnix-io/garnix-lib";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { flakelight, garnix-lib, self, ... }: flakelight ./. ({ config, ... }: {
    systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];

    packages = {
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

      frontend-nginx-container-stream = { lib, dockerTools, nginx, frontend-nginx-conf, fakeNss }: dockerTools.streamLayeredImage {
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
            "LISTEN_PORT=80"
          ];
          ExposedPorts = {
            "80/tcp" = { };
          };
        };
      };

      raw-report = { lib, fetchgit, runCommand, typst }:
        let
          typst-packages = fetchgit {
            url = "https://github.com/typst/packages.git";
            rev = "53bfd4e78a9bc68a7f3bffb1522ae12ef56d781b";
            sparseCheckout = map (p: "packages/preview/${p}") [
              "fletcher/0.5.7"
              "cetz/0.3.4"
              "oxifmt/0.2.1"
            ];
            hash = "sha256-dvl/vmHT6CzowBvNC8rr+TDtll5cKw9fYp1eFqev0XU=";
          };
        in
        runCommand "report-raw.pdf"
          { env.TYPST_PACKAGE_PATH = "${typst-packages}/packages"; }
          "${lib.getExe typst} compile ${./report}/main.typ $out";

      final-report = { runCommand, qpdf, raw-report }: runCommand "final-report.pdf"
        { nativeBuildInputs = [ qpdf ]; }
        "qpdf --empty --deterministic-id --pages ${raw-report} ${./report/resumes}/*.pdf -- $out";

    };

    nixosConfigurations.deploy-host = {
      modules = [
        garnix-lib.nixosModules.garnix
        ({ pkgs, config, lib, ... }: {
          nixpkgs.system = "x86_64-linux";

          garnix.server.enable = true;
          garnix.server.persistence.enable = true;
          garnix.server.persistence.name = "aggregator";

          system.stateVersion = "24.11";
          system.configurationRevision = self.rev or self.dirtyRev or null;

          virtualisation.oci-containers.containers =
            let
              deps = {
                backend-api = [ "db" ];
                frontend-nginx = [ "backend-api" ];
              };
              extraAttrs = {
                frontend-nginx = {
                  ports = [
                    "80:80"
                    "443:443"
                  ];
                  volumes = [ "${./containers/devCert}:/cert" ];
                };
              };
              mkContainer = name: {
                image = name;
                imageStream = pkgs."${name}-container-stream";
                networks = [ "aggregator" ];
                dependsOn = [ "network-aggregator" ] ++ deps.${name} or [ ];
              } // extraAttrs.${name} or { };
            in
            lib.genAttrs [ "db" "backend-api" "frontend-nginx" ] mkContainer;

          systemd.services =
            let
              runtime = config.virtualisation.oci-containers.backend;
              exec = "${config.virtualisation.${runtime}.package}/bin/${runtime}";
            in
            {
              # This could easily have issues on docker
              "${runtime}-network-aggregator" = {
                serviceConfig = {
                  Type = "oneshot";
                  ExecStart = "${exec} network create --ignore aggregator";
                  RemainAfterExit = true;
                };
              };
            };

          networking.firewall.allowedTCPPorts = [ 80 443 ];
          networking.firewall.allowedUDPPorts = [ 443 ];

          services.openssh.enable = true;
          users.users.root.openssh.authorizedKeys.keys = [
            "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAv0D8TnyJQh0w8FvXECe+iroAyHjK7LtpYCKV+QFxv8 ellis@bismuth"
            "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINx3u8R9hux28AJ+6iDY0N+Qe5vvBDHACQrXpJPunKeA gus" # Found from GH, may not be accurate
          ];
        })
      ];
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

      no-unfinished-work = { runCommand, lib, ripgrep, ... }: runCommand "no-unfinished-work" { } ''
        cd ${./.}
        if ${lib.getExe ripgrep} --context 1 --pretty "T()ODO|F()IXME"; then
          # RG succeeds = matches found
          echo "Found unfinished work!"
          exit 1
        else
          touch $out
        fi
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
        lib = pkgs.lib;
        prettier = (config.formatters pkgs)."*.md";
        nginx-fmt = "${lib.getExe pkgs.nginx-config-formatter} --indent 2";
      in
      {
        "*.js" = prettier;
        "*.ts" = prettier;
        "*.css" = prettier;
        "*.html" = prettier;

        "*.rs" = "${lib.getExe pkgs.rustfmt}";

        "*.py" = "${lib.getExe pkgs.ruff} --no-cache format";
        "*.sql" = "${lib.getExe pkgs.pgformatter} --inplace";
        "nginx.conf" = nginx-fmt;

        "*.typ" = "${lib.getExe pkgs.typstyle} --inplace";
        "justfile" = "${lib.getExe pkgs.just} --fmt --unstable --justfile";
      };
  });
}

