#!/bin/bash

# Script para sincronizar ICL desde cron de Linux
# Ejecutar el día 1 de cada mes a las 2:00 AM

CRON_SECRET="polarinmobiliaria"
API_URL="http://localhost:3000/api/internal/cron/sync-icl"

curl -X POST "$API_URL" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  >> /var/log/icl-sync.log 2>&1

# Para configurar en crontab:
# crontab -e
# Agregar línea:
# 0 2 1 * * /ruta/al/script/sync-icl.sh
