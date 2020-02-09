Write-Host "Setting Dev Environment"
$env:NODE_ENV = "development"
$env:DEBUG ="app:*"
$env:DEBUG_COLORS = "true"
$env:RUN_INIT_REF = "false"
Write-Host "NODE_ENV:"  $env:NODE_ENV
Write-Host "DEBUG:" $env:DEBUG
Write-Host "DEBUG_COLORS:" $env:DEBUG_COLORS
Write-Host "RUN_INIT_REF:" $env:RUN_INIT_REF
