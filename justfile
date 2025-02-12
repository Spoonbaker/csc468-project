_default:
    @just --list --unsorted --justfile "{{justfile()}}"

# Remove ignored files
clean:
    fd --no-ignore result --type symlink --exec rm
