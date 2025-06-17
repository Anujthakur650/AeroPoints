#!/bin/bash

echo "Rolling back airport search implementation..."

# Restore from backup
cp -r backup/src/components/* src/components/
cp -r backup/src/utils/* src/utils/
cp -r backup/src/types/* src/types/

# Reset feature flag
echo "export const FEATURES = { USE_NEW_AIRPORT_SEARCH: false };" > src/config/features.ts

echo "Rollback complete!" 