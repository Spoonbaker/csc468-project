_default:
    @just --list --unsorted --justfile "{{justfile()}}"

# Build the main contents of the report
typst-compile:
    typst compile report/main.typ report/main.pdf

# Combine Typst report with resumes
report: typst-compile
    # This one is evil, stinky, and bad
    # pdfunite report/main.pdf report/resumes/*.pdf report.pdf
    qpdf --empty --deterministic-id --pages report/main.pdf report/resumes/*.pdf -- report.pdf

# Remove ignored files
clean:
    rm report/main.pdf
    fd --no-ignore result --type symlink --exec rm
