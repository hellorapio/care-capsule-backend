#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status

echo "Running database migrations..."
# Example for Prisma
npm run db:migrate

sleep 5

npm run db:essential
# Or for Sequelize
# npx sequelize-cli db:migrate

# Or for Knex
# npx knex migrate:latest

echo "Starting the backend server..."
npm run start