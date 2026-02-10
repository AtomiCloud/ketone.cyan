{ pkgs, packages }:
with packages;
{
  system = [
    atomiutils
  ];

  dev = [
    pls
    git
    sg
    typescript-language-server
  ];

  main = [
    infisical
    bun
  ];

  lint = [
    # core
    treefmt
    shellcheck
    sg
  ];

  releaser = [
    sg
  ];
}
