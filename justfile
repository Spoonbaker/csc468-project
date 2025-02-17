_default:
    @just --list --unsorted --justfile "{{justfile()}}"

# Combine Typst report with resumes
report:
    cp $(nix build --no-link --print-out-paths .#final-report) ./report.pdf

# Remove ignored files
clean:
    rm report/main.pdf
    fd --no-ignore result --type symlink --exec rm

# Build the frontend container and import it into podman
frontend-load:
    $(nix build --no-link --print-out-paths .#frontend-container-stream) | podman image load

frontend-run:
    podman run -it \
        -v ./containers/cert.crt:/cert/cert.crt:ro \
        -v ./containers/key.pem:/cert/key.pem:ro \
        -p 5080:80 \
        -p 5443:443 \
        frontend-nginx
    
