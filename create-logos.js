const fs = require('fs');
const { createCanvas } = require('canvas');

function createLogo(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Scale factor based on original 32x32 design
  const scale = size / 32;
  
  // Background circle
  ctx.fillStyle = '#8B5CF6';
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2, 0, 2 * Math.PI);
  ctx.fill();
  
  // Question mark circles (white)
  ctx.fillStyle = 'white';
  
  // Top circle
  ctx.beginPath();
  ctx.arc(size/2, size * 0.25, size * 0.125, 0, 2 * Math.PI);
  ctx.fill();
  
  // Bottom circle
  ctx.beginPath();
  ctx.arc(size/2, size * 0.75, size * 0.125, 0, 2 * Math.PI);
  ctx.fill();
  
  // Purple dots
  ctx.fillStyle = '#8B5CF6';
  
  // Top dot
  ctx.beginPath();
  ctx.arc(size/2, size * 0.375, size * 0.0625, 0, 2 * Math.PI);
  ctx.fill();
  
  // Bottom dot
  ctx.beginPath();
  ctx.arc(size/2, size * 0.6875, size * 0.0625, 0, 2 * Math.PI);
  ctx.fill();
  
  return canvas;
}

// Create different sizes
const sizes = [32, 64, 128, 256, 512, 1024];

sizes.forEach(size => {
  const canvas = createLogo(size);
  const buffer = canvas.toBuffer('image/png');
  const filename = `logo-${size}x${size}.png`;
  fs.writeFileSync(filename, buffer);
  console.log(`✅ Created ${filename}`);
});

console.log('\n🎉 All logo files created successfully!');
console.log('📁 Files available:');
sizes.forEach(size => {
  console.log(`   - logo-${size}x${size}.png`);
}); 