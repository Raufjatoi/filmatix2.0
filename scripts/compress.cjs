const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const fs = require('fs');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const inputDirs = ['Selected_Work', 'The_Difference_Is_in_the_Details'];
const outputDir = path.join(__dirname, '..', 'public', 'videos');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

inputDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) return;
  
  const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.mp4'));
  
  files.forEach(file => {
    const inputPath = path.join(dirPath, file);
    const outputPath = path.join(outputDir, file);
    
    console.log(`Compressing ${file}...`);
    
    ffmpeg(inputPath)
      .outputOptions([
        '-vcodec libx264',
        '-crf 28',             // Heavy compression for small size
        '-preset superfast',   // Extremely fast encoding speed
        '-an',                 // Strip all audio data
        '-movflags +faststart',// Optimize for web streaming
        '-vf scale=-2:1080'    // Scale to max 1080p
      ])
      .save(outputPath)
      .on('end', () => console.log(`✓ Finished compressing ${file}`))
      .on('error', (err) => console.error(`✗ Error compressing ${file}: ${err.message}`));
  });
});
