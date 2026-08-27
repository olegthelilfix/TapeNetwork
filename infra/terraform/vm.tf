resource "google_compute_disk" "data" {
  name = "${var.vm_name}-data"
  type = "pd-balanced"
  zone = var.zone
  size = var.data_disk_size_gb

  depends_on = [google_project_service.enabled]
}

resource "google_compute_instance" "vm" {
  name         = var.vm_name
  machine_type = var.machine_type
  zone         = var.zone
  tags         = ["tape"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = var.boot_disk_size_gb
      type  = "pd-balanced"
    }
  }

  attached_disk {
    source      = google_compute_disk.data.id
    device_name = "tape-data" # exposed as /dev/disk/by-id/google-tape-data
  }

  network_interface {
    network = "default"
    access_config {
      nat_ip = google_compute_address.vm.address
    }
  }

  service_account {
    email  = google_service_account.vm.email
    scopes = ["cloud-platform"]
  }

  metadata = {
    enable-oslogin = "TRUE"
  }

  metadata_startup_script = templatefile("${path.module}/../deploy/startup-script.sh", {
    region = var.region
  })

  # Data disk must never be wiped by an image refresh; keep it independent.
  lifecycle {
    ignore_changes = [boot_disk[0].initialize_params[0].image]
  }

  depends_on = [
    google_project_iam_member.vm_ar_reader,
  ]
}
