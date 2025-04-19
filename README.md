# CSC 468 Project
<!-- TODO: Decide on name -->

## Development Shell

To get a dev shell with Nix: `nix-shell`

Otherwise, with Docker:
```sh
docker run -it --rm -v ${PWD}:/repo nixery.dev/shell/just/fd
```

## Backend APIs
- Get & set list of feeds for user
- Given a feed, get articles - paginated, frozen in time

## TODO
- Flake? - Once we have things to package
- Set up frontend
  - Vite
  - Lightning CSS
- Decide on API boundary
- Backend Mock API
