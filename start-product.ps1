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

function Start-DevProcess {
	param(
		[Parameter(Mandatory = $true)] [string] $Name,
		[Parameter(Mandatory = $true)] [string] $Command
	)

	$process = Start-Process -FilePath 'powershell.exe' `
		-ArgumentList @('-NoExit', '-Command', "Set-Location '$appDir'; $Command") `
		-PassThru

	Start-Sleep -Seconds 2

	[PSCustomObject]@{
		Name    = $Name
		Pid     = $process.Id
		Command = $Command
	}
}

Write-Host 'Iniciando backend...' -ForegroundColor Cyan
$backend = Start-DevProcess -Name 'backend' -Command 'npm run dev:backend'

Write-Host 'Iniciando frontend...' -ForegroundColor Cyan
$frontend = Start-DevProcess -Name 'frontend' -Command 'npm run dev:frontend'

$state = [PSCustomObject]@{
	startedAt = (Get-Date).ToString('o')
	appDir    = $appDir
	processes = @($backend, $frontend)
}

$state | ConvertTo-Json -Depth 5 | Set-Content -Path $pidFile -Encoding UTF8

Write-Host "Listo. Backend y frontend iniciados." -ForegroundColor Green
Write-Host "Backend:  http://localhost:4000"
Write-Host "Frontend: http://localhost:5173"
Write-Host "PIDs guardados en: $pidFile"
