#!/bin/bash

# Vercel Deployment Script for SecureAuth Frontend
# This script prepares the Next.js application for Vercel deployment

set -e

echo "🚀 Preparing SecureAuth Frontend for Vercel Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[DEPLOY]${NC} $1"
}

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the frontend directory"
    exit 1
fi

print_header "Step 1: Installing Dependencies"
npm ci
print_status "Dependencies installed"

print_header "Step 2: Running Type Check"
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_status "Build successful - no TypeScript errors"
else
    print_error "Build failed - please fix TypeScript errors"
    exit 1
fi

print_header "Step 3: Validating Environment Configuration"
if [ ! -f ".env.example" ]; then
    print_error ".env.example file not found"
    exit 1
fi
print_status "Environment configuration validated"

print_header "Step 4: Checking Required Files"
required_files=("vercel.json" "next.config.ts" "tailwind.config.ts")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file $file not found"
        exit 1
    fi
done
print_status "All required files present"

print_header "Step 5: Optimizing for Production"
# Clean up development files
rm -rf .next
rm -rf node_modules/.cache
print_status "Development artifacts cleaned"

print_status "✅ Frontend prepared for Vercel deployment!"

echo ""
echo "📋 Next Steps:"
echo "1. Install Vercel CLI: npm i -g vercel"
echo "2. Login to Vercel: vercel login"
echo "3. Deploy: vercel --prod"
echo "   OR"
echo "1. Push your code to GitHub"
echo "2. Connect your GitHub repo to Vercel"
echo "3. Set environment variables in Vercel dashboard"
echo "4. Deploy!"
echo ""

print_warning "Environment Variables to set in Vercel:"
echo "- NEXT_PUBLIC_API_URL (your Railway backend URL)"
echo "- NEXT_PUBLIC_APP_NAME"
echo "- NEXT_PUBLIC_APP_VERSION"
echo "- NEXT_PUBLIC_ENVIRONMENT"
echo ""

print_status "Deployment preparation completed!"