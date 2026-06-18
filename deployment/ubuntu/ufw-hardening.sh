#!/usr/bin/env bash
set -euo pipefail

sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

sudo ufw deny 5432/tcp
sudo ufw deny 81/tcp
sudo ufw deny 9000/tcp
sudo ufw deny 3001/tcp

sudo ufw --force enable
sudo ufw status verbose
