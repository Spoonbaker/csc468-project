{
  # TODO: use our own nixpkgs?
  inputs.flakelight.url = "github:nix-community/flakelight";
  
  outputs = { flakelight, ... }: flakelight ./. {
    systems = ["x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin"];

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
        src = ./nginx.conf;
        webRoot = "${frontend}";
        nginxRoot = "${nginx}";
      };

      # TODO: also export built image?
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
          Entrypoint = ["${lib.getExe nginx}" "-c" "${frontend-nginx-conf}"];
          ExposedPorts = {
            "80/tcp" = {};
            "443/tcp" = {};
          };
          Volumes = {
            "/cert" = {}; # Expects cert.crt & key.pem
          };
        };
      };

    };

    # TODO: do we want multiple devShells?
    devShell.packages = pkgs: __attrValues {
      inherit (pkgs)
        just
        fd
        nodejs
        typescript-language-server
      ;
    };

    # TODO: formatting
    # JS
    # TS
    # CSS
    # nix - nixfmt?
  };
}

