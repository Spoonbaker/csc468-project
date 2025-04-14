{ pkgs, ... }: {
  nixpkgs.system = "x86_64-linux";
  garnix.server.enable = true;
  system.stateVersion = "24.11";

  users.users.root.openssh.authorizedKeys.keys = [
    "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAv0D8TnyJQh0w8FvXECe+iroAyHjK7LtpYCKV+QFxv8 ellis@bismuth"
    "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINx3u8R9hux28AJ+6iDY0N+Qe5vvBDHACQrXpJPunKeA gus"
  ];
}
