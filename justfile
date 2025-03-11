# Which container engine to use

ENG := `which podman > /dev/null 2>&1 && echo podman || echo docker`

_default:
    @just --list --unsorted --justfile "{{ justfile() }}"

# Combine Typst report with resumes
report:
    cp $(nix build --no-link --print-out-paths .#final-report) ./report.pdf

# Remove ignored files
clean:
    rm report/main.pdf
    fd --no-ignore result --type symlink --exec rm

# Clear up space in podman/docker (may be destructive!)
containers-clean:
    {{ ENG }} container prune --force
    {{ ENG }} image prune --force

# Build the frontend container and import it into podman/docker
container-load container:
    $(nix build --no-link --print-out-paths .#{{ container }}-container-stream) | {{ ENG }} image load

# Run the frontend container with podman/docker
frontend-run:
    {{ ENG }} run -it --rm \
        -v ./containers/devCert/:/cert/:ro \
        -p 5080:80 \
        -p 5443:443 \
        frontend-nginx

# Run the database container with podman/docker
db-run:
    {{ ENG }} run -it --rm \
        -p 5432:5432 \
        db
