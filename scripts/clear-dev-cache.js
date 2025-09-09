#!/usr/bin/env node

/**
 * Development Cache Clearing Script
 * This script helps clear various caches that might interfere with development
 */

const fs = require('fs')
const path = require('path')

function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, { recursive: true, force: true })
    console.log(`✓ Deleted: ${folderPath}`)
  } else {
    console.log(`- Not found: ${folderPath}`)
  }
}

function clearDevCache() {
  console.log('🧹 Clearing development caches...\n')

  // Clear Next.js cache
  deleteFolderRecursive('.next')
  
  // Clear node_modules/.cache if it exists
  deleteFolderRecursive('node_modules/.cache')
  
  // Clear any TypeScript build info
  const tsBuildInfo = '.tsbuildinfo'
  if (fs.existsSync(tsBuildInfo)) {
    fs.unlinkSync(tsBuildInfo)
    console.log(`✓ Deleted: ${tsBuildInfo}`)
  }

  console.log('\n✅ Cache clearing complete!')
  console.log('\n📝 Next steps:')
  console.log('1. Restart your development server: npm run dev')
  console.log('2. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)')
  console.log('3. Clear browser cache if issues persist')
}

// Run the cache clearing
clearDevCache()
