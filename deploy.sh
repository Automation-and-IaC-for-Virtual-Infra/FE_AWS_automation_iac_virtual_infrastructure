#!/bin/bash

# DỪNG NGAY nếu có bất kỳ lệnh nào thất bại
set -e

# --- QUAN TRỌNG: Kích hoạt NVM ---
# Tìm và chạy nvm.sh để load các lệnh npm, node, pm2
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# -----------------------------------
# BẮT ĐẦU CÁC LỆNH DEPLOY
# -----------------------------------

echo "📂 Đang chuyển tới thư mục /home/ubuntu/frontend"
cd /home/ubuntu/frontend

echo "📦 Đang giải nén build.zip..."
unzip -o build.zip

echo "📦 Đang cài đặt dependencies (npm ci)..."
npm ci --omit=dev

echo "🏗️ Đang build lại dự án Next.js trên EC2..."
npm run build

echo "🚀 Đang khởi động/reload ứng dụng với PM2..."
# Dùng "reload": Nếu app đang chạy, nó sẽ reload (zero-downtime)
# "||": Nếu reload thất bại (vì app chưa chạy), nó sẽ "start"
pm2 reload frontend || pm2 start npm --name frontend -- run start -- -H 0.0.0.0

# Lưu lại danh sách process của PM2 để tự khởi động khi reboot
pm2 save

echo "✅ Hoàn tất deploy!"
