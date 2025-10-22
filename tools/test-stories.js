#!/usr/bin/env node

/**
 * Test Embedded Stories
 * 
 * This script tests that the embedded stories system is working correctly
 */

import { EMBEDDED_STORIES, STORY_METADATA } from '../src/server/api/generated-stories.js';

function testEmbeddedStories() {
  console.log('🧪 Testing Embedded Stories System');
  console.log('==================================');
  
  console.log(`📚 Total embedded stories: ${EMBEDDED_STORIES.length}`);
  console.log(`📊 Total metadata entries: ${STORY_METADATA.length}`);
  
  if (EMBEDDED_STORIES.length !== STORY_METADATA.length) {
    console.error('❌ Mismatch between stories and metadata count!');
    return false;
  }
  
  console.log('\n🔍 Testing story lookup by ID...');
  
  // Test first few stories
  for (let i = 0; i < Math.min(3, STORY_METADATA.length); i++) {
    const metadata = STORY_METADATA[i];
    const story = EMBEDDED_STORIES.find(s => s.story_id === metadata.story_id);
    
    if (!story) {
      console.error(`❌ Story not found for ID: ${metadata.story_id}`);
      return false;
    }
    
    console.log(`✅ ${story.story_title} (${story.tone}, ${story.duration}) - ${story.scenes?.length || 0} scenes`);
  }
  
  console.log('\n📊 Story breakdown by tone:');
  const toneCount = {};
  STORY_METADATA.forEach(story => {
    toneCount[story.tone] = (toneCount[story.tone] || 0) + 1;
  });
  
  Object.entries(toneCount).forEach(([tone, count]) => {
    console.log(`  ${tone}: ${count} stories`);
  });
  
  console.log('\n📊 Story breakdown by duration:');
  const durationCount = {};
  STORY_METADATA.forEach(story => {
    durationCount[story.duration] = (durationCount[story.duration] || 0) + 1;
  });
  
  Object.entries(durationCount).forEach(([duration, count]) => {
    console.log(`  ${duration}: ${count} stories`);
  });
  
  console.log('\n✅ All tests passed! Embedded stories system is working correctly.');
  return true;
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testEmbeddedStories();
}

export { testEmbeddedStories };