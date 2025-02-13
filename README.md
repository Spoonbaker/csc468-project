# CSC 468 Project
<!-- TODO: Decide on name -->

## Development Shell

To get a dev shell with Nix, run `nix develop`. This is nicer in many ways if you have it set up.

Otherwise, with Docker:
```sh
docker run -it --rm -v .:/repo -p 8081:8081 -w /repo nixery.dev/shell/just/fd/nodejs
```

Note that the docker command should be run from the repo root (the folder containing this file).

## Frontend

To get started:

```sh
cd frontend
npm i # This installs all required packages locally for development
npm run dev # This runs a development server with live reloading
npm run lint # Run lints to check code for bad things
```

> [!NOTE]
> Any/all of this can be changed. This is just a starting point.

The frontend is currently set up to use a build tool called [Vite](https://vite.dev/guide/features.html). This handles compiling Typescript and bundling HTML, CSS, & JS. We also use a CSS processor called [Lightning CSS](https://lightningcss.dev/transpilation.html) and an image processor called [vite-imagetools](https://github.com/JonasKruckenberg/imagetools/tree/main/docs) ([more info](https://github.com/JonasKruckenberg/imagetools/blob/main/docs/directives.md)), both of which should be fairly transparent if unused, but provide some nice features.

Vite also lets us import most web-related files, and any file with `?raw`. (See `node_modules/vite/client.d.ts`) Notably, `import './style.css'` in a JS/TS file will include that CSS in any page that imports the script. Importing an image gives you the path of that image in the final bundle, suitable for use in the `src` attribute.

Generally, you should prefer putting files in `src/` over `public/`, so that Vite will work its magic.

In the future, the backend API base URL should be available in scripts as `import.meta.env.VITE_API_BASE`. <!-- TODO: give example usage -->
<!-- TODO: .env.{development, production} -->
<!-- TODO: will we just always run the backend? -->

## Features

- Basic functionality (main goal)
  - Add & remove feeds
  - Display articles
  - Periodic refresh - if an article is added & removed between user visits (like lobste.rs or HN), article still appears
- Extra stuff if we have time
  - OAuth user accounts - Google, GH
  - Silly overcomplicated "enterprise-grade" backend

