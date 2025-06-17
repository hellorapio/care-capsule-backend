# Docker Swarm Rolling Update Script (PowerShell)
# Usage: .\update-stack.ps1 -StackName "carecapsule" -NewTag "v1.2.0" -Method "service"

param(
    [string]$StackName = "carecapsule",
    [string]$NewTag = "latest",
    [string]$Method = "service"
)

$ImageName = "carecapsule.azurecr.io/carecapsule"

Write-Host "🚀 Starting rolling update for stack: $StackName" -ForegroundColor Green
Write-Host "📦 New image tag: $NewTag" -ForegroundColor Yellow

# Function to check service status
function Check-ServiceStatus {
    param([string]$ServiceName)
    Write-Host "⏳ Checking status of service: $ServiceName" -ForegroundColor Cyan
    docker service ps $ServiceName --no-trunc
}

# Method 1: Update using docker service update (Recommended)
function Update-WithServiceCommand {
    Write-Host "🔄 Method 1: Using docker service update command" -ForegroundColor Blue
    
    # Update the node service with new image
    Write-Host "📝 Updating node service..." -ForegroundColor Yellow
    docker service update `
        --image "${ImageName}:${NewTag}" `
        --update-parallelism 1 `
        --update-delay 30s `
        --update-failure-action rollback `
        --update-monitor 60s `
        --update-max-failure-ratio 0.3 `
        "${StackName}_node"
    
    # Check status
    Check-ServiceStatus "${StackName}_node"
    
    # Update nginx if needed
    Write-Host "📝 Updating nginx service..." -ForegroundColor Yellow
    docker service update `
        --force `
        --update-delay 10s `
        "${StackName}_nginx"
    
    Check-ServiceStatus "${StackName}_nginx"
}

# Method 2: Update using stack deploy
function Update-WithStackDeploy {
    Write-Host "🔄 Method 2: Using docker stack deploy" -ForegroundColor Blue
    
    # Set environment variable for the tag
    $env:CARECAPSULE_TAG = $NewTag
    
    # Deploy the stack
    docker stack deploy -c compose.yml $StackName
    
    Write-Host "✅ Stack redeployed with new configuration" -ForegroundColor Green
}

# Method 3: Blue-Green deployment
function Update-BlueGreen {
    Write-Host "🔄 Method 3: Blue-Green deployment" -ForegroundColor Blue
    
    # Scale up with new version
    docker service update `
        --image "${ImageName}:${NewTag}" `
        --replicas-add 2 `
        "${StackName}_node"
    
    Write-Host "⏳ Waiting for new instances to be healthy..." -ForegroundColor Yellow
    Start-Sleep -Seconds 60
    
    # Scale down to original count
    docker service update `
        --replicas 2 `
        "${StackName}_node"
    
    Check-ServiceStatus "${StackName}_node"
}

# Rollback function
function Rollback-Service {
    Write-Host "🔙 Rolling back service: ${StackName}_node" -ForegroundColor Red
    docker service rollback "${StackName}_node"
    Check-ServiceStatus "${StackName}_node"
}

# Main execution
switch ($Method.ToLower()) {
    "service" { Update-WithServiceCommand }
    "stack" { Update-WithStackDeploy }
    "blue-green" { Update-BlueGreen }
    "rollback" { Rollback-Service }
    default {
        Write-Host "Usage: .\update-stack.ps1 -StackName [name] -NewTag [tag] -Method [method]" -ForegroundColor Red
        Write-Host "Methods: service, stack, blue-green, rollback" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "🎉 Update process completed!" -ForegroundColor Green
Write-Host "📊 Final service status:" -ForegroundColor Cyan
docker stack services $StackName
