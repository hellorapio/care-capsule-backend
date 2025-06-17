#!/bin/bash

# Docker Swarm Rolling Update Script
# Usage: ./update-stack.sh [stack-name] [new-tag]

STACK_NAME=${1:-carecapsule}
NEW_TAG=${2:-latest}
IMAGE_NAME="carecapsule.azurecr.io/carecapsule"

echo "🚀 Starting rolling update for stack: $STACK_NAME"
echo "📦 New image tag: $NEW_TAG"

# Function to check service status
check_service_status() {
    local service_name=$1
    echo "⏳ Checking status of service: $service_name"
    docker service ps $service_name --no-trunc
}

# Method 1: Update using docker service update (Recommended)
update_with_service_command() {
    echo "🔄 Method 1: Using docker service update command"
    
    # Update the node service with new image
    echo "📝 Updating node service..."
    docker service update \
        --image ${IMAGE_NAME}:${NEW_TAG} \
        --update-parallelism 1 \
        --update-delay 30s \
        --update-failure-action rollback \
        --update-monitor 60s \
        --update-max-failure-ratio 0.3 \
        ${STACK_NAME}_node
    
    # Check status
    check_service_status ${STACK_NAME}_node
    
    # Update nginx if needed (rebuild required for nginx)
    echo "📝 Updating nginx service (if image changed)..."
    docker service update \
        --force \
        --update-delay 10s \
        ${STACK_NAME}_nginx
    
    check_service_status ${STACK_NAME}_nginx
}

# Method 2: Update using stack deploy (Alternative)
update_with_stack_deploy() {
    echo "🔄 Method 2: Using docker stack deploy"
    
    # Update the image tag in compose file or use environment variable
    export CARECAPSULE_TAG=$NEW_TAG
    
    # Deploy the stack (this will update services)
    docker stack deploy -c compose.yml $STACK_NAME
    
    echo "✅ Stack redeployed with new configuration"
}

# Method 3: Blue-Green deployment (Advanced)
blue_green_deploy() {
    echo "🔄 Method 3: Blue-Green deployment"
    
    # Scale up with new version
    docker service update \
        --image ${IMAGE_NAME}:${NEW_TAG} \
        --replicas-add 2 \
        ${STACK_NAME}_node
    
    echo "⏳ Waiting for new instances to be healthy..."
    sleep 60
    
    # Scale down old instances
    docker service update \
        --replicas 2 \
        ${STACK_NAME}_node
    
    check_service_status ${STACK_NAME}_node
}

# Rollback function
rollback_service() {
    echo "🔙 Rolling back service: ${STACK_NAME}_node"
    docker service rollback ${STACK_NAME}_node
    check_service_status ${STACK_NAME}_node
}

# Main execution
case ${3:-"service"} in
    "service")
        update_with_service_command
        ;;
    "stack")
        update_with_stack_deploy
        ;;
    "blue-green")
        blue_green_deploy
        ;;
    "rollback")
        rollback_service
        ;;
    *)
        echo "Usage: $0 [stack-name] [tag] [method]"
        echo "Methods: service, stack, blue-green, rollback"
        exit 1
        ;;
esac

echo "🎉 Update process completed!"
echo "📊 Final service status:"
docker stack services $STACK_NAME
