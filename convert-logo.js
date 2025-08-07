const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

// SVG content
const svgContent = `<svg width="512" height="512" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle -->
  <circle cx="16" cy="16" r="16" fill="#8B5CF6"/>
  
  <!-- Quiz/Question mark -->
  <path d="M16 8C18.2091 8 20 9.79086 20 12C20 14.2091 18.2091 16 16 16C13.7909 16 12 14.2091 12 12C12 9.79086 13.7909 8 16 8Z" fill="white"/>
  <path d="M16 18C18.2091 18 20 19.7909 20 22C20 24.2091 18.2091 26 16 26C13.7909 26 12 24.2091 12 22C12 19.7909 13.7909 18 16 18Z" fill="white"/>
  
  <!-- Brain/AI element -->
  <circle cx="16" cy="12" r="2" fill="#8B5CF6"/>
  <circle cx="16" cy="22" r="2" fill="#8B5CF6"/>
</svg>`;

// Create canvas
const canvas = createCanvas(512, 512);
const ctx = canvas.getContext('2d');

// Create a temporary SVG file
fs.writeFileSync('temp-logo.svg', svgContent);

// Convert SVG to PNG using a different approach
const { execSync } = require('child_process');

try {
  // Use ImageMagick if available, otherwise use a simple approach
  execSync('convert temp-logo.svg logo.png', { stdio: 'ignore' });
  console.log('✅ Logo converted to PNG successfully!');
  console.log('📁 File saved as: logo.png');
} catch (error) {
  // Fallback: create a simple PNG using canvas
  console.log('Creating PNG using canvas fallback...');
  
  // Set background
  ctx.fillStyle = '#8B5CF6';
  ctx.fillRect(0, 0, 512, 512);
  
  // Draw the logo elements (simplified version)
  ctx.fillStyle = 'white';
  
  // Top circle (question mark top)
  ctx.beginPath();
  ctx.arc(256, 128, 64, 0, 2 * Math.PI);
  ctx.fill();
  
  // Bottom circle (question mark bottom)
  ctx.beginPath();
  ctx.arc(256, 384, 64, 0, 2 * Math.PI);
  ctx.fill();
  
  // Purple dots
  ctx.fillStyle = '#8B5CF6';
  ctx.beginPath();
  ctx.arc(256, 192, 32, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(256, 352, 32, 0, 2 * Math.PI);
  ctx.fill();
  
  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('logo.png', buffer);
  console.log('✅ Logo converted to PNG successfully!');
  console.log('📁 File saved as: logo.png');
}

// Clean up temp file
if (fs.existsSync('temp-logo.svg')) {
  fs.unlinkSync('temp-logo.svg');
} 