# CSC 468 Project
<!-- TODO: Decide on name -->

## Development Shell

To get a dev shell with Nix: `nix-shell`

Otherwise, with Docker:
```sh
docker run -it --rm -v ${PWD}:/repo nixery.dev/shell/just/fd/nodejs
```

## Frontend

```sh
cd frontend
npm run dev # This runs a development server with live reloading
npm run lint # Run lints to check code for bad things
```

## Backend APIs

- Get & set list of feeds for user
- Given a feed, get articles - paginated, frozen in time

## TODO
- Flake? - Once we have things to package
- Frontend
  - nix package
  - nix lint check
  - nix formatting?
  - formatting?
  - Lightning CSS
  - sharp?
- Decide on API boundary
- Backend Mock API
