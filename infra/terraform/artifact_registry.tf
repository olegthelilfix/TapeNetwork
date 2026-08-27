resource "google_artifact_registry_repository" "docker" {
  location      = var.region
  repository_id = var.ar_repo_name
  description   = "Tape Network container images"
  format        = "DOCKER"

  depends_on = [google_project_service.enabled]
}
