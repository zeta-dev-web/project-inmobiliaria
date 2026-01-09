# Configuración de Cron para Sincronización ICL

## Variables de Entorno

Agregar en `.env`:

```env
CRON_SECRET=tu-secret-seguro-aqui
```

## Configuración en VPS Linux

### 1. Dar permisos de ejecución al script

```bash
chmod +x /ruta/al/proyecto/scripts/sync-icl.sh
```

### 2. Editar el script con tus valores

```bash
nano /ruta/al/proyecto/scripts/sync-icl.sh
```

Cambiar:
- `CRON_SECRET`: Usar el mismo valor que en `.env`
- `API_URL`: URL de tu servidor (ej: `http://localhost:3000` o `https://tudominio.com`)

### 3. Configurar crontab

```bash
crontab -e
```

Agregar línea para ejecutar el día 1 de cada mes a las 2:00 AM:

```cron
0 2 1 * * /ruta/al/proyecto/scripts/sync-icl.sh
```

### 4. Verificar logs

```bash
tail -f /var/log/icl-sync.log
```

## Endpoint

- **URL**: `/api/internal/cron/sync-icl`
- **Método**: `POST`
- **Header**: `Authorization: Bearer {CRON_SECRET}`
- **Respuesta**: JSON con `created`, `updated`, `total`, `executedAt`

## Botón Manual

El botón "Sincronizar ICL" en la interfaz sigue disponible para sincronización manual cuando sea necesario.
