# Infrastructure & Deployment

Build images in GitHub Actions → push to **GHCR** → deploy onto a single
**Compute Engine VM** running the stack with `docker compose`. Postgres runs as
a container on the VM with a persistent disk. Deploy is over **plain SSH** with
a key — no project-admin permissions required (compute-only).

```
infra/
  terraform-min/   # VM + data disk + static IP (plain compute perms, no WIF/AR)
  deploy/          # what runs ON the VM: prod compose + startup script
```

> This is the only live path. An earlier "full design" (Artifact Registry +
> Workload Identity Federation + IAP, under `infra/terraform/` + `deploy.yml`)
> was removed as dead code — it needed project-admin grants we don't have.

## Architecture

```
push to master ─▶ .github/workflows/deploy-vm.yml
   ├─ docker build backend/web/cms/streamer  (web & cms baked with prod URLs)
   ├─ push :<git-sha> + :latest      ─▶ ghcr.io/<owner>/tape-*
   └─ scp compose+.env, ssh (key) ─▶ VM:  docker login ghcr && compose pull && up -d
VM (Ubuntu 22.04): backend :8080 · web :80 · cms :8081 · streamer :8082 · postgres (internal)
                   persistent disk mounted at /opt/tape/data
```

## Prerequisites (once)

1. A GCP **project** with **billing enabled** (`schwab-433114`).
2. Install [`gcloud`](https://cloud.google.com/sdk/docs/install) and
   [`terraform`](https://developer.hashicorp.com/terraform/install), or use
   **Cloud Shell** (gcloud + ADC already configured — the simplest path).
3. Authenticate for Terraform (skip in Cloud Shell):
   ```bash
   gcloud auth application-default login
   gcloud config set project schwab-433114
   ```

## 1. Generate an SSH deploy key

```bash
ssh-keygen -t ed25519 -C tape-deploy -f ~/.ssh/tape_deploy -N ""
```

## 2. Create the VM (Terraform)

```bash
cd infra/terraform-min
cp terraform.tfvars.example terraform.tfvars   # paste ~/.ssh/tape_deploy.pub into ssh_public_key
terraform init
terraform apply
terraform output vm_external_ip
```

The instance defaults to **`c2d-standard-4`** (4 dedicated vCPU / 16GB) so
Gradle builds and FFmpeg transcode aren't CPU-throttled. Override with
`-var 'machine_type=e2-medium'` for the cheap 2-burstable-vCPU tier.

> Changing `machine_type` on an existing VM stops/starts it (already wired via
> `allow_stopping_for_update = true`). The static IP is unchanged, the data disk
> is untouched, and containers auto-recover via `restart: unless-stopped` — no
> re-deploy needed for a resize.

> First boot runs `startup-script.min.sh` (installs Docker, mounts the data
> disk). Give it a minute before the first deploy.

## 3. Open the firewall (run as YOURSELF — the SA can't create firewalls)

The terraform identity has `networkAdmin`, which can't create firewalls, so this
is a one-time manual step. `CLOUDSDK_AUTH_IMPERSONATE_SERVICE_ACCOUNT=` forces
your own identity (`compute.editor`) instead of the impersonated SA:

```bash
CLOUDSDK_AUTH_IMPERSONATE_SERVICE_ACCOUNT= gcloud compute firewall-rules create tape-allow-http \
  --project schwab-433114 --network default --direction INGRESS --action ALLOW \
  --rules tcp:80,tcp:443,tcp:8080,tcp:8081,tcp:8082 --source-ranges 0.0.0.0/0 --target-tags tape
```
```bash
CLOUDSDK_AUTH_IMPERSONATE_SERVICE_ACCOUNT= gcloud compute firewall-rules create tape-allow-ssh \
  --project schwab-433114 --network default --direction INGRESS --action ALLOW \
  --rules tcp:22 --source-ranges 0.0.0.0/0 --target-tags tape
```

> The firewall is NOT managed by terraform in this variant (by design). To change
> open ports later, edit rule `tape-allow-http` via `gcloud` — don't expect
> `terraform apply` to touch it.

## 4. A GHCR read token for the VM

Create a **classic** PAT with scope `read:packages`
(https://github.com/settings/tokens) — the VM uses it to pull private images.

## 5. Configure GitHub (Settings → Secrets and variables → Actions)

**Variables:** `VM_HOST` (= `vm_external_ip`), `SSH_USER` = `deploy`,
`PUBLIC_WEB_URL` = `http://<ip>`, `PUBLIC_API_URL` = `http://<ip>:8080`,
`CORS_ALLOWED_ORIGINS` = `http://<ip>,http://<ip>:8081`

**Secrets:** `SSH_PRIVATE_KEY` (contents of `~/.ssh/tape_deploy`),
`GHCR_READ_TOKEN` (the classic PAT), `POSTGRES_PASSWORD`, `JWT_SECRET`

## 6. Deploy

Push to `master` (or run the **Deploy (GHCR + SSH)** workflow). Then:

- Public site: `http://<vm_external_ip>`
- CMS: `http://<vm_external_ip>:8081`
- API / Swagger: `http://<vm_external_ip>:8080/swagger-ui.html`

The first deploy also makes the GHCR packages exist — if pulls 404, confirm the
packages are linked to the repo and the read token has `read:packages`.

## Notes & next steps

- **DNS/TLS**: v1 serves plain HTTP on the IP. To add a domain + HTTPS, point an
  A record at the IP and put Caddy/Traefik in front (auto Let's Encrypt), then
  swap the `PUBLIC_*` vars to `https://your-domain`. Rebuild is required because
  web/cms bake URLs at build time.
- **Backups**: Postgres data lives on the persistent disk (`/opt/tape/data/pg`).
  Add scheduled disk snapshots or `pg_dump` for real backups.
- **Cost**: `c2d-standard-4` + disks is roughly ~$140/mo on-demand (vs ~$28 for
  `e2-medium`). For a non-production simulation, `provisioning_model = SPOT`
  cuts this to ~$40–50/mo — resize-compatible. `terraform destroy` tears
  everything down.
- **Security note**: SSH (22) is open to `0.0.0.0/0` with key-only auth. Tighten
  `--source-ranges` if you have a fixed egress IP, and consider fail2ban.
