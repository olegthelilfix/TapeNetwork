variable "project_id" {
  type        = string
  description = "GCP project ID to deploy into (billing must be enabled)."
}

variable "region" {
  type        = string
  description = "GCP region."
  default     = "europe-west4" # Netherlands (matches gcloud config)
}

variable "zone" {
  type        = string
  description = "GCP zone."
  default     = "europe-west4-a"
}

variable "impersonate_service_account" {
  type        = string
  description = "Optional SA email for Terraform to impersonate (leave empty to use your ADC identity directly). Set this to match your gcloud auth/impersonate_service_account."
  default     = ""
}

variable "github_repo" {
  type        = string
  description = "owner/repo allowed to authenticate via Workload Identity Federation."
  default     = "olegthelilfix/TapeNetwork"
}

variable "vm_name" {
  type        = string
  description = "Compute Engine instance name."
  default     = "tape-vm"
}

variable "machine_type" {
  type        = string
  description = "Compute Engine machine type."
  default     = "e2-medium"
}

variable "boot_disk_size_gb" {
  type        = number
  description = "Boot disk size (GB)."
  default     = 30
}

variable "data_disk_size_gb" {
  type        = number
  description = "Persistent data disk (Postgres + media + search) size (GB)."
  default     = 20
}

variable "ar_repo_name" {
  type        = string
  description = "Artifact Registry repository name (Docker)."
  default     = "tape"
}

variable "ssh_source_ranges" {
  type        = list(string)
  description = "CIDRs allowed for SSH. Default is Google's IAP range only (no public SSH)."
  default     = ["35.235.240.0/20"]
}
