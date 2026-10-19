#!/usr/bin/env bash
set -euo pipefail
: "${DEPLOY_HOST:?Set DEPLOY_HOST repository variable}"
: "${DEPLOY_USER:?Set DEPLOY_USER repository variable}"
: "${DEPLOY_ROOT:?Set DEPLOY_ROOT repository variable}"
: "${DEPLOY_SSH_KEY:?Set DEPLOY_SSH_KEY secret}"
DEPLOY_KNOWN_HOSTS="${DEPLOY_KNOWN_HOSTS:-$(cat deploy/known_hosts)}"
: "${RELEASE_SHA:?Release commit is required}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
[[ "$DEPLOY_HOST" =~ ^[A-Za-z0-9.-]+$ ]] || { echo 'Invalid host'; exit 1; }
[[ "$DEPLOY_USER" =~ ^[a-z_][a-z0-9_-]*$ ]] || { echo 'Invalid deployment user'; exit 1; }
[[ "$DEPLOY_PORT" =~ ^[0-9]+$ ]] && (( DEPLOY_PORT >= 1 && DEPLOY_PORT <= 65535 )) || { echo 'Invalid port'; exit 1; }
[[ "$DEPLOY_ROOT" =~ ^/[A-Za-z0-9_/-]+$ && "$DEPLOY_ROOT" != / ]] || { echo 'Invalid deployment directory'; exit 1; }
[[ "$RELEASE_SHA" =~ ^[0-9a-f]{40}$ ]] || { echo 'Invalid release SHA'; exit 1; }
node scripts/check.mjs
keydir="$(mktemp -d)"
trap 'rm -rf "$keydir"' EXIT
printf '%s\n' "$DEPLOY_SSH_KEY" > "$keydir/key"
printf '%s\n' "$DEPLOY_KNOWN_HOSTS" > "$keydir/known_hosts"
chmod 700 "$keydir"
chmod 600 "$keydir/key" "$keydir/known_hosts"
ssh_opts=(-i "$keydir/key" -p "$DEPLOY_PORT" -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -o "UserKnownHostsFile=$keydir/known_hosts")
target="$DEPLOY_USER@$DEPLOY_HOST"
release="${DEPLOY_ROOT%/}/releases/$RELEASE_SHA"
ssh "${ssh_opts[@]}" "$target" "mkdir -p '$release'"
rsync -az --delete -e "ssh -i '$keydir/key' -p '$DEPLOY_PORT' -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile='$keydir/known_hosts'" dist/ "$target:$release/"
ssh "${ssh_opts[@]}" "$target" sh -s -- "$DEPLOY_ROOT" "$RELEASE_SHA" <<'REMOTE'
set -eu
root="${1%/}"
sha="$2"
release="$root/releases/$sha"
test -s "$release/index.html"
test -s "$release/app.js"
previous="$(readlink "$root/current" || true)"
printf '{"commit":"%s","deployedAt":"%s","transport":"ssh"}\n' "$sha" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$release/version.json"
ln -sfn "$release" "$root/.current-$sha"
mv -Tf "$root/.current-$sha" "$root/current"
if ! curl -fsS --max-time 15 http://127.0.0.1/version.json | grep -Fq "$sha" || ! curl -fsS --max-time 15 http://127.0.0.1/ >/dev/null; then
  if [ -n "$previous" ] && [ -d "$previous" ]; then
    ln -sfn "$previous" "$root/.rollback-$sha"
    mv -Tf "$root/.rollback-$sha" "$root/current"
  fi
  echo 'Health check failed; previous release restored when available' >&2
  exit 1
fi
printf 'Deployed and verified release %s\n' "$sha"
REMOTE
