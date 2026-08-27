terraform {
  required_version = ">= 1.6.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }

  # State is local by default (terraform.tfstate in this dir). For team use,
  # move it to a GCS bucket — see infra/README.md ("Remote state").
  # backend "gcs" {
  #   bucket = "YOUR-TF-STATE-BUCKET"
  #   prefix = "tape/prod"
  # }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}
