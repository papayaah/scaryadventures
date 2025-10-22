#!/usr/bin/env node

/**
 * Clear Redis Cache
 * 
 * This script helps clear Redis cache when there are ID mismatches
 */

console.log('🧹 Redis Cache Clearing Instructions');
console.log('====================================');
console.log('');
console.log('The issue is that Redis has cached story metadata with wrong IDs.');
console.log('');
console.log('To fix this:');
console.log('');
console.log('1. 🌐 Open your Devvit playtest URL in browser');
console.log('2. 🔧 Call the refresh endpoint:');
console.log('   POST /api/stories/refresh');
console.log('');
console.log('3. 📱 Or use browser dev tools:');
console.log('   fetch("/api/stories/refresh", { method: "POST" })');
console.log('');
console.log('4. ✅ This will clear Redis and reload with correct story IDs');
console.log('');
console.log('The correct story IDs should be:');
console.log('- "story_20240602_231500" (Crimson Cycle)');
console.log('- "story_1761066488205_fxht3uoai" (The Perpetual Recess)');
console.log('');
console.log('NOT simplified IDs like "crimson-cycle" or "the-perpetual-recess"');