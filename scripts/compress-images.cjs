const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, '..', 'public', 'images');

if (fs.existsSync(imgDir)) {
  const files = fs.readdirSync(imgDir).filter(f => f.match(/\.(png|jpe?g)$/i));
  
  files.forEach(async (file) => {
    const inputPath = path.join(imgDir, file);
    const tempPath = path.join(imgDir, `temp_${file}`);
    
    console.log(`Compressing ${file}...`);
    
    try {
      await sharp(inputPath)
        .png({ quality: 75, compressionLevel: 9 }) // optimize png
        .jpeg({ quality: 75 }) // fallback if jpeg
        .toFile(tempPath);
        
      fs.renameSync(tempPath, inputPath);
      console.log(`✓ Finished compressing ${file}`);
    } catch (err) {
      console.error(`✗ Error compressing ${file}:`, err);
    }
  });
}
