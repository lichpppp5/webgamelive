#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════
# Auto-deploy — runs after every `git pull` on the server
# (via .githooks/post-merge, enabled once with deploy/setup.sh).
#
#   1. npm ci when package-lock.json changed (frontend and/or server)
#   2. vite build into dist.new, then swap with dist (site never serves a half build)
#   3. restart the API server (pm2, or RESTART_CMD from deploy/deploy.local)
#
# If the build fails, the old dist is kept and the server is NOT restarted,
# so frontend and backend never go out of sync.
# Manual run:  bash deploy/update.sh          (only what changed since last pull)
#              FORCE=1 bash deploy/update.sh  (reinstall check + build + restart)
# ════════════════════════════════════════════════════════════════
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || exit 1
LOG="$ROOT/deploy/last-deploy.log"
exec > >(tee "$LOG") 2>&1

FORCE="${FORCE:-0}"
OLD="$(git rev-parse -q --verify ORIG_HEAD || true)"
[ -z "$OLD" ] && FORCE=1
# Optional server-specific settings (not in git), e.g.
#   RESTART_CMD="systemctl restart toollive"     how to restart the API (default: auto-detect pm2)
#   PUBLISH_DIR="/var/www/toollive"              if nginx serves a folder other than ./dist
[ -f deploy/deploy.local ] && . deploy/deploy.local

changed() {   # changed <paths...> → true if any path changed in this pull (always true with FORCE=1)
  [ "$FORCE" = 1 ] && return 0
  [ -n "$(git diff --name-only "$OLD" HEAD -- "$@" 2>/dev/null)" ]
}
deps_changed() {  # like changed, but FORCE does not reinstall working node_modules of a live server
  [ -n "$OLD" ] && [ -n "$(git diff --name-only "$OLD" HEAD -- "$@" 2>/dev/null)" ]
}
step() { echo; echo "── $* ──"; }

echo "Deploy $(date '+%F %T')  ${OLD:0:7} → $(git rev-parse --short HEAD)"

# 1. Dependencies
if deps_changed package.json package-lock.json || [ ! -d node_modules ]; then
  step "npm ci (frontend)"
  npm ci --no-audit --no-fund || { echo "❌ npm ci thất bại — dừng deploy, web vẫn chạy bản cũ."; exit 1; }
fi
if deps_changed server/package.json server/package-lock.json || [ ! -d server/node_modules ]; then
  step "npm ci (server)"
  (cd server && npm ci --omit=dev --no-audit --no-fund) || { echo "❌ npm ci (server) thất bại — dừng deploy."; exit 1; }
fi

# 2. Frontend build (atomic swap)
if changed src public index.html vite.config.js package.json package-lock.json || [ ! -d dist ]; then
  step "vite build"
  rm -rf dist.new
  if npx vite build --outDir dist.new --emptyOutDir; then
    rm -rf dist.old
    [ -d dist ] && mv dist dist.old
    mv dist.new dist
    rm -rf dist.old
    # Optional: nginx serves another folder → copy there with the same atomic swap
    if [ -n "${PUBLISH_DIR:-}" ]; then
      rm -rf "$PUBLISH_DIR.new" && cp -r dist "$PUBLISH_DIR.new" &&
        { [ -d "$PUBLISH_DIR" ] && mv "$PUBLISH_DIR" "$PUBLISH_DIR.old"; mv "$PUBLISH_DIR.new" "$PUBLISH_DIR" && rm -rf "$PUBLISH_DIR.old"; } &&
        echo "✅ Đã chép bản build sang $PUBLISH_DIR"
    fi
    echo "✅ Frontend đã cập nhật."
  else
    rm -rf dist.new
    echo "❌ Build lỗi — giữ nguyên frontend cũ, KHÔNG restart server."
    exit 1
  fi
fi

# 3. Restart API server
if changed server; then
  step "restart server"
  if [ -n "${RESTART_CMD:-}" ]; then
    eval "$RESTART_CMD" && echo "✅ Đã restart server ($RESTART_CMD)."
  elif command -v pm2 >/dev/null 2>&1; then
    # find the pm2 process that runs this repo's server/index.js
    ID="$(pm2 jlist 2>/dev/null | node -e '
      let s = ""; process.stdin.on("data", d => s += d).on("end", () => {
        try {
          const want = require("path").resolve(process.argv[1]);
          const p = JSON.parse(s).find(x => require("path").resolve(x.pm2_env.pm_exec_path || "") === want);
          if (p) process.stdout.write(String(p.pm_id));
        } catch {}
      });' "$ROOT/server/index.js")"
    if [ -n "$ID" ]; then
      pm2 reload "$ID" --update-env && echo "✅ Đã restart server (pm2 id $ID)."
    else
      echo "⚠️  Không thấy tiến trình pm2 chạy server/index.js."
      echo "   Đặt lệnh restart trong deploy/deploy.local, ví dụ:  RESTART_CMD=\"pm2 restart toollive-api\""
    fi
  else
    echo "⚠️  Không tìm thấy pm2. Tạo deploy/deploy.local với RESTART_CMD=\"<lệnh restart server của bạn>\"."
  fi
fi

echo; echo "🎉 Deploy xong."
