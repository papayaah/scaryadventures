#!/usr/bin/env node

/**
 * Story Manager Utility
 * 
 * This script helps manage stories in the game:
 * - Scan for new story files
 * - Validate story format
 * - Show summary of available stories
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORIES_DIR = path.join(__dirname, '../src/client/public/assets/stories');
const SCENES_DIR = path.join(__dirname, '../src/client/public/assets/scenes');

// Extract metadata from a story file
function extractStoryMetadata(storyData, filename) {
  return {
    story_id: storyData.story_id,
    story_title: storyData.story_title,
    tone: storyData.tone,
    duration: storyData.duration,
    art_direction: storyData.art_direction,
    filename: filename,
    scenes: storyData.scenes?.length || 0
  };
}

// Validate story structure
function validateStory(storyData, filename) {
  const errors = [];
  
  if (!storyData.story_id) errors.push('Missing story_id');
  if (!storyData.story_title) errors.push('Missing story_title');
  if (!storyData.tone) errors.push('Missing tone');
  if (!storyData.duration) errors.push('Missing duration');
  if (!storyData.scenes || !Array.isArray(storyData.scenes)) errors.push('Missing or invalid scenes array');
  
  if (storyData.scenes) {
    storyData.scenes.forEach((scene, index) => {
      if (!scene.id) errors.push(`Scene ${index}: Missing id`);
      if (!scene.text) errors.push(`Scene ${index}: Missing text`);
      if (!scene.hasOwnProperty('ending')) errors.push(`Scene ${index}: Missing ending property`);
    });
  }
  
  return errors;
}

// Scan for all story files
function scanStoryFiles() {
  console.log('🔍 Scanning for story files...');
  
  if (!fs.existsSync(STORIES_DIR)) {
    console.error('❌ Stories directory not found:', STORIES_DIR);
    return [];
  }

  const files = fs.readdirSync(STORIES_DIR);
  const storyFiles = files.filter(file => file.endsWith('.json') && !file.startsWith('.'));
  
  console.log(`📚 Found ${storyFiles.length} story files`);
  
  const metadata = [];
  const errors = [];
  
  for (const filename of storyFiles) {
    try {
      const filePath = path.join(STORIES_DIR, filename);
      const storyData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Validate story structure
      const validationErrors = validateStory(storyData, filename);
      if (validationErrors.length > 0) {
        errors.push({ filename, errors: validationErrors });
        console.log(`⚠️  ${filename}: ${validationErrors.length} validation errors`);
      } else {
        const meta = extractStoryMetadata(storyData, filename);
        metadata.push(meta);
        console.log(`✅ ${meta.story_title} (${meta.tone}, ${meta.duration}, ${meta.scenes} scenes)`);
      }
    } catch (error) {
      errors.push({ filename, errors: [`JSON parse error: ${error.message}`] });
      console.error(`❌ Error reading ${filename}:`, error.message);
    }
  }
  
  return { metadata, errors };
}

// Check for corresponding scene images
function checkSceneImages(metadata) {
  console.log('\n🖼️  Checking scene images...');
  
  for (const story of metadata) {
    const storyDir = path.join(SCENES_DIR, story.filename.replace('.json', ''));
    
    if (fs.existsSync(storyDir)) {
      const imageFiles = fs.readdirSync(storyDir).filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i));
      console.log(`📁 ${story.story_title}: ${imageFiles.length} images found`);
    } else {
      console.log(`⚠️  ${story.story_title}: No image directory found`);
    }
  }
}

// Main function
function main() {
  console.log('🎮 Story Manager');
  console.log('================');
  
  const { metadata, errors } = scanStoryFiles();
  
  if (metadata.length === 0) {
    console.log('⚠️  No valid stories found');
    if (errors.length > 0) {
      console.log('\n❌ Validation Errors:');
      errors.forEach(({ filename, errors }) => {
        console.log(`\n${filename}:`);
        errors.forEach(error => console.log(`  - ${error}`));
      });
    }
    return;
  }
  
  // Check scene images
  checkSceneImages(metadata);
  
  // Summary
  const tones = [...new Set(metadata.map(m => m.tone))];
  const durations = [...new Set(metadata.map(m => m.duration))];
  const totalScenes = metadata.reduce((sum, m) => sum + m.scenes, 0);
  
  console.log('\n📊 Summary:');
  console.log(`Total stories: ${metadata.length}`);
  console.log(`Total scenes: ${totalScenes}`);
  console.log(`Tones: ${tones.join(', ')}`);
  console.log(`Durations: ${durations.join(', ')}`);
  
  if (errors.length > 0) {
    console.log(`\n⚠️  ${errors.length} files had validation errors`);
  }
  
  console.log('\n🚀 Next steps:');
  console.log('1. Fix any validation errors shown above');
  console.log('2. Start your dev server: npm run dev');
  console.log('3. The stories will be automatically indexed when the server starts');
  console.log('4. Or call /api/stories/refresh to force refresh the index');
  
  console.log('\n💡 The system now automatically scans and indexes stories!');
  console.log('   No manual code copying required - just add your JSON files and images.');
}

// Run main function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { scanStoryFiles, extractStoryMetadata, validateStory };