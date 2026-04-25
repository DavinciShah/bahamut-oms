param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectId,

  [Parameter(Mandatory = $false)]
  [string]$Region = "us-central1",

  [Parameter(Mandatory = $false)]
  [string]$ServiceName = "bahamut-oms-api",

  [Parameter(Mandatory = $true)]
  [string]$DatabaseUrl,

  [Parameter(Mandatory = $true)]
  [string]$JwtSecret,

  [Parameter(Mandatory = $true)]
  [string]$JwtRefreshSecret,

  [Parameter(Mandatory = $true)]
  [string]$CorsOrigin
)

$ErrorActionPreference = "Stop"

Write-Host "Setting gcloud project to $ProjectId..."
gcloud config set project $ProjectId | Out-Null

Write-Host "Deploying $ServiceName to Cloud Run in $Region..."
gcloud run deploy $ServiceName `
  --source . `
  --region $Region `
  --platform managed `
  --allow-unauthenticated `
  --set-env-vars "NODE_ENV=production,DATABASE_URL=$DatabaseUrl,JWT_SECRET=$JwtSecret,JWT_REFRESH_SECRET=$JwtRefreshSecret,CORS_ORIGIN=$CorsOrigin"

Write-Host "Deployment command completed."
