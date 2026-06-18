#!/usr/bin/env bash
set -euo pipefail

TRUSTED_IP="${1:?Usage: allow-postgres-trusted-ip.sh TRUSTED_PUBLIC_IP}"

sudo ufw delete deny 5432/tcp || true
sudo ufw allow from "$TRUSTED_IP" to any port 5432 proto tcp
sudo ufw deny 5432/tcp
sudo ufw status verbose
