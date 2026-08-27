output "vm_external_ip" {
  description = "Static public IP of the VM. Use it (or a domain pointing to it) as PUBLIC_HOST in GitHub."
  value       = google_compute_address.vm.address
}

output "vm_name" {
  value = google_compute_instance.vm.name
}

output "vm_zone" {
  value = var.zone
}

output "artifact_registry_host" {
  description = "Docker registry host — set as GCP_AR_HOST in GitHub."
  value       = "${var.region}-docker.pkg.dev"
}

output "artifact_registry_repo" {
  description = "Full image path prefix."
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${var.ar_repo_name}"
}

output "workload_identity_provider" {
  description = "Set as GCP_WIF_PROVIDER secret/var in GitHub."
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "deployer_service_account" {
  description = "Set as GCP_DEPLOYER_SA in GitHub."
  value       = google_service_account.deployer.email
}
