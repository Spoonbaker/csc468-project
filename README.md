# CSC 468 Project

<!-- TODO: Decide on name -->

## Development Shell

To get a dev shell with Nix, run `nix develop`.

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

In the future, the backend API base URL should be available in scripts as `import.meta.env.VITE_API_BASE`. An example usage:

```js
const API_BASE = import.meta.env.VITE_API_BASE;

// Do a GET request
const response = await fetch(`${API_BASE}/endpoint`);

// To change the type of request, do:
const response = await fetch(`${API_BASE}/endpoint`, {
  /* fields */
});
// The fields you can use are documented in:
// https://developer.mozilla.org/en-US/docs/Web/API/RequestInit
```

## Development

### General workflow:

- You have some work item that you are going to work on
- Implement that on a personal/team branch - `spoon/frontend`
- Open a PR against `main`
- In either the commit messages or PR, put `closes #<number>`, see [here](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword)
- Group discussion - for changes only affecting a specific part, this will be brief/non-existant
- Revise if needed
- Merge & delete feature branch - if you follow the above, this will auto-close the work item!

### Issue flow:

- There's a bug, task that needs to be done, or future idea => create an issue!
  - Create it on the [unclaimed work page](https://github.com/users/Spoonbaker/projects/1/views/8), under the appropriate team
  - Assign the appropriate labels
  - (Optional) if this is something that you are going to do yourself, assign yourself now. I (Ellis) like to use issues as a personal todo list this way.
- The item starts off unassigned, meaning there is not one specific person who is going to do it.
- When somone is looking to pick up additional work, they assign something for their team to themselves
- We all move assigned tasks from Todo -> In Progress -> Done
- 3 days after an item is closed, it is archived to clear up space.

### Things to keep in mind:

- Keep an eye on [open PRs](https://github.com/Spoonbaker/csc468-project/pulls?q=sort%3Aupdated-desc+is%3Apr+is%3Aopen)
  - Review group-wide and team-specific PRs
  - To leave a comment or suggest changes, click and drag the plus button over the relevant lines
  - To suggest changes, click the suggest changes button and then edit the text it creates
  - If you think the PR is ready in its current state, approve the changes
  - If you think there are issues blocking the merge, note what the issues are and click "request changes"
- You can ping people on Github. Discord is great for chats, Github is great for asynchronous discussion.
  - Make sure you check Github notifications
- Commit names should generally take the form: `<thing you worked on>: <what you did>`, for example: `frontend: init`
- You should format your code with the formatter

## Features

- Basic functionality (main goal)
  - Add & remove feeds
  - Display articles
  - Periodic refresh - if an article is added & removed between user visits (like lobste.rs or HN), article still appears
- Extra stuff if we have time
  - OAuth user accounts - Google, GH
  - Silly overcomplicated "enterprise-grade" backend
