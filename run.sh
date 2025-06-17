#!/bin/bash

set -e

echo "Running database migrations..."
npm run db:migrate

sleep 5

npm run db:essential

echo "Starting the backend server..."
npm run start:prod