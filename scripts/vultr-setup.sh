#!/bin/bash
# Run this ONCE on a fresh Vultr Ubuntu 22.04 VPS as root
# Usage: bash vultr-setup.sh

set -e

APP_DIR="/var/www/rusilstream"
APP_USER="rusilstream"
NODE_VERSION="20"

echo "==> Updating system..."
apt-get update -qq && apt-get upgrade -y -qq

echo "==> Adding 1GB swap (helps with npm build on 1GB RAM)..."
fallocate -l 1G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

echo "==> Installing Node.js $NODE_VERSION..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt-get install -y nodejs

echo "==> Installing nginx, git, certbot..."
apt-get install -y nginx git certbot python3-certbot-nginx ufw

echo "==> Installing PM2..."
npm install -g pm2

echo "==> Creating app user..."
id -u $APP_USER &>/dev/null || useradd -m -s /bin/bash $APP_USER

echo "==> Creating app directory..."
mkdir -p $APP_DIR
chown -R $APP_USER:$APP_USER $APP_DIR

echo "==> Setting up firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> Writing nginx config..."
cat > /etc/nginx/sites-available/rusilstream << 'NGINX'
server {
    listen 80;
    server_name rusilstream.app www.rusilstream.app api.rusilstream.app;

    # Cloudflare real IP
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 131.0.72.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    set_real_ip_from 2400:cb00::/32;
    set_real_ip_from 2606:4700::/32;
    set_real_ip_from 2803:f800::/32;
    set_real_ip_from 2405:b500::/32;
    set_real_ip_from 2405:8100::/32;
    set_real_ip_from 2a06:98c0::/29;
    set_real_ip_from 2c0f:f248::/32;
    real_ip_header CF-Connecting-IP;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
        proxy_connect_timeout 10s;
    }

    # Block direct IP access (force Cloudflare)
    if ($http_cf_ray = "") {
        return 444;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/rusilstream /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "==> Setting up PM2 startup..."
pm2 startup systemd -u $APP_USER --hp /home/$APP_USER | tail -1 | bash

echo "==> Creating deploy script..."
cat > /home/$APP_USER/deploy.sh << 'DEPLOY'
#!/bin/bash
set -e
APP_DIR="/var/www/rusilstream"
cd $APP_DIR

echo "[deploy] Pulling latest code..."
git pull origin main

echo "[deploy] Installing dependencies..."
npm install --workspace=apps/web --workspace=packages/shared

echo "[deploy] Building..."
cd apps/web && npm run build && cd ../..

echo "[deploy] Restarting app..."
pm2 restart rusilstream || pm2 start apps/web/node_modules/.bin/next \
  --name rusilstream \
  --cwd apps/web \
  -- start -p 3000

pm2 save
echo "[deploy] Done!"
DEPLOY

chmod +x /home/$APP_USER/deploy.sh
chown $APP_USER:$APP_USER /home/$APP_USER/deploy.sh

echo ""
echo "✓ Server setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your SSH public key:  cat ~/.ssh/id_rsa.pub >> /home/rusilstream/.ssh/authorized_keys"
echo "2. Clone your repo:          su - rusilstream && git clone https://github.com/YOUR/REPO /var/www/rusilstream"
echo "3. Create .env.local:        nano /var/www/rusilstream/apps/web/.env.local"
echo "4. Run first deploy:         su - rusilstream && bash ~/deploy.sh"
echo "5. Point rusilstream.app DNS to this server IP in Cloudflare (proxy ON)"
echo "6. SSL is handled by Cloudflare — set SSL mode to 'Full' in Cloudflare dashboard"
