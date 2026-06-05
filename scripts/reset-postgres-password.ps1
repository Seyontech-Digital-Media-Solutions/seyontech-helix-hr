$ErrorActionPreference = "Stop"

$dataDir = "C:\Program Files\PostgreSQL\18\data"
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$pgCtl = "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe"
$pgHba = Join-Path $dataDir "pg_hba.conf"
$backup = Join-Path $dataDir ("pg_hba.conf.startsmart-backup-" + (Get-Date -Format "yyyyMMddHHmmss"))
$newPassword = "StartSmart@123"

Copy-Item -LiteralPath $pgHba -Destination $backup -Force

try {
  $content = Get-Content -LiteralPath $pgHba
  $content = $content | ForEach-Object {
    if ($_ -match "^\s*local\s+all\s+all\s+") {
      "local   all             all                                     trust"
    } elseif ($_ -match "^\s*host\s+all\s+all\s+127\.0\.0\.1/32\s+") {
      "host    all             all             127.0.0.1/32            trust"
    } elseif ($_ -match "^\s*host\s+all\s+all\s+::1/128\s+") {
      "host    all             all             ::1/128                 trust"
    } else {
      $_
    }
  }
  Set-Content -LiteralPath $pgHba -Value $content -Encoding ASCII

  & $pgCtl reload -D $dataDir
  Start-Sleep -Seconds 2

  & $psql -U postgres -h localhost -p 5432 -d postgres -c "ALTER USER postgres WITH PASSWORD '$newPassword';"
  $databaseExists = & $psql -U postgres -h localhost -p 5432 -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'startsmart_forms';"

  if (($databaseExists -join "").Trim() -ne "1") {
    & $psql -U postgres -h localhost -p 5432 -d postgres -c "CREATE DATABASE startsmart_forms;"
  }
} finally {
  Copy-Item -LiteralPath $backup -Destination $pgHba -Force
  & $pgCtl reload -D $dataDir
}

Write-Host "PostgreSQL password reset complete. Database startsmart_forms is ready."
