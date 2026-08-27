# Infrastructure & Deployment

Build images in GitHub Actions → push to **Artifact Registry** → deploy onto a
single **Compute Engine VM** running the stack with `docker compose`. Postgres
runs as a container on the VM with a persistent disk. GitHub authenticates to GCP
via **Workload Identity Federation** (no long-lived keys).

```
infra/
  terraform/   # GCP resources (VM, Artifact Registry, network, IAM, WIF)
  deploy/      # what runs ON the VM: prod compose + startup script
```

## Architecture

```
push to master ─▶ .github/workflows/deploy.yml
   ├─ auth to GCP (WIF, keyless)
   ├─ docker build backend/web/cms  (web & cms baked with prod URLs)
   ├─ push :<git-sha> + :latest      ─▶ Artifact Registry
   └─ scp compose+.env, ssh (IAP) ─▶ VM:  docker compose pull && up -d
VM (Ubuntu 22.04): backend :8080 · web :80 · cms :8081 · postgres (internal)
                   persistent disk mounted at /opt/tape/data
```

## Prerequisites (once)

1. A GCP **project** with **billing enabled**. Note its project ID.
2. Install [`gcloud`](https://cloud.google.com/sdk/docs/install) and
   [`terraform`](https://developer.hashicorp.com/terraform/install) locally.
3. Authenticate for Terraform:
   ```bash
   gcloud auth application-default login
   gcloud config set project YOUR_PROJECT_ID
   ```

## 1. Provision GCP (Terraform)

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars   # then edit project_id
terraform init
terraform apply
```

Note the outputs — you'll need them for GitHub:

```bash
terraform output
```

| Output | Goes to GitHub as |
|---|---|
| `vm_external_ip` | (used to build the PUBLIC_* vars below) |
| `vm_name` | Variable `VM_NAME` |
| `vm_zone` | Variable `GCP_ZONE` |
| `artifact_registry_host` | Variable `GCP_AR_HOST` |
| `workload_identity_provider` | **Secret** `GCP_WIF_PROVIDER` |
| `deployer_service_account` | **Secret** `GCP_DEPLOYER_SA` |

> First boot runs the startup script (installs Docker, mounts the disk). Give it
> a minute before the first deploy.

## 2. Configure GitHub (repo → Settings → Secrets and variables → Actions)

**Variables** (not secret):

| Name | Example |
|---|---|
| `GCP_PROJECT_ID` | `my-gcp-project` |
| `GCP_REGION` | `europe-west3` |
| `GCP_ZONE` | `europe-west3-c` |
| `GCP_AR_HOST` | `europe-west3-docker.pkg.dev` |
| `GCP_AR_REPO` | `tape` |
| `VM_NAME` | `tape-vm` |
| `PUBLIC_WEB_URL` | `http://<vm_external_ip>` |
| `PUBLIC_API_URL` | `http://<vm_external_ip>:8080` |
| `CORS_ALLOWED_ORIGINS` | `http://<vm_external_ip>,http://<vm_external_ip>:8081` |

**Secrets:**

| Name | Value |
|---|---|
| `GCP_WIF_PROVIDER` | `workload_identity_provider` output |
| `GCP_DEPLOYER_SA` | `deployer_service_account` output |
| `POSTGRES_PASSWORD` | a strong password |
| `JWT_SECRET` | ≥ 32 bytes random |

## 3. Deploy

Push to `master` (or run the **Deploy** workflow manually). It builds, pushes,
and rolls the stack on the VM. Then:

- Public site: `http://<vm_external_ip>`
- CMS: `http://<vm_external_ip>:8081`
- API / Swagger: `http://<vm_external_ip>:8080/swagger-ui.html`

## Notes & next steps

- **DNS/TLS**: v1 serves plain HTTP on the IP. To add a domain + HTTPS, point an
  A record at the IP and put Caddy/Traefik in front (auto Let's Encrypt), then
  swap the `PUBLIC_*` vars to `https://your-domain`. Rebuild is required because
  web/cms bake URLs at build time.
- **Remote state**: state is local by default. For team use, create a GCS bucket
  and uncomment the `backend "gcs"` block in `versions.tf`, then `terraform init
  -migrate-state`.
- **Backups**: Postgres data lives on the persistent disk (`/opt/tape/data/pg`).
  Add scheduled disk snapshots or `pg_dump` for real backups.
- **Cost**: an `e2-medium` + disks is roughly the low-tens-of-USD/month range;
  `terraform destroy` tears everything down.
