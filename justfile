_default:
    @just --list --unsorted --justfile "{{justfile()}}"

# Combine Typst report with resumes
report:
    cp $(nix build --no-link --print-out-paths .#final-report) ./report.pdf

# Remove ignored files
clean:
    rm report/main.pdf
    fd --no-ignore result --type symlink --exec rm

# Show all T_ODO and F_IXME comments
show-todos:
    rg -C 5 "T()ODO|F()IXME"

# Clear up space in podman (may be destructive!)
container-clean:
    podman container prune --force
    podman image prune --force

# Build the frontend container and import it into podman
container-load container:
    $(nix build --no-link --print-out-paths .#{{container}}-container-stream) | podman image load

# Run the frontend container with podman
frontend-run:
    podman run -it --rm \
        -v ./containers/devCert/:/cert/:ro \
        -p 5080:80 \
        -p 5443:443 \
        frontend-nginx

# Run the database container with podman
db-run:
    podman run -it --rm \
        -p 5432:5432 \
        db

