# Script de Backup Diario Automático para Checklist HITO 6
$projectDir = "c:\checklist-hito6-barrido-predial-codigo-fuente-2bf358a"
$backupBaseDir = "$projectDir\backups"
$logFile = "$backupBaseDir\backup.log"

if (-not (Test-Path $backupBaseDir)) {
    New-Item -ItemType Directory -Path $backupBaseDir -Force | Out-Null
}

$dateStr = Get-Date -Format "yyyy-MM-dd_HHmmss"
$destFile = "$backupBaseDir\checklist_db_$dateStr.sqlite"

# Buscar archivo de base de datos SQLite activo
$sourceDb = "$projectDir\.wrangler\state\v3\d1\miniflare-D1DatabaseObject\faaf2b0445ab934c3aac48ddf0cdfade8f9bac050be98993748742cdd2cb05fb.sqlite"

if (-not (Test-Path $sourceDb)) {
    $sourceDb = "$projectDir\db\checklist.db"
}

if (Test-Path $sourceDb) {
    try {
        Copy-Item -Path $sourceDb -Destination $destFile -Force
        $msg = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] SUCCESS: Backup creado exitosamente en $destFile"
        Add-Content -Path $logFile -Value $msg
        Write-Host $msg

        # Limpiar backups antiguos mayores a 30 días
        $limitDate = (Get-Date).AddDays(-30)
        Get-ChildItem -Path $backupBaseDir -Filter "checklist_db_*.sqlite" | Where-Object { $_.LastWriteTime -lt $limitDate } | Remove-Item -Force
    }
    catch {
        $msg = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ERROR: Fallo al crear backup - $_"
        Add-Content -Path $logFile -Value $msg
        Write-Host $msg
    }
} else {
    $msg = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ERROR: No se encontro la base de datos fuente"
    Add-Content -Path $logFile -Value $msg
    Write-Host $msg
}
