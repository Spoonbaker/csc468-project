_default:
    @just --list --unsorted --justfile "{{justfile()}}"

# Combine Typst report with resumes
report:
    cp $(nix build --no-link --print-out-paths .#final-report) ./report.pdf
# Remove ignored files
clean:
    rm report/main.pdf
    fd --no-ignore result --type symlink --exec rm
