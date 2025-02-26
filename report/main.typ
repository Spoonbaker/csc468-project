#let teamName = "Aggre-Gator"
#let authors = (
  "Gus Johannesen",
  "Chris Ross",
  "Ellis Weaver-Kreider",
  "Yanxi Wei",
)
#let rssFig = true

#set document(
  title: teamName,
  author: authors,
  date: datetime( // TODO: update for each deliverable
    month: 2,
    day: 9,
    year: 2025,
  ),
)

#set page(paper: "us-letter", margin: 1in)
#set par(leading: 0.65em)
#set text(font: "New Computer Modern", size: 12pt)
// Dr. Ngo says 11-point, but 12pt is exactly 1/6 inch, which I like better

#set par(justify: true)
// Not completely sure if global like this is the way to go or not

#show link: underline
#show link: set text(blue)


#counter(page).update(0) // Page 1 is after title page
// TODO: readers don't seem to like this being 0

// Title page
#{
  set align(center + horizon)
  show heading.where(level: 1): set text(2.5em)
  show heading.where(level: 2): set text(weight: "regular", style: "italic")
  set par(spacing: 2em)
  set par(justify: true) // This is here in case the global justify is removed

  [
    // TODO: logo

    = #teamName
    #text(1.5em)[_An RSS & Atom Feed Reader_]

    #grid(
      // columns: (1fr, 1fr),
      columns: 2,
      // align: (right, left),
      inset: 0.5em,
      ..(authors.map(smallcaps))
    )

    CSC 468 -- Introduction to Cloud Computing \
    Dr. Linh B. Ngo --- Spring 2025 \ // Alternatively, we could do #strong(sym.dot.c)
    West Chester University of Pennsylvania \

    #v(4 * 1.65em)

    == Overview
    Many sites publish RSS or Atom feeds, including YouTube, GitHub, and many
    others. An RSS reader allows a user to subscribe to several of these feeds,
    and displays updates. #if rssFig [This has a number of benefits, as seen
    in @elliance.] We propose a web-based reader, #teamName, that syndicates
    an arbitrary number of RSS and Atom feeds, presents them in a user-friendly
    way, and syncs across devices.
  ]
  pagebreak()
}

// Begin header & page numbering after title page
#set page(
  header: {
    emph(teamName)
    // h(1fr)
    box(
      align(center + horizon)[
        #line(length: 90%, stroke: 0.25pt)
      ],
      width: 1fr, height: 0.6em
    ) // TODO: do we want the line?

    emph[CSC 468]
  },
  footer: align(right, context counter(page).display("1")),
  numbering: "1", // Adds metadata to the PDF
)

#if rssFig [
  #figure(
    image(
      "elliance-power-of-rss.gif",
      width: 50%
    ),
    caption: [The benefits of RSS]
  ) <elliance>
]

= Chapter 1
The core functionality of #teamName will be fairly similar to other local
application feed readers. However, it will have some notable differences on
account of being cloud-based. The basic function of an RSS/Atom reader is:

- The user configures a list of feeds they are interested in.
- The user instructs the reader to refresh the feeds.
- The reader fetches a list of articles from each feed.
- The reader presents the articles to the user, both as a link and potentially as content.
- The reader saves the articles for later viewing.

Being cloud-based adds additional advantages:

- We can refresh feeds in the background, between site visits, so the user doesn't miss articles.
- Instead of a local application tied to a specific operating system or platform, our app is accessible everywhere.
- Your subscriptions and article library follow you between devices.

This describes our general goal for the project. However, if we finish this
early, there are some additional features on our wishlist, time permitting:

- SSO user accounts with Google and/or GitHub login
- Exporting an aggregate feed to external feed readers
- Bookmarking articles to save them for later
- Web push notifications for select feeds
- Sending articles from your feeds to other users
- Production-grade deployment
  - All physical nodes running NixOS
  - Multi-node Kubernetes clusters
  - Geographically distributed - potentially South Carolina, Utah, France
  - Fully automated - instantiating CloudLab profile deploys everything
- A second sillier, overcomplicated deployment strategy

#if not rssFig {pagebreak()}

= Chapter 2
In terms of implementing our vision, we decided to split the project into
frontend and backend blocks, as seen in @design. In order to ease deployment,
the frontend is a static site with client-side interactivity. We have created
a container to serve the frontend, which contains nothing but NGINX and
its libraries and the content to serve. The backend will consist of three
(potentially subject to change) containers: the database, the API, and the feed
fetcher.

== Frontend
Because the frontend is a static site, we have considerable flexibility
deploying it. Currently, we simply serve it with NGINX, but we have the
flexibility to serve it using a CDN or with any sort of intermediate caching.
In addition, we can set all assets except HTML and the favicon (and _maybe_
a couple other things) to be cached indefinitely in the browser, which both
increases load times and decreases the load on our servers, potentially quite
significantly.

The reason we can cache the majority of assets is because the names are
hash-based. This is because we use a build tool called Vite. Vite also bundles
and minifies all assets for us. We also use Lightning CSS, a CSS processor and
`vite-imagetools`, which optimizes images for size.

Instead of plain JavaScript, we opted to use Typescript for better error
checking and IDE integration. We also have ESLint set up to catch errors and
mistakes that the Typescript compiler might miss.  Given that we don't need
to manage any client-side UI state, we didn't use a Javascript framework. For
styling, we are using Tailwind CSS with WCU theme colors.

== Backend
The backend will consist of three parts: the database, the API, and the feed
fetcher. The current plan is for the NGINX container serving the frontend
to proxy requests to the API server. This means that SSL configuration
is centralized, and is all around simpler than hosting the API completely
separately. This API will allow the frontend to communicate with the database.

For the database, we will use Postgres, at least initially. Postgres has the
ability to store text data such as article content in the `text` type, and,
should we need it, can also store JSON efficiently and in a queryable manner
in the `jsonb` type. We believe that for this project, any document-style data
is best stored in a battle-tested DBMS like Postgres, as opposed to a dedicated
document-only database like Mongo. If we have the time to have multiple global
points of presence, we may consider a different DBMS.

Also note that in @design below, the *User DB* and the *Article & Feed DB* will
most likely be in the same Postgres instance for simplicity.

The feed fetcher will periodically get a list of feeds to refresh from the User
DB, fetch the content from the web, and store the result in the Article & Feed
DB. Having this as a separate component will hopefully allow us to scale it
separately from other parts of the backend.

#figure(
  image("diagram.svg"),
  caption: [Design of #teamName]
) <design>

== Team Organization and Management
Yanxi and Chris will make up the Frontend Team and be responsible for both
the design and implementation of the web UI. Ellis will be responsible for
deployment and will work on the backend. Gus will work on the integration of the
backend and frontend, contributing some to both, and potentially also working on
testing and quality assurance.

The project is being developed in
#link("https://github.com/Spoonbaker/csc468-project")[GitHub].
We will track work and any bugs with issues. We also have a
#link("https://github.com/users/Spoonbaker/projects/1/views/7")[Github Project]
which integrates with issues to provide a more focused, actionable dashboard
than simply searching through issues.

We plan to do development in individual or team feature branches, and use PRs
to merge completed features. This ensures proper code review, while enabling the
group to work efficiently on several things at once.


// = References
// TODO: cite:
// Build tools
// GH repo
// GH project
// 
