#!/usr/bin/env bash
# 一键发布：构建 + 测试 + 推 GitHub + 发 npm
# 用法：  bash publish.sh                 # 默认 owner 取 git config user.name
#        OWNER=your-name bash publish.sh  # 指定 GitHub 用户名
#        SKIP_NPM=1 bash publish.sh       # 只推仓库，不发 npm
set -euo pipefail
cd "$(dirname "$0")"

REPO="${REPO:-dsh-pindou-pattern}"
OWNER="${OWNER:-$(git config user.name 2>/dev/null || echo '')}"
SKIP_NPM="${SKIP_NPM:-0}"

if [ -z "$OWNER" ]; then
  echo "请先设置 GitHub 用户名：OWNER=你的用户名 bash publish.sh" >&2
  exit 1
fi

echo "==> 1/4 构建与测试"
node build.mjs
node --check client.js
node test/engine.test.cjs

if [ -n "$(git status --porcelain)" ]; then
  echo "==> 提交工作区改动"
  git add -A
  git -c user.name="${GIT_NAME:-$OWNER}" -c user.email="${GIT_EMAIL:-$OWNER@users.noreply.github.com}" \
    commit -m "chore: release ${REPO} $(node -p "require('./package.json').version")"
fi

echo "==> 2/4 推送到 https://github.com/${OWNER}/${REPO}"
if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin "https://github.com/${OWNER}/${REPO}.git"
else
  git remote set-url origin "https://github.com/${OWNER}/${REPO}.git"
fi
if ! git push -u origin main; then
  cat >&2 <<EOF

推送失败。请先手动创建空仓库（不要初始化 README）：
  https://github.com/new?name=${REPO}&visibility=public
然后重跑：  bash publish.sh
EOF
  exit 1
fi

if [ "$SKIP_NPM" = "1" ]; then
  echo "==> 3/4 跳过 npm（SKIP_NPM=1）"
else
  echo "==> 3/4 发布 npm 包"
  if ! npm whoami >/dev/null 2>&1; then
    echo "==> 尚未登录 npm，请先执行：npm login" >&2
    exit 1
  fi
  npm publish
fi

echo "==> 4/4 完成"
cat <<EOF

接下来两步（手动，各 1 分钟）：
  1. 仓库 About → Topics 填 dsh-plugin（必须）
     https://github.com/${OWNER}/${REPO}
  2. 按 SUBMIT.md 第 4 节开 issue 提交收录
     https://github.com/dshplugin/dsh-plugin-hub/issues/new
EOF
