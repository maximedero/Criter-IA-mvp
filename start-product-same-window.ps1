$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$appDir = Join-Path $scriptDir 'taskify'
$pidFile = Join-Path $scriptDir '.dev-processes.json'

if (-not (Test-Path $appDir)) {
	throw "No se encontró la carpeta '$appDir'."
}

if (-not (Test-Path (Join-Path $appDir 'package.json'))) {
	throw "No se encontró package.json en '$appDir'."
}

if (Test-Path $pidFile) {
	Write-Host "Ya existe '$pidFile'. Si hay procesos viejos, ejecuta primero .\stop-product.ps1" -ForegroundColor Yellow
}

Write-Host 'Iniciando backend en la misma ventana...' -ForegroundColor Cyan
$backend = Start-Process -FilePath 'npm.cmd' -ArgumentList 'run dev:backend' -WorkingDirectory $appDir -NoNewWindow -PassThru
Start-Sleep -Seconds 2

Write-Host 'Iniciando frontend en la misma ventana...' -ForegroundColor Cyan
$frontend = Start-Process -FilePath 'npm.cmd' -ArgumentList 'run dev:frontend' -WorkingDirectory $appDir -NoNewWindow -PassThru
Start-Sleep -Seconds 2

$state = [PSCustomObject]@{
	startedAt = (Get-Date).ToString('o')
	appDir    = $appDir
	mode      = 'same-window'
	processes = @(
		[PSCustomObject]@{ Name = 'backend'; Pid = $backend.Id; Command = 'npm run dev:backend' },
		[PSCustomObject]@{ Name = 'frontend'; Pid = $frontend.Id; Command = 'npm run dev:frontend' }
	)
}

$state | ConvertTo-Json -Depth 5 | Set-Content -Path $pidFile -Encoding UTF8

Write-Host "Listo. Backend y frontend iniciados en esta consola." -ForegroundColor Green
Write-Host "Backend:  http://localhost:4000"
Write-Host "Frontend: http://localhost:5173"
Write-Host "Para detener: .\stop-product.ps1"
