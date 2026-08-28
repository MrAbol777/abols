#!/bin/sh
set -e

echo "🚀 [Hamravesh Darkube] Starting Abol Store container..."

# Ensure required persistent storage directories exist
mkdir -p /app/data/uploads/products /app/data/uploads/receipts /app/public/uploads/products /app/public/uploads/receipts

# Run Prisma database migrations to ensure tables exist
if [ -f "./prisma/schema.prisma" ]; then
  echo "📦 [Hamravesh Darkube] Checking and applying database migrations..."
  npx prisma migrate deploy || echo "⚠️ [Hamravesh Darkube] Migration note: could not apply migrations automatically. Continuing..."
fi

# Optional seed and admin setup if admin credentials are provided in Darkube environment variables
if [ -n "$ADMIN_PHONE" ] && [ -n "$ADMIN_PASSWORD" ]; then
  echo "🌱 [Hamravesh Darkube] Admin credentials detected. Ensuring admin user exists..."
  node make-admin.js || echo "⚠️ [Hamravesh Darkube] make-admin note: could not run make-admin."
  npm run db:seed || echo "ℹ️ [Hamravesh Darkube] Seed finished or already populated."
fi

echo "✨ [Hamravesh Darkube] Abol Store is ready! Starting web server on port ${PORT:-3000}..."
exec "$@"
