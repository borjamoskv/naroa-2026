const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Recursive function to get all images
function getImages(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getImages(file));
    } else {
      if (file.match(/\.(png|jpg|jpeg)$/i)) {
        results.push(file);
      }
    }
  });
  return results;
}

const publicDir = 'public/images';
if (!fs.existsSync(publicDir)) {
    console.error(`Directory ${publicDir} not found!`);
    process.exit(1);
}

console.log(`Scanning ${publicDir} for images...`);
const files = getImages(publicDir);
console.log(`Found ${files.length} images to process.`);

(async () => {
    for (const file of files) {
        const dir = path.dirname(file);
        const ext = path.extname(file);
        const name = path.basename(file, ext);
        const output = path.join(dir, `${name}.webp`);

        if (fs.existsSync(output)) {
            // console.log(`Skipping ${name}, .webp already exists.`);
            continue;
        }

        try {
            await sharp(file)
                .webp({ quality: 85, smartSubsample: true, effort: 6 }) // Effort 6 = proper compression
                .toFile(output);
            console.log(`✅ Converted: ${name}${ext} -> .webp`);
        } catch (err) {
            console.error(`❌ Error converting ${file}:`, err);
        }
    }
    console.log("✨ Asset Sovereignty: Image optimization complete.");
})();
