# Docker Swarm Rolling Updates Guide

## Overview

This guide explains how to perform rolling updates in Docker Swarm when you build new Docker images.

## Update Configuration Added

Your compose.yml now includes update configuration:

- **Parallelism**: 1 (updates one container at a time)
- **Delay**: 30s between updates
- **Failure Action**: Automatic rollback on failure
- **Monitor**: 60s to monitor health after update
- **Max Failure Ratio**: 30% failure tolerance

## Methods for Rolling Updates

### Method 1: Docker Service Update (Recommended)

Best for production environments with fine-grained control.

```bash
# Update to specific version
docker service update \
  --image carecapsule.azurecr.io/carecapsule:v1.2.0 \
  --update-parallelism 1 \
  --update-delay 30s \
  --update-failure-action rollback \
  carecapsule_node

# Check update progress
docker service ps carecapsule_node
```

**PowerShell:**

```powershell
.\update-stack.ps1 -StackName "carecapsule" -NewTag "v1.2.0" -Method "service"
```

### Method 2: Stack Deploy

Updates the entire stack with new compose configuration.

```bash
# Set new tag
export CARECAPSULE_TAG=v1.2.0

# Redeploy stack
docker stack deploy -c compose.yml carecapsule
```

**PowerShell:**

```powershell
$env:CARECAPSULE_TAG = "v1.2.0"
docker stack deploy -c compose.yml carecapsule
```

### Method 3: Blue-Green Deployment

Zero-downtime deployment by running both versions temporarily.

```bash
# Scale up with new version (doubles capacity temporarily)
docker service update \
  --image carecapsule.azurecr.io/carecapsule:v1.2.0 \
  --replicas-add 2 \
  carecapsule_node

# Wait and verify health, then scale back to normal
docker service update --replicas 2 carecapsule_node
```

## Complete Workflow

### 1. Build and Push New Image

```bash
# Build new image with version tag
docker build -t carecapsule.azurecr.io/carecapsule:v1.2.0 .

# Push to registry
docker push carecapsule.azurecr.io/carecapsule:v1.2.0

# Also tag as latest if needed
docker tag carecapsule.azurecr.io/carecapsule:v1.2.0 carecapsule.azurecr.io/carecapsule:latest
docker push carecapsule.azurecr.io/carecapsule:latest
```

### 2. Update Services

Choose one of the methods above to update your services.

### 3. Monitor Update Progress

```bash
# Watch service updates
docker service ps carecapsule_node --no-trunc

# Check overall stack status
docker stack services carecapsule

# View service logs
docker service logs carecapsule_node -f
```

### 4. Rollback if Needed

```bash
# Automatic rollback (if configured)
# This happens automatically if failure threshold is reached

# Manual rollback
docker service rollback carecapsule_node

# Or rollback to specific version
docker service update --image carecapsule.azurecr.io/carecapsule:v1.1.0 carecapsule_node
```

## Health Checks (Recommended)

Add health checks to your Dockerfile for better update reliability:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

## Best Practices

### 1. Version Tagging

- Always use semantic versioning (v1.2.0, v1.2.1, etc.)
- Avoid using `latest` in production
- Tag images with git commit SHA for traceability

### 2. Environment Variables

```bash
# Set in your CI/CD pipeline
export CARECAPSULE_TAG=$(git describe --tags)
# or
export CARECAPSULE_TAG=$(git rev-parse --short HEAD)
```

### 3. CI/CD Integration

```yaml
# Example GitHub Actions workflow
name: Deploy to Swarm
on:
  push:
    tags: ['v*']

jobs:
  deploy:
    steps:
      - name: Build and Push
        run: |
          docker build -t carecapsule.azurecr.io/carecapsule:${{ github.ref_name }} .
          docker push carecapsule.azurecr.io/carecapsule:${{ github.ref_name }}

      - name: Deploy to Swarm
        run: |
          docker service update \
            --image carecapsule.azurecr.io/carecapsule:${{ github.ref_name }} \
            carecapsule_node
```

### 4. Monitoring Commands

```bash
# Monitor all services
watch 'docker stack services carecapsule'

# Monitor specific service tasks
watch 'docker service ps carecapsule_node'

# Stream logs during update
docker service logs carecapsule_node -f --since 5m
```

## Troubleshooting

### Update Stuck

```bash
# Check service tasks
docker service ps carecapsule_node --no-trunc

# Force update if needed
docker service update --force carecapsule_node
```

### Rollback Issues

```bash
# Check rollback status
docker service inspect carecapsule_node --format='{{.Spec.RollbackConfig}}'

# Manual rollback to known good version
docker service update --image carecapsule.azurecr.io/carecapsule:v1.1.0 carecapsule_node
```

### Network Issues During Update

```bash
# Check network connectivity
docker network ls
docker network inspect carecapsule_backend

# Restart network if needed (careful in production)
docker network rm carecapsule_backend
docker stack deploy -c compose.yml carecapsule
```

## Quick Commands Reference

```bash
# Deploy stack
docker stack deploy -c compose.yml carecapsule

# Update service with new image
docker service update --image carecapsule.azurecr.io/carecapsule:v1.2.0 carecapsule_node

# Scale service
docker service scale carecapsule_node=3

# Rollback service
docker service rollback carecapsule_node

# Remove stack
docker stack rm carecapsule

# List all services
docker service ls

# Service details
docker service inspect carecapsule_node
```
