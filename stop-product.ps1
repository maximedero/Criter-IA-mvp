$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $scriptDir '.dev-processes.json'

if (-not (Test-Path $pidFile)) {
	Write-Host "No existe '$pidFile'. No hay procesos registrados para detener." -ForegroundColor Yellow
	exit 0
}

$state = Get-Content -Path $pidFile -Raw | ConvertFrom-Json

function Stop-DevProcess {
	param(
		[Parameter(Mandatory = $true)] [string] $Name,
		[Parameter(Mandatory = $true)] [object] $ProcessInfo
	)

	if ($null -eq $ProcessInfo) {
		Write-Host "No hay PID registrado para $Name." -ForegroundColor Yellow
		return
	}

	$pid = [int]$ProcessInfo.Pid
	$running = Get-Process -Id $pid -ErrorAction SilentlyContinue

	if ($null -eq $running) {
		Write-Host "$Name ya estaba detenido (PID $pid)." -ForegroundColor Yellow
		return
	}

	Write-Host "Deteniendo $Name (PID $pid)..." -ForegroundColor Cyan
	cmd /c "taskkill /PID $pid /T /F" | Out-Null
	Write-Host "$Name detenido." -ForegroundColor Green
}

$frontend = $state.processes | Where-Object { $_.Name -eq 'frontend' } | Select-Object -First 1
$backend = $state.processes | Where-Object { $_.Name -eq 'backend' } | Select-Object -First 1

# Orden solicitado: frontend primero, backend después
Stop-DevProcess -Name 'frontend' -ProcessInfo $frontend
Stop-DevProcess -Name 'backend' -ProcessInfo $backend

Remove-Item -Path $pidFile -Force
Write-Host "Ejecución finalizada. Archivo de estado eliminado: $pidFile" -ForegroundColor Green
