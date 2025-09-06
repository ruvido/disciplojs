#!/bin/bash

# Script to add all environment variables from .env.local to Vercel

set -e

echo "🚀 Adding environment variables to Vercel..."

# Read .env.local and add each non-empty, non-comment line to Vercel
while IFS='=' read -r key value; do
  # Skip empty lines and comments
  if [[ -z "$key" || "$key" =~ ^[[:space:]]*# ]]; then
    continue
  fi
  
  # Remove any leading/trailing whitespace
  key=$(echo "$key" | xargs)
  value=$(echo "$value" | xargs)
  
  # Skip if key or value is empty
  if [[ -z "$key" || -z "$value" ]]; then
    continue
  fi
  
  echo "Adding $key to production..."
  echo "$value" | npx vercel env add "$key" production --force
  
  echo "Adding $key to preview..."
  echo "$value" | npx vercel env add "$key" preview --force
  
done < .env.local

echo "✅ All environment variables added to Vercel!"
echo "🚀 Deploy with: npx vercel --prod"