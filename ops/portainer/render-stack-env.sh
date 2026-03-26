#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ops/portainer/render-stack-env.sh --check
  ops/portainer/render-stack-env.sh --output <path>

Required environment variables:
  ACME_EMAIL
  PUBLIC_BIND_IPV4
  SITE_HOST
  ADMIN_HOST
  SITE_BASE_URL
  ADMIN_BASE_URL
  PUBLIC_APP_URL
  NODE_ENV
  APP_ENV
  LOG_LEVEL
  POSTGRES_DB
  POSTGRES_USER
  POSTGRES_PASSWORD
  SESSION_SECRET
  SCRAPER_JOB_QUEUE
  QUEUE_CONCURRENCY
  WORKER_ROLE
  ALLOW_REAL_EMAIL_SEND
  ALLOW_REAL_WHATSAPP_SEND

Optional environment variables:
  EMAIL_PROVIDER_API_KEY
  WHATSAPP_PROVIDER_API_KEY
  SENTRY_DSN
EOF
}

required_vars=(
  ACME_EMAIL
  PUBLIC_BIND_IPV4
  SITE_HOST
  ADMIN_HOST
  SITE_BASE_URL
  ADMIN_BASE_URL
  PUBLIC_APP_URL
  NODE_ENV
  APP_ENV
  LOG_LEVEL
  POSTGRES_DB
  POSTGRES_USER
  POSTGRES_PASSWORD
  SESSION_SECRET
  SCRAPER_JOB_QUEUE
  QUEUE_CONCURRENCY
  WORKER_ROLE
  ALLOW_REAL_EMAIL_SEND
  ALLOW_REAL_WHATSAPP_SEND
)

check_required() {
  local missing=()
  local var

  for var in "${required_vars[@]}"; do
    if [[ -z "${!var:-}" ]]; then
      missing+=("$var")
    fi
  done

  if (( ${#missing[@]} > 0 )); then
    echo "Missing required deployment environment variables:" >&2
    printf '  - %s\n' "${missing[@]}" >&2
    exit 1
  fi
}

render_env_file() {
  cat <<EOF
ACME_EMAIL=${ACME_EMAIL}
PUBLIC_BIND_IPV4=${PUBLIC_BIND_IPV4}
SITE_HOST=${SITE_HOST}
ADMIN_HOST=${ADMIN_HOST}
SITE_BASE_URL=${SITE_BASE_URL}
ADMIN_BASE_URL=${ADMIN_BASE_URL}
PUBLIC_APP_URL=${PUBLIC_APP_URL}
NODE_ENV=${NODE_ENV}
APP_ENV=${APP_ENV}
LOG_LEVEL=${LOG_LEVEL}
POSTGRES_DB=${POSTGRES_DB}
POSTGRES_USER=${POSTGRES_USER}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
SESSION_SECRET=${SESSION_SECRET}
SCRAPER_JOB_QUEUE=${SCRAPER_JOB_QUEUE}
QUEUE_CONCURRENCY=${QUEUE_CONCURRENCY}
WORKER_ROLE=${WORKER_ROLE}
ALLOW_REAL_EMAIL_SEND=${ALLOW_REAL_EMAIL_SEND}
ALLOW_REAL_WHATSAPP_SEND=${ALLOW_REAL_WHATSAPP_SEND}
EMAIL_PROVIDER_API_KEY=${EMAIL_PROVIDER_API_KEY:-}
WHATSAPP_PROVIDER_API_KEY=${WHATSAPP_PROVIDER_API_KEY:-}
SENTRY_DSN=${SENTRY_DSN:-}
EOF
}

if (( $# == 0 )); then
  usage
  exit 1
fi

mode=""
output_path=""

while (( $# > 0 )); do
  case "$1" in
    --check)
      mode="check"
      shift
      ;;
    --output)
      mode="output"
      output_path="${2:-}"
      if [[ -z "$output_path" ]]; then
        echo "--output requires a path" >&2
        exit 1
      fi
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

check_required

case "$mode" in
  check)
    echo "portainer deploy environment inputs OK"
    ;;
  output)
    mkdir -p "$(dirname "$output_path")"
    render_env_file > "$output_path"
    echo "Wrote $output_path"
    ;;
  *)
    usage
    exit 1
    ;;
esac
