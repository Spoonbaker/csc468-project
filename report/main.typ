#let authors = (
  "Gus Johannesen",
  "Chris Ross",
  "Ellis Weaver-Kreider",
  "Yanxi Wei",
)
#let topLine = true
#let citation-style = "association-for-computing-machinery"

#set document(
  title: "Aggre-Gator",
  author: authors,
)

#set page(paper: "us-letter", margin: 1in)
#set par(leading: 0.65em)
#set text(size: 11pt)

#set par(justify: true)
// Not completely sure if global like this is the way to go or not

#show link: underline
#show link: set text(blue)



// From https://typst.app/docs/reference/text/raw/#parameters-block

// Display inline code in a small box
// that retains the correct baseline.
#show raw.where(block: false): box.with(
  fill: luma(240),
  inset: (x: 3pt, y: 0pt),
  outset: (y: 3pt),
  radius: 2pt,
)

// Display block code in a larger block
// with more padding.
#show raw.where(block: true): block.with(
  fill: luma(240),
  inset: 10pt,
  radius: 4pt,
)

#counter(page).update(0) // Page 1 is after title page

// Title page
#{
  set align(center + horizon)
  show heading.where(level: 1): set text(2.5em)
  show heading.where(level: 2): set text(weight: "regular", style: "italic")
  set par(spacing: 2em)
  set par(justify: true) // This is here in case the global justify is removed

  [
    = Aggre-Gator
    #text(1.5em)[_An RSS & Atom Feed Reader_]

    #grid(
      // columns: (1fr, 1fr),
      columns: 2,
      // align: (right, left),
      inset: 0.5em,
      ..(authors.map(smallcaps))
    )

    CSC 468 -- Introduction to Cloud Computing \
    Dr. Linh B. Ngo --- Spring 2025 \
    West Chester University of Pennsylvania \

    #v(4 * 1.65em)

    == Overview
    Many sites publish RSS or Atom feeds, including YouTube, GitHub, and many
    others. An RSS reader allows a user to subscribe to several of these feeds,
    and displays updates. We propose a web-based reader, Aggre-Gator, that
    syndicates an arbitrary number of RSS and Atom feeds, presents them in a
    user-friendly way, and syncs across devices.
  ]
  pagebreak()
}

// Begin header & page numbering after title page
#set page(
  header: {
    emph[Aggre-Gator]

    if topLine {
      box(
        align(center + horizon)[
          #line(length: 90%, stroke: 0.25pt)
        ],
        width: 1fr,
        height: 0.6em,
      )
    } else {
      h(1fr)
    }

    emph[CSC 468]
  },
  footer: align(right, context counter(page).display("1")),
  numbering: "1", // Adds metadata to the PDF
)

= Chapter 1
The core functionality of Aggre-Gator is fairly similar to other feed readers
that run as local applications. However, it has some notable differences on
account of being cloud-based. The basic function of an RSS/Atom reader is:

- The user configures a list of feeds they are interested in.
- The user instructs the reader to refresh the feeds.
- The reader fetches a list of articles from each feed.
- The reader presents the articles to the user, both as a link and potentially as content.
- The reader saves the articles for later viewing.

Being cloud-based adds additional advantages:

- We can refresh feeds in the background, between site visits, so the user doesn't miss articles.
- Instead of a local application tied to a specific operating system or platform, our app is accessible everywhere.
- The user's subscriptions and article library follow them between devices.

// This describes our general goal for the project. However, if we finish this
// early, there are some additional features on our wishlist, time permitting:

// - SSO user accounts with Google and/or GitHub login
// - Exporting an aggregate feed to external feed readers
// - Bookmarking articles to save them for later
// - Web push notifications for select feeds
// - Sending articles from your feeds to other users
// - Production-grade deployment
//   - All physical nodes running NixOS
//   - Multi-node Kubernetes clusters
//   - Geographically distributed - potentially South Carolina, Utah, France
//   - Fully automated - instantiating CloudLab profile deploys everything
// - A second sillier, overcomplicated deployment strategy


= Chapter 2
Aggre-Gator is divided into several logical blocks. The frontend is a static
site with client-side interactivity, and is compiled to a static asset bundle
which we serve with _nginx_ @nginx. _nginx_ also proxies the `/api` route to
the `backend-api` service, which interacts with the database. The feed fetcher
service will periodicly update all feeds, and write the updated content to the
database.

#import "@preview/fletcher:0.5.7" as fletcher: diagram, node, edge
#import fletcher.shapes: pill, hexagon

#figure(
  kind: "figure",
  supplement: "Figure",
  caption: [Design of Aggre-Gator],
  {
    set text(size: 9pt)

    // I don't like this, but it works
    show raw.where(block: false): it => it.text
    diagram(
      // debug: 2,
      spacing: (2em, 1em),
      node-outset: 0.25em,
      node-fill: luma(220),
      {
        node((-2, 0), shape: hexagon)[User]
        edge(<nginx>, "->")
        node((1, 0), name: <nginx>)[_nginx_]
        edge("->")
        node((2, 0))[`backend-api`]
        edge("->")
        node((3, 0))[PostgreSQL]
        edge("<-")
        node((4, 0), name: <fetcher>)[Feed Fetcher]
        edge(<fetcher>, auto, "->")
        node((7, 0), shape: hexagon)[Internet]

        let dockerColor = rgb("#0db7ed")
        node(
          height: 4em,
          enclose: (
            (1, 0),
            (4, 0),
            // These make the edges be in the middle of the arrows
            (5, 0),
            (0, 0),
          ),
          stroke: dockerColor,
          fill: dockerColor.lighten(90%),
          name: <docker>,
        )
        node(
          (rel: (1.7em, -2.5em), to: <docker>),
          text(dockerColor, "Docker"),
          fill: none,
        )

        node((1.5, -1), name: <frontend>)[Frontend]
        edge(<frontend>, <nginx>, "->", corner: left)
      },
    )
  },
)

== Frontend
Because the frontend is a static site, we have considerable flexibility
deploying it. Currently, we simply serve it with _nginx_, but we have the
flexibility to serve it using a CDN or with any sort of intermediate caching.
In addition, we can set all assets except HTML and the favicon (and _maybe_ a
couple other things) to be cached indefinitely in the browser, which decreases
both load times and the load on our servers.

This caching is possible because our build tool, Vite @vite, gives all assets
names based on the hash of their contents. Vite also bundles and minifies
assets, and can be extended with plugins. We use plugins to further optimize and
process images and CSS.

Instead of plain JavaScript, we opted to use Typescript @typescript for better
error checking and IDE integration. We also have ESLint @eslint set up to catch
errors and mistakes that the Typescript compiler might miss. Given that we don't
need to manage any client-side UI state, we didn't use a Javascript framework.
For styling, we are using Tailwind CSS @tailwind with WCU theme colors.

== Nginx
_nginx_ is the only publicly exposed network service in our design. This means
that user-facing concerns like SSL/TLS, rate limiting, and HTTP/2 and HTTP/3 are
managed in one place, rather than scattered throughout the codebase.

We have the root `/` route configured to serve assets from our frontend bundle.
`/api/` is configured to proxy to the `backend-api` container. By separating
our content server and backend, we are able to scale them independantly in
the future. _nginx_ allows us to proxy a route like `/api` to a collection of
backing servers, configured in an `upstream` block @nginx-upstream. We also
make sure that `backend-api` is stateless, ensuring the application behaves
consistently regardless of which _nginx_ or `backend-api` instance a request
happens to be routed through.

== `backend-api`
The `backend-api` service provides a REST API to the frontend to manipulate the
database, and does relatively little data processing itself. Because only the
frontend is publicly exposed to the internet, the communication from _nginx_
to `backend-api` and from `backend-api` to the database is unencrypted. Sending
traffic on the internal container network requires access to the container
runtime (Docker @docker or Podman @podman), and if an attacker has access to the
runtime, they also gain the ability to read service credentials.

== Database
We use PostgreSQL @postgres to manage our database. We have a small binary
written in Rust, @rust called `db-init`, which initializes the database cluster
if it doesn't exist, and replaces itself with the Postgres server if it does
exist.

Postgres has the ability to store text data such as article content in the
`text` type @postgres-text-type, and, should we need it, can also store JSON
efficiently and in a queryable manner in the `jsonb` type @postgres-jsonb-type.
We believe that for this project, any document-style data is best stored in
a battle-tested DBMS like Postgres, as opposed to a dedicated document-only
database like Mongo @mongodb.

In the future, we may deploy at multiple global points of presence. We may
then consider a different DBMS, such as Cassandra, aimed at global-scale data
replication.

== Feed Fetcher
The feed fetcher will periodically get a list of feeds to refresh from the User
DB, fetch the content from the web, and store the result in the Article & Feed
DB. Having this as a separate component will hopefully allow us to scale it
separately from other parts of the backend.

= Chapter 3
To build the Docker (or more accurately OCI) containers, we
use Nix @nix, specifically the _nixpkgs_ @nixpkgs function
`pkgs.dockerTools.streamLayeredImage`. We chose this both because of the
advantages to `streamLayeredImage`, and because we were already using Nix.
_nixpkgs_ is the largest single repository of software in the world, and one
of the most up-to-date @repology-repos. In addition, `streamLayeredImage` is
reproducible @repro-builds, which makes our deployment more auditable, and less
likely to break because of changes to external systems. `streamLayeredImage`
also includes only the software we run and its dependencies. This means that our
container images are smaller and faster to deploy. It also means that should an
attacker get the ability to execute arbitrary commands, they do not have access
to a shell or standard tools like `/bin/rm` and similar (Postgres requires
`/bin/sh` to run, but still does not contain things like `chmod`). Below is
the code to generate an image for our `backend-api` component, taken from
`flake.nix` in our repo @our-repo.

#figure(
  kind: "figure",
  supplement: "Figure",
  caption: [Nix code for our `backend-api` OCI container],
  {
    ```nix
    backend-api-container-stream = { /*...*/ }: dockerTools.streamLayeredImage {
      name = "backend-api";
      tag = "latest";

      config = {
        Entrypoint = [
          "${lib.getExe backend-api}"
        ];
        Env = [
          "DB_HOST=db"
          "LISTEN_PORT=80"
        ];
        ExposedPorts = {
          "80/tcp" = { };
        };
      };
    };

    ```
  },
)

== Nix in CI Tests
We also use Nix in our CI testing. In Nix, we can create a derivation (similar
to a package) and require that it build for every commit. We require that all
derivations for all our components build before a PR can be merged, to ensure
`main` is always in a functional state. We can also create derivations that do
not produce meaningful output, but simply check something. For instance, we have
a check called `formatting` that ensures that all code in the repo is formatted
according to a list of formatters. We also use Nix to build this report, using
Typst @typst. We have a check to ensure that before a PR that changes the report
source can be merged, the `report.pdf` file must be updated to match.

Building our software and running our tests in Nix gives us some significant
benefits. Because Nix carefully tracks all inputs to a derivation, it can
avoid rebuilding/retesting when it can be reasonably certain the outcome
will be the same. If we try to build something using the exact same source
code, dependencies, and environment variables as a previous build, Nix will
simply reuse that result. We can achieve a somewhat similar result with
more conventional CI systems like GitHub actions, but it requires manually
configuring what paths trigger rebuilds, and that these configured paths be kept
perfectly up to date.

Using Nix Flakes allows us to pin all our dependencies, including all compilers
and even `glibc`, to ensure our build and test environment doesn't change
without us changing it deliberately. This pinned environment is the same between
development, testing, and deployment. This means that in dev, we can run the
exact checks that would run in CI with `nix flake check`, before commiting or
pushing.

= Chapter 4
Assessing the progress our team has made in developing Aggre-Gator, we have successfully implemented most of the technical requirements planned in Chapter 2, though some components are still in development.

== Frontend Development
As outlined in Chapter 2, we built a static site with client-side interactivity using TypeScript. We've implemented all the core pages needed for an RSS reader, including:

- A home page that displays articles from all subscribed feeds
- A feed management page that allows users to add, view, and delete feeds
- An article detail page that displays the content of a selected article
- A bookmarks page for saved articles

== Backend Development
The backend components are still in active development. While we have designed the REST API specification for communication between the frontend and database, the actual implementation of the backend-api service is still in progress. Our API specification includes endpoints for:

- Managing user feed subscriptions
- Retrieving feed information and articles
- Handling bookmarks and read/unread states

The feed fetcher service, which will periodically update subscribed feeds, is also under development. We've completed the design phase but have yet to fully implement the service.

#{
  set par(justify: false)
  bibliography("bibliography.yml", style: citation-style, title: "References")
}
