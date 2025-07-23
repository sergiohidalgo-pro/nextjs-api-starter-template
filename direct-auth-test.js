#!/usr/bin/env node

// Import the actual modules from the project
const path = require('path');

// Change to project directory to ensure relative imports work
process.chdir(__dirname);

async function testDirectAuth() {
  try {
    // Set up environment first
    require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
    
    console.log('Environment loaded, AUTH_PASSWORD starts with:', process.env.AUTH_PASSWORD?.slice(0, 10));
    
    // Now we need to import the modules - this is tricky because they're TypeScript
    // Let's try a different approach: run the test through node with ts-node
    console.log('AUTH_PASSWORD from process.env:', process.env.AUTH_PASSWORD);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testDirectAuth();