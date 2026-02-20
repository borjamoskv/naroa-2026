/**
 * 🚀 IPFS Uploader (Pinata)
 * 
 * Uploads all images from public/images/gallery to IPFS via Pinata.
 * Generates public/data/ipfs-manifest.json mapping artwork IDs to CIDs.
 * 
 * Usage:
 *   export PINATA_API_KEY=your_key
 *   export PINATA_SECRET_KEY=your_secret
 *   node scripts/ipfs-upload.js
 */

const fs = require('fs');
const path = require('path');
const pinataSDK = require('@pinata/sdk');

// Config
const GALLERY_DIR = path.join(__dirname, '../public/images/gallery');
const MANIFEST_PATH = path.join(__dirname, '../public/data/ipfs-manifest.json');

// Initialize SDK
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_KEY);

async function uploadImages() {
  Logger.debug('🚀 Starting IPFS Upload via Pinata...');
  
  // 1. Check auth
  try {
    const auth = await pinata.testAuthentication();
    Logger.debug(`✅ Authenticated: ${auth.message}`);
  } catch (err) {
    console.error('❌ Auth failed. Check PINATA_API_KEY and PINATA_SECRET_KEY');
    process.exit(1);
  }

  // 2. Read gallery files
  if (!fs.existsSync(GALLERY_DIR)) {
    console.error(`❌ Gallery dir not found: ${GALLERY_DIR}`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(GALLERY_DIR).filter(f => f.endsWith('.webp'));
  Logger.debug(`📂 Found ${files.length} .webp images to upload`);

  // 3. Load existing manifest (to avoid re-uploading)
  let manifest = { artworks: {} };
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
      Logger.debug(`📘 Loaded existing manifest with ${Object.keys(manifest.artworks).length} entries`);
    } catch (e) {
      Logger.warn('⚠️ Could not parse existing manifest, starting fresh');
    }
  }

  // 4. Upload loop
  let newUploads = 0;
  
  for (const file of files) {
    const id = path.basename(file, '.webp');
    
    // Skip if already has CID
    if (manifest.artworks[id] && manifest.artworks[id].cid) {
      // Logger.debug(`⏭️  Skipping ${id} (already pinned)`);
      continue;
    }

    const filePath = path.join(GALLERY_DIR, file);
    const readableStream = fs.createReadStream(filePath);

    try {
      Logger.debug(`📤 Uploading ${file}...`);
      const options = {
        pinataMetadata: {
          name: `naroa-gallery-${id}`,
          keyvalues: {
            project: 'naroa-2026',
            type: 'artwork'
          }
        },
        pinataOptions: {
          cidVersion: 1
        }
      };

      const result = await pinata.pinFileToIPFS(readableStream, options);
      const size = fs.statSync(filePath).size;
      
      manifest.artworks[id] = {
        cid: result.IpfsHash,
        gateway: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
        size: size,
        format: 'webp',
        timestamp: new Date().toISOString()
      };
      
      Logger.debug(`✅ Pinned: ${result.IpfsHash}`);
      newUploads++;
      
      // Save incrementally (safety first)
      fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
      
    } catch (err) {
      console.error(`❌ Failed to upload ${file}:`, err.message);
    }
  }

  Logger.debug(`\n🎉 Done! ${newUploads} new files uploaded.`);
  Logger.debug(`📄 Manifest saved to ${MANIFEST_PATH}`);
}

uploadImages().catch(err => console.error('FATAL ERROR:', err));
