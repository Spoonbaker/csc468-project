# Which container engine to use
ENG := `which podman > /dev/null 2>&1 && echo podman || echo docker`

# prod: we're on Cloudlab or similar, deploying
# dev: local dev machine, might not have privs for ports <1024
# Override with `just ENV=prod <cmd>`
ENV := "dev"

_default:
    @just --list --unsorted --justfile "{{justfile()}}"

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
    $(nix build --no-link --print-out-paths .#{{container}}-container-stream) | {{ ENG }} image load

# Run docker-compose
compose +ARGS:
    {{ ENG }} compose \
        -f containers/docker-compose.yml \
        {{ if ENV == "dev" { "-f containers/docker-compose.dev.yml" } else { "" } }} \
        {{ARGS}}

# Load all images and start the deployment
deploy: (container-load "db") (container-load "backend-api") (container-load "frontend-nginx")
    # Having this as a recipe instead of dependency makes CTRL+C work
    @just --justfile "{{justfile()}}" compose up
