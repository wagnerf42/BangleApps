{ pkgs ? import <nixpkgs> { } }:
pkgs.mkShell {
  buildInputs = with pkgs; [
    nodePackages.eslint
    nodePackages.prettier
    nodePackages.typescript-language-server
    nodejs
    nodePackages.typescript
    python3
  ];
}
