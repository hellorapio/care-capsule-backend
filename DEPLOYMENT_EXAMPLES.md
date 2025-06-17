# Advanced GitHub Actions Examples for Docker Swarm Rolling Updates

## Example 1: Basic Rolling Update (Current Implementation)

```yaml
- name: Deploy with Docker Swarm Rolling Update
  run: |
    ssh -i ~/.ssh/id_rsa $SSH_USER@$SSH_HOST << 'EOF'
      # Basic rolling update using the script
      sudo bash ~/update-stack.sh carecapsule latest service
    EOF
```

## Example 2: Version-Tagged Rolling Update

```yaml
- name: Deploy with Version Tag
  run: |
    # Create version tag from git
    VERSION_TAG="v$(date +%Y%m%d)-${GITHUB_RUN_NUMBER}"

    ssh -i ~/.ssh/id_rsa $SSH_USER@$SSH_HOST << EOF
      # Tag and push the image with version
      sudo docker tag ${{ secrets.ACR_LOGIN_SERVER }}/carecapsule:latest \
                      ${{ secrets.ACR_LOGIN_SERVER }}/carecapsule:${VERSION_TAG}
      sudo docker push ${{ secrets.ACR_LOGIN_SERVER }}/carecapsule:${VERSION_TAG}
      
      # Rolling update with version tag
      sudo bash ~/update-stack.sh carecapsule ${VERSION_TAG} service
    EOF
```

## Example 3: Blue-Green Deployment

```yaml
- name: Blue-Green Deployment
  run: |
    ssh -i ~/.ssh/id_rsa $SSH_USER@$SSH_HOST << 'EOF'
      # Use blue-green method for zero-downtime
      sudo bash ~/update-stack.sh carecapsule latest blue-green
    EOF
```

## Example 4: Stack Deploy Method

```yaml
- name: Deploy with Stack Method
  run: |
    ssh -i ~/.ssh/id_rsa $SSH_USER@$SSH_HOST << 'EOF'
      # Set environment variable for new tag
      export CARECAPSULE_TAG=latest
      
      # Use stack deploy method
      sudo bash ~/update-stack.sh carecapsule latest stack
    EOF
```

## Example 5: Conditional Rollback on Failure

```yaml
- name: Deploy with Automatic Rollback
  run: |
    ssh -i ~/.ssh/id_rsa $SSH_USER@$SSH_HOST << 'EOF'
      # Attempt rolling update
      if ! sudo bash ~/update-stack.sh carecapsule latest service; then
        echo "❌ Deployment failed, rolling back..."
        sudo bash ~/update-stack.sh carecapsule latest rollback
        exit 1
      fi
      
      # Verify deployment success
      sleep 30
      if ! sudo docker service ls --format "{{.Replicas}}" --filter name=carecapsule_node | grep -q "2/2"; then
        echo "❌ Health check failed, rolling back..."
        sudo bash ~/update-stack.sh carecapsule latest rollback
        exit 1
      fi
      
      echo "✅ Deployment successful!"
    EOF
```

## Example 6: Multi-Environment Deployment

```yaml
- name: Deploy to Staging
  if: github.ref == 'refs/heads/develop'
  run: |
    ssh -i ~/.ssh/id_rsa $SSH_USER@$SSH_HOST << 'EOF'
      sudo bash ~/update-stack.sh carecapsule-staging latest service
    EOF

- name: Deploy to Production
  if: github.ref == 'refs/heads/main'
  run: |
    ssh -i ~/.ssh/id_rsa $SSH_USER@$SSH_HOST << 'EOF'
      # Production uses blue-green for extra safety
      sudo bash ~/update-stack.sh carecapsule-prod latest blue-green
    EOF
```

## Example 7: Pre and Post Deployment Hooks

```yaml
- name: Deploy with Hooks
  run: |
    ssh -i ~/.ssh/id_rsa $SSH_USER@$SSH_HOST << 'EOF'
      # Pre-deployment hook
      echo "🔍 Pre-deployment checks..."
      sudo docker system df
      sudo docker service ls
      
      # Main deployment
      echo "🚀 Starting deployment..."
      if sudo bash ~/update-stack.sh carecapsule latest service; then
        
        # Post-deployment hook
        echo "✅ Post-deployment verification..."
        sleep 60
        
        # Health check
        for i in {1..10}; do
          if curl -f http://localhost:3000/health > /dev/null 2>&1; then
            echo "✅ Health check passed!"
            break
          else
            echo "⏳ Waiting for health check... ($i/10)"
            sleep 10
          fi
        done
        
        # Cleanup
        sudo docker system prune -f --filter "until=24h"
        echo "🎉 Deployment completed successfully!"
        
      else
        echo "❌ Deployment failed!"
        exit 1
      fi
    EOF
```

## Example 8: Parallel Service Updates

```yaml
- name: Update Multiple Services
  run: |
    ssh -i ~/.ssh/id_rsa $SSH_USER@$SSH_HOST << 'EOF'
      # Update main application
      sudo bash ~/update-stack.sh carecapsule latest service &
      
      # Update another stack in parallel (if you have multiple)
      # sudo bash ~/update-stack.sh carecapsule-api latest service &
      
      # Wait for all updates to complete
      wait
      
      echo "All services updated!"
    EOF
```

## Example 9: Deployment with Monitoring

```yaml
- name: Deploy with Monitoring
  run: |
    ssh -i ~/.ssh/id_rsa $SSH_USER@$SSH_HOST << 'EOF'
      # Start monitoring in background
      (
        while true; do
          echo "$(date): $(sudo docker service ls --format 'table {{.NAME}}\t{{.REPLICAS}}\t{{.IMAGE}}')"
          sleep 30
        done
      ) &
      MONITOR_PID=$!
      
      # Run deployment
      sudo bash ~/update-stack.sh carecapsule latest service
      
      # Stop monitoring
      kill $MONITOR_PID
      
      # Final status
      echo "Final deployment status:"
      sudo docker stack services carecapsule
    EOF
```

## Example 10: Database Migration with Deployment

```yaml
- name: Deploy with Database Migration
  run: |
    ssh -i ~/.ssh/id_rsa $SSH_USER@$SSH_HOST << 'EOF'
      # Run database migrations first
      echo "🗄️ Running database migrations..."
      sudo docker run --rm --network carecapsule_backend \
        -e DATABASE_URL="postgresql://postgres:postgres@carecapsule_db:5432/carecapsule" \
        ${{ secrets.ACR_LOGIN_SERVER }}/carecapsule:latest \
        npm run migrate
      
      # Then deploy the application
      echo "🚀 Deploying application..."
      sudo bash ~/update-stack.sh carecapsule latest service
    EOF
```
