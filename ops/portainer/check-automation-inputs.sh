#!/usr/bin/env bash
set -euo pipefail

required_automation_vars=(
  PORTAINER_BASE_URL
  PORTAINER_ENDPOINT_ID
  PORTAINER_STACK_NAME
  PORTAINER_ACCESS_TOKEN
)

missing=()

for var in "${required_automation_vars[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    missing+=("$var")
  fi
done

if (( ${#missing[@]} > 0 )); then
  echo "Missing required Portainer automation inputs:" >&2
  printf '  - %s\n' "${missing[@]}" >&2

  if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
    {
      echo "## Missing Portainer automation inputs"
      echo
      printf -- '- `%s`\n' "${missing[@]}"
    } >> "$GITHUB_STEP_SUMMARY"
  fi

  exit 1
fi

echo "portainer automation inputs OK"
