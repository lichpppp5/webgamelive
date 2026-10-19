#!/usr/bin/env bash
# ONE-TIME setup on the server. After this, `git pull` alone deploys everything.
#   cd /path/to/webgamelive && git pull && bash deploy/setup.sh
set -e
cd "$(dirname "$0")/.."
git config core.hooksPath .githooks
chmod +x .githooks/post-merge deploy/update.sh
echo "✅ Đã bật auto-deploy: từ giờ chỉ cần 'git pull'."
echo "Chạy deploy lần đầu..."
FORCE=1 bash deploy/update.sh
