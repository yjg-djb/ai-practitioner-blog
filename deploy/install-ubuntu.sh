#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$APP_DIR/.env.production"
SERVICE_NAME="ai-practitioner-blog"
SITE_NAME="$SERVICE_NAME"
APP_USER="${SUDO_USER:-$USER}"

read_env() {
  local key="$1"
  local default_value="${2:-}"
  local value

  value="$(grep -E "^${key}=" "$ENV_FILE" | tail -n 1 | cut -d= -f2- || true)"
  value="${value%\"}"
  value="${value#\"}"
  value="${value%\'}"
  value="${value#\'}"

  if [[ -n "$value" ]]; then
    printf '%s' "$value"
    return
  fi

  printf '%s' "$default_value"
}

extract_host() {
  local url="$1"

  url="${url#http://}"
  url="${url#https://}"
  url="${url%%/*}"
  url="${url%%:*}"

  if [[ -n "$url" ]]; then
    printf '%s' "$url"
    return
  fi

  printf '_'
}

ensure_node_22() {
  if command -v node >/dev/null 2>&1 && node -v | grep -Eq '^v22\.'; then
    return
  fi

  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
}

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  echo "Run: cp .env.example .env.production"
  echo "Then edit .env.production with your API key and public URL."
  exit 1
fi

sudo apt-get update
sudo apt-get install -y nginx ca-certificates curl
ensure_node_22

cd "$APP_DIR"
npm ci
npm run build

PORT="$(read_env PORT 3000)"
APP_URL="$(read_env APP_URL "")"
SERVER_NAME="$(extract_host "$APP_URL")"
NODE_BIN="$(command -v node)"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
NGINX_FILE="/etc/nginx/sites-available/${SITE_NAME}"

sudo tee "$SERVICE_FILE" > /dev/null <<EOF
[Unit]
Description=AI Practitioner Blog
After=network.target

[Service]
Type=simple
User=${APP_USER}
WorkingDirectory=${APP_DIR}
Environment=NODE_ENV=production
ExecStart=${NODE_BIN} ${APP_DIR}/server.mjs
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo tee "$NGINX_FILE" > /dev/null <<EOF
server {
    listen 80;
    server_name ${SERVER_NAME};

    location / {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_request_buffering off;
        proxy_cache off;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

sudo ln -sfn "$NGINX_FILE" "/etc/nginx/sites-enabled/${SITE_NAME}"
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t

sudo systemctl daemon-reload
sudo systemctl enable --now "$SERVICE_NAME"
sudo systemctl restart "$SERVICE_NAME"
sudo systemctl enable --now nginx
sudo systemctl reload nginx

echo
echo "Deployment finished."
echo "App directory: $APP_DIR"
echo "Service: $SERVICE_NAME"
echo "URL: ${APP_URL:-http://$(hostname -I | awk '{print $1}')}"
echo
sudo systemctl --no-pager --full status "$SERVICE_NAME" | sed -n '1,12p'
