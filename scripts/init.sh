#!/bin/bash

# Load environment variables from .env.local file
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
  echo "Loaded environment variables from .env.local"
else
  echo "Warning: .env.local file not found. Make sure to set Firebase environment variables."
fi

# Run the initialization script
echo "Running database initialization script..."
node scripts/initialize-db.js

# Return the exit status of the node script
exit $?
