# 使用官方 Nginx 映像作為基礎映像
FROM nginx:stable-alpine

# 複製打包好的 dist 目錄到 Nginx 的預設靜態文件目錄
COPY ./dist /usr/share/nginx/html

# 替換 Nginx 的默認配置文件（可選）
COPY ./nginx.conf /etc/nginx/nginx.conf

# 曝露 Nginx 服務的 80 端口
EXPOSE 80

# 啟動 Nginx
CMD ["nginx", "-g", "daemon off;"]
