#!/usr/bin/env node

/**
 * Password hashing utility for production deployment
 * Usage: node scripts/hash-password.js "your-password"
 */

const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function hashPassword(password) {
  if (!password) {
    console.error('Usage: node scripts/hash-password.js "your-password"');
    process.exit(1);
  }

  try {
    const envPath = path.join(process.cwd(), '.env');
    const envLocalPath = path.join(process.cwd(), '.env.local');
    
    // Check existing hashes in both files
    let existingLocalHash = null;
    let existingEnvHash = null;
    
    // Check .env.local
    if (fs.existsSync(envLocalPath)) {
      const envLocalContent = fs.readFileSync(envLocalPath, 'utf8');
      const authPasswordMatch = envLocalContent.match(/^AUTH_PASSWORD=(.+)$/m);
      if (authPasswordMatch) {
        existingLocalHash = authPasswordMatch[1].trim();
      }
    }
    
    // Check .env
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const authPasswordMatch = envContent.match(/^AUTH_PASSWORD=(.+)$/m);
      if (authPasswordMatch) {
        existingEnvHash = authPasswordMatch[1].trim();
      }
    }

    // Verify if existing hash is valid for the provided password
    const hashesToCheck = [existingLocalHash, existingEnvHash].filter(Boolean);
    
    for (const hash of hashesToCheck) {
      if (hash.startsWith('$2b$') || hash.startsWith('$2a$') || hash.startsWith('$2y$')) {
        const isValid = await bcrypt.compare(password, hash);
        
        if (isValid) {
          // Check if both files have the same valid hash
          const bothFilesMatch = existingLocalHash === existingEnvHash && existingLocalHash === hash;
          
          if (bothFilesMatch) {
            console.log('\n=== PASSWORD ALREADY HASHED ===');
            console.log(`Password matches existing hash in both .env files`);
            console.log(`Current hash: ${hash}`);
            console.log('\n=== NO ACTION NEEDED ===');
            console.log('• Your password is already correctly hashed');
            console.log('• Both .env and .env.local are synchronized');
            console.log('• You can use this password for authentication');
            return;
          } else {
            console.log('\n=== HASH SYNCHRONIZATION NEEDED ===');
            console.log('Valid hash found but files are not synchronized');
            break;
          }
        }
      }
    }

    // Generate new hash if no valid existing hash found or sync needed
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    console.log('\n=== PASSWORD HASHING RESULT ===');
    console.log(`Original password: ${password}`);
    console.log(`Hashed password: ${hashedPassword}`);
    
    let updatedFiles = [];

    // Update .env.local
    if (fs.existsSync(envLocalPath)) {
      let envLocalContent = fs.readFileSync(envLocalPath, 'utf8');
      
      if (existingLocalHash) {
        envLocalContent = envLocalContent.replace(/^AUTH_PASSWORD=.+$/m, `AUTH_PASSWORD=${hashedPassword}`);
      } else {
        envLocalContent += `\nAUTH_PASSWORD=${hashedPassword}\n`;
      }
      
      fs.writeFileSync(envLocalPath, envLocalContent);
      updatedFiles.push('.env.local');
    }

    // Update .env
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      if (existingEnvHash) {
        envContent = envContent.replace(/^AUTH_PASSWORD=.+$/m, `AUTH_PASSWORD=${hashedPassword}`);
      } else {
        envContent += `\nAUTH_PASSWORD=${hashedPassword}\n`;
      }
      
      fs.writeFileSync(envPath, envContent);
      updatedFiles.push('.env');
    }

    if (updatedFiles.length > 0) {
      console.log('\n=== AUTO-UPDATED FILES ===');
      updatedFiles.forEach(file => {
        console.log(`✓ AUTH_PASSWORD has been automatically updated in ${file}`);
      });
      console.log('✓ Both environment files are now synchronized');
    } else {
      console.log('\n=== MANUAL UPDATE NEEDED ===');
      console.log('No .env files found. Create them with:');
      console.log(`AUTH_PASSWORD=${hashedPassword}`);
    }
    
    console.log('\n=== SECURITY NOTICE ===');
    console.log('• Never commit the plain text password to version control');
    console.log('• Always use hashed passwords in production');
    console.log('• Keep your .env files in .gitignore');
    console.log('• Both .env and .env.local should have the same AUTH_PASSWORD');
    
  } catch (error) {
    console.error('Error hashing password:', error.message);
    process.exit(1);
  }
}

// Get password from command line argument
const password = process.argv[2];
hashPassword(password);