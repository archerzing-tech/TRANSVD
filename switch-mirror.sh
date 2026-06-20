#!/bin/bash
# macOS 国内镜像一键切换脚本
# 用法: source ./switch-mirror.sh [ustc|tuna|aliyun]

set -e

SHELL_RC="$HOME/.zshrc"

declare -A MIRRORS
MIRRORS["tuna_brew"]="https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/brew.git"
MIRRORS["tuna_core"]="https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/homebrew-core.git"
MIRRORS["tuna_bottle"]="https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles"
MIRRORS["tuna_api"]="https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles/api"
MIRRORS["tuna_pip"]="https://pypi.tuna.tsinghua.edu.cn/simple"

MIRRORS["ustc_brew"]="https://mirrors.ustc.edu.cn/brew.git"
MIRRORS["ustc_core"]="https://mirrors.ustc.edu.cn/homebrew-core.git"
MIRRORS["ustc_bottle"]="https://mirrors.ustc.edu.cn/homebrew-bottles"
MIRRORS["ustc_api"]="https://mirrors.ustc.edu.cn/homebrew-bottles/api"
MIRRORS["ustc_pip"]="https://pypi.mirrors.ustc.edu.cn/simple"

MIRRORS["aliyun_brew"]="https://mirrors.aliyun.com/homebrew/brew.git"
MIRRORS["aliyun_core"]="https://mirrors.aliyun.com/homebrew/homebrew-core.git"
MIRRORS["aliyun_bottle"]="https://mirrors.aliyun.com/homebrew/homebrew-bottles"
MIRRORS["aliyun_api"]="https://mirrors.aliyun.com/homebrew/homebrew-bottles/api"
MIRRORS["aliyun_pip"]="https://mirrors.aliyun.com/pypi/simple"

choose_source() {
  echo "========================================"
  echo "  macOS 镜像源切换工具"
  echo "========================================"
  echo "1) 清华 TUNA    (推荐: 教育网优先)"
  echo "2) 中科大 USTC  (推荐: 稳定)"
  echo "3) 阿里云       (推荐: 宽带用户)"
  echo "4) 恢复官方源"
  echo "----------------------------------------"
  read -p "请选择 [1-4]: " choice
  echo ""

  case "$choice" in
    1) apply "tuna" ;;
    2) apply "ustc" ;;
    3) apply "aliyun" ;;
    4) reset_official ;;
    *) echo "无效选择"; exit 1 ;;
  esac
}

apply() {
  local prefix="$1"
  echo "切换到 ${prefix} 镜像..."

  # 写入 shell profile
  cat > /tmp/brew_mirror.sh <<EOF
export HOMEBREW_API_DOMAIN="${MIRRORS[${prefix}_api]}"
export HOMEBREW_BOTTLE_DOMAIN="${MIRRORS[${prefix}_bottle]}"
export HOMEBREW_BREW_GIT_REMOTE="${MIRRORS[${prefix}_brew]}"
export HOMEBREW_CORE_GIT_REMOTE="${MIRRORS[${prefix}_core]}"
export HOMEBREW_PIP_INDEX_URL="${MIRRORS[${prefix}_pip]}"
EOF

  # 删除旧的 brew mirror 配置行，插入新的
  if [[ -f "$SHELL_RC" ]]; then
    sed -i '' '/^export HOMEBREW_\(API_DOMAIN\|BOTTLE_DOMAIN\|BREW_GIT_REMOTE\|CORE_GIT_REMOTE\|PIP_INDEX_URL\)=/d' "$SHELL_RC"
    cat /tmp/brew_mirror.sh >> "$SHELL_RC"
  fi

  # 当前 shell 生效
  source /tmp/brew_mirror.sh
  rm /tmp/brew_mirror.sh

  # 更新 Homebrew
  brew update-reset 2>/dev/null || brew update 2>/dev/null || true

  echo ""
  echo "========================================"
  echo "  已切换到 ${prefix} 镜像源 ✓"
  echo "  当前配置:"
  echo "    BREW_GIT_REMOTE: ${MIRRORS[${prefix}_brew]}"
  echo "    BOTTLE_DOMAIN:   ${MIRRORS[${prefix}_bottle]}"
  echo "========================================"
}

reset_official() {
  echo "恢复官方源..."
  sed -i '' '/^export HOMEBREW_\(API_DOMAIN\|BOTTLE_DOMAIN\|BREW_GIT_REMOTE\|CORE_GIT_REMOTE\|PIP_INDEX_URL\)=/d' "$SHELL_RC"
  unset HOMEBREW_API_DOMAIN HOMEBREW_BOTTLE_DOMAIN HOMEBREW_BREW_GIT_REMOTE HOMEBREW_CORE_GIT_REMOTE HOMEBREW_PIP_INDEX_URL
  brew update-reset 2>/dev/null || brew update 2>/dev/null || true
  echo "已恢复官方源 ✓"
}

# 如果带参数执行，直接切换；否则交互选择
case "${1:-}" in
  ustc|tuna|aliyun) apply "$1" ;;
  official|reset) reset_official ;;
  *) choose_source ;;
esac
