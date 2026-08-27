locals {
  gcp_apis = [
    "compute.googleapis.com",
    "artifactregistry.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "sts.googleapis.com",
    "iap.googleapis.com",
  ]
}

resource "google_project_service" "enabled" {
  for_each = toset(local.gcp_apis)

  service            = each.value
  disable_on_destroy = false
}
