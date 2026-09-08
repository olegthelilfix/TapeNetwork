# Minimal, no-project-admin stack. Creates only what compute perms allow:
# a static IP, a data disk, and the VM (running as an EXISTING service account).
#
# Firewall rules are NOT here — the terraform identity (dev-sa-terraform-vm) has
# networkAdmin, which cannot create firewalls. Create them once as yourself; see
# infra/README.md ("Variant 2").
#
# Images live in GHCR (not Artifact Registry), so the VM needs no GCP registry
# permissions. Auth to GCP uses your existing ADC (already impersonating the SA)
# — no provider-level impersonation here.

terraform {
  required_version = ">= 1.6.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

variable "project_id" {
  type    = string
  default = "schwab-433114"
}

variable "region" {
  type    = string
  default = "europe-west4"
}

variable "zone" {
  type    = string
  default = "europe-west4-a"
}

variable "vm_name" {
  type    = string
  default = "tape-vm"
}

variable "machine_type" {
  type    = string
  default = "c2d-standard-4"
}

variable "boot_disk_size_gb" {
  type    = number
  default = 30
}

variable "data_disk_size_gb" {
  type    = number
  default = 20
}

variable "vm_service_account" {
  type        = string
  description = "Existing SA the VM runs as (must be actAs-able by the terraform identity)."
  default     = "dev-sa-terraform-vm@schwab-433114.iam.gserviceaccount.com"
}

variable "ssh_user" {
  type    = string
  default = "deploy"
}

variable "ssh_public_key" {
  type        = string
  description = "Public key contents for the deploy user (generate with ssh-keygen)."
}

resource "google_compute_address" "vm" {
  name   = "${var.vm_name}-ip"
  region = var.region
}

resource "google_compute_disk" "data" {
  name = "${var.vm_name}-data"
  type = "pd-balanced"
  zone = var.zone
  size = var.data_disk_size_gb
}

resource "google_compute_instance" "vm" {
  name         = var.vm_name
  machine_type = var.machine_type
  zone         = var.zone
  tags         = ["tape"]

  # Machine-type changes require the VM to be stopped; let terraform stop/start it.
  allow_stopping_for_update = true

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = var.boot_disk_size_gb
      type  = "pd-balanced"
    }
  }

  attached_disk {
    source      = google_compute_disk.data.id
    device_name = "tape-data"
  }

  network_interface {
    network = "default"
    access_config {
      nat_ip = google_compute_address.vm.address
    }
  }

  service_account {
    email  = var.vm_service_account
    scopes = ["cloud-platform"]
  }

  metadata = {
    ssh-keys = "${var.ssh_user}:${var.ssh_public_key}"
  }

  metadata_startup_script = file("${path.module}/../deploy/startup-script.min.sh")

  lifecycle {
    ignore_changes = [boot_disk[0].initialize_params[0].image]
  }
}

output "vm_external_ip" {
  value = google_compute_address.vm.address
}
