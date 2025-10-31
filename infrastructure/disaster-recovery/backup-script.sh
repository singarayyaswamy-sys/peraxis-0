#!/bin/bash

# Peraxis Disaster Recovery Backup Script
set -e

BACKUP_DIR="/backup/peraxis/$(date +%Y%m%d_%H%M%S)"
LOG_FILE="/var/log/peraxis-backup.log"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

create_backup_dir() {
    log "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"/{databases,configs,volumes}
}

backup_mysql() {
    log "Backing up MySQL databases..."
    docker exec peraxis-mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD --all-databases > "$BACKUP_DIR/databases/mysql_backup.sql"
    log "MySQL backup completed"
}

backup_mongodb() {
    log "Backing up MongoDB databases..."
    docker exec peraxis-mongodb mongodump --out "$BACKUP_DIR/databases/mongodb"
    log "MongoDB backup completed"
}

backup_redis() {
    log "Backing up Redis data..."
    docker exec peraxis-redis redis-cli BGSAVE
    docker cp peraxis-redis:/data/dump.rdb "$BACKUP_DIR/databases/redis_dump.rdb"
    log "Redis backup completed"
}

compress_backup() {
    log "Compressing backup..."
    cd "$(dirname "$BACKUP_DIR")"
    tar czf "$(basename "$BACKUP_DIR").tar.gz" "$(basename "$BACKUP_DIR")"
    rm -rf "$BACKUP_DIR"
    log "Backup compressed: $(basename "$BACKUP_DIR").tar.gz"
}

main() {
    log "Starting Peraxis backup process..."
    create_backup_dir
    backup_mysql
    backup_mongodb
    backup_redis
    compress_backup
    log "Backup process completed successfully"
}

main "$@"