#!/bin/sh
set -e

echo "🚀 [Hamravesh Darkube] Starting Abol Store container..."

# Ensure required persistent storage directories exist for uploads
mkdir -p /app/data/uploads/products /app/data/uploads/receipts /app/public/uploads/products /app/public/uploads/receipts

# Run Prisma schema push to ensure Supabase PostgreSQL tables are in sync
if [ -f "./prisma/schema.prisma" ]; then
  echo "📦 [Hamravesh Darkube] Syncing database schema with Supabase PostgreSQL..."
  npx prisma db push --skip-generate || echo "⚠️ [Hamravesh Darkube] Note: db push failed or skipped."
fi

# Optional admin setup if admin credentials are provided
if [ -n "$ADMIN_PHONE" ] && [ -n "$ADMIN_PASSWORD" ]; then
  echo "🌱 [Hamravesh Darkube] Admin credentials detected. Ensuring admin user exists in Supabase..."
  node make-admin.js || echo "⚠️ [Hamravesh Darkube] make-admin note: could not run make-admin."
fi

echo "✨ [Hamravesh Darkube] Abol Store is ready! Starting web server on port ${PORT:-3000}..."
exec "$@"
