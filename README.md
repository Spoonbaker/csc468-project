# Aggre-Gator

Aggre-Gator is a cloud-based RSS & Atom feed reader. This is a project for Dr. Ngo's CSC 468 - Introduction to Cloud Computing at West Chester University of Pennsylvania.

_You may want to look at_:

- The [report](./report.pdf), an explanation of Aggre-gator's design and how we built it
- Our [CI on Garnix](https://garnix.io/repo/Spoonbaker/csc468-project); Garnix runs slightly faster than GitHub actions, and is able to take advantage of Nix's ability to cache builds, which makes CI even faster.
- Our [CloudLab experiment profile](https://www.cloudlab.us/p/cloud-edu/aggre-gator); currently just a machine with Docker, Docker-Compose, and Nix. Our plan is that deployment will be fully automated after the experiment is created.

## Development

To get a dev shell with Nix, run `nix develop`. This should get you everything you need. It's like a Python virtualenv for your shell!

Some general tips:

- Commit messages should take the form `part: feature`, such as `frontend: make background neon yellow`
- Format your code with `nix fmt` (whole project) or `npm run fmt` (frontend only). Your code needs to be formatted to be merged into `main`. If you use VSCode, you should make sure VSCode formats with Prettier, not the builtin HTML formatter.
- If your commit fixes an issue, you can put `fixes #<issue number>` in the commit description. GitHub will close the issue when your commit is in `main`. A full list of verbs can be found [here](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword)
- If there's something you need to do later, adding `T` `ODO` or `F` `IXME` (without the spaces!) will ensure it doesn't make it into production.
- If possible, rebase your feature branches onto main often.

### Frontend

To get started:

```sh
cd frontend
npm i # This installs all required packages locally for development
npm run dev # This runs a development server with live reloading
```

Some other commands to be aware of:

```
npm run check # Run lints to check code for bad things
npm run fmt # Format code with consistent style
```

The backend API base URL is available in scripts as `import.meta.env.VITE_API_BASE`. An example usage:

```js
const API_BASE = import.meta.env.VITE_API_BASE;

// Do a GET request to `/debug`
const response = await fetch(`${API_BASE}/debug`);
const json = await reponse.json();

// For more info see:
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
```

### Some frontend tips:

- Put things in `src/` instead of `public/` whenever possible. This ensures Vite will optimize them.
- If you `import ./style.css` in a JS/TS file, that CSS will be included on any page the script runs on.
