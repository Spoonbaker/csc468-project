#let teamName = "Aggre-Gator"
#let authors = (
  "Ellis Weaver-Kreider",
  "Yanxi Wei",
  "Chris Ross",
  "Gus Johannesen",
)
#let course = [CSC 468 #sym.dash Introduction to Cloud Computing]
// Team Name Ideas:
// Feed the Beast
// The Hand that Feeds You
// Feed Your Mind
// Feed Between the Lines
// Feed It and Weep
// Aggre-gator

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


#counter(page).update(0) // Page 1 is after title page
// TODO: readers don't seem to like this being 0

// Title page
#{
  set align(center + horizon)
  show heading.where(level: 1): set text(1.5em)
  show heading.where(level: 2): set text(weight: "regular", style: "italic")
  set par(justify: true) // This is here in case the global justify is removed

  [
    = #teamName
    An RSS & Atom Feed Reader

    // Box allows short line to justify properly
    #box(width: 17em, // Hardcoding 17em is bad, but it works
      smallcaps(
        authors.join(", ", last: ", and ") + linebreak(justify: true)
        // By default the last line is not justified
      )
    )

    #course \
    Dr. Linh B. Ngo #sym.dash.em Spring 2025 \ // Alternatively, we could do #strong(sym.dot.c)
    West Chester University of Pennsylvania \

    #v(4 * 1.65em)

    == Abstract
    Hello I am an abstract yes I am yes sir-ee. #lorem(9) // TODO: write this
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

    emph(course)
  },
  footer: align(right, context counter(page).display("1")),
  numbering: "1", // Adds metadata to the PDF
)

// https://github.com/typst/typst/pull/3571#issuecomment-1983791852
// #let big(img) = context {
//   let size = measure(img)
//   set image(width: size.width, height: size.height)
//   img
// }



= Chapter 1
Chapter 1 describes your team’s vision. This is simply a design document (similar to the second
figure in slide 1, Introduction to Cloud Computing).

#image("elliance-power-of-rss.gif", width: 50%) // TODO: figure

= Chapter 2
Chapter 2 provides a detailed description about what your team propose to do to address the
technical requirements above

#image("diagram.png") // TODO: typst diagram? export full diagram as SVG?


= Reference page
Not sure what this is.
Do we put a GH link here?

= Lorem Ipsum Text for Filler
#lorem(1000)
