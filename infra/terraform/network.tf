# Uses the project's auto-created "default" VPC. Firewall rules are scoped to the
# VM via the network tag "tape".

resource "google_compute_address" "vm" {
  name   = "${var.vm_name}-ip"
  region = var.region

  depends_on = [google_project_service.enabled]
}

resource "google_compute_firewall" "http" {
  name    = "${var.vm_name}-allow-http"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["80", "443", "8080", "8081", "8082"] # web, (tls), backend API, cms, streamer
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["tape"]
}

resource "google_compute_firewall" "ssh_iap" {
  name    = "${var.vm_name}-allow-ssh-iap"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  # Only Google's IAP range by default — no public SSH exposure.
  source_ranges = var.ssh_source_ranges
  target_tags   = ["tape"]
}
