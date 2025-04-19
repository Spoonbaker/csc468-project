{ pkgs ? import <nixpkgs> {}}: pkgs.mkShellNoCC {
  packages = __attrValues {
    inherit (pkgs)
      just
      fd
      ;
  };
  }
