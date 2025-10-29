#!/bin/bash
set -e  # Exit on error

echo "🚀 Starting Phronos build process..."
echo ""

# Build Homepage
echo "📦 Building homepage..."
cd homepage
npm ci --legacy-peer-deps
npm run build
cd ..
echo "✅ Homepage built successfully"
echo ""

# Build IDE
echo "💻 Building IDE..."
cd ide
npm ci --legacy-peer-deps
npm run build
cd ..
echo "✅ IDE built successfully"
echo ""

# Merge IDE into homepage dist
echo "🔗 Merging IDE into homepage..."
mkdir -p homepage/dist/ide
cp -r ide/dist/* homepage/dist/ide/
echo "✅ Projects merged successfully"
echo ""

echo "🎉 Build complete! Deploy homepage/dist to Netlify"

