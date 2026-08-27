#!/usr/bin/env bash
# Minimal VM bootstrap for Variant 2: Docker + Compose and the mounted data disk.
# No gcloud / Artifact Registry wiring — images come from GHCR, and the deploy
# workflow does `docker login ghcr.io` over SSH.
set -euxo pipefail

export DEBIAN_FRONTEND=noninteractive

# --- Docker Engine + Compose plugin ---
if ! command -v docker >/dev/null 2>&1; then
  apt-get update
  apt-get install -y ca-certificates curl gnupg
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
fi

# Let the deploy user run docker without sudo.
usermod -aG docker deploy || true

# --- Mount the persistent data disk at /opt/tape/data ---
DISK=/dev/disk/by-id/google-tape-data
mkdir -p /opt/tape/data
if ! blkid "$DISK" >/dev/null 2>&1; then
  mkfs.ext4 -m 0 -F "$DISK"
fi
grep -q "/opt/tape/data" /etc/fstab || \
  echo "$DISK /opt/tape/data ext4 discard,defaults,nofail 0 2" >> /etc/fstab
mount -a
mkdir -p /opt/tape/data/pg /opt/tape/data/media /opt/tape/data/search
chmod -R 777 /opt/tape/data/media /opt/tape/data/search

# App directory the deploy pipeline scp's compose.yml + .env into.
mkdir -p /opt/tape
chown deploy:deploy /opt/tape
