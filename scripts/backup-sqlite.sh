#!/bin/bash
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_FILE_NAME="threatview-backup_${TIMESTAMP}.db"
mkdir -p $BACKUP_DIR
echo "Starting SQLite database backup..."
docker cp "$(docker-compose ps -q backend)":/app/data/threatview.db "${BACKUP_DIR}/${DB_FILE_NAME}"
echo "Backup completed: ${BACKUP_DIR}/${DB_FILE_NAME}"
