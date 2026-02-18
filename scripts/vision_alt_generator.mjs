import fs from 'node:fs';
import path from 'node:path';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import 'dotenv/config';

// Configuration
const DATA_FILE = path.join(process.cwd(), 'data', 'artworks-metadata.json');
const IMAGES_DIR = process.cwd();

// Sovereign Persona Prompt
const SYSTEM_PROMPT = `
Actúa como Naroa (artista conceptual, tono Industrial Noir, profundo pero conciso).
Describe esta obra de arte para una persona invidente.
No digas "imagen de..." ni "esto es...". Empieza directamente con la esencia visual.
Usa vocabulario sensorial, emocional y técnico (si aplica).
Ejemplo: "Una explosión de cian eléctrico corta la oscuridad, revelando texturas de hormigón desgastado."
Máximo 25 palabras. Idioma: Español.
`;

async function main() {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    console.error('❌ ERROR: GOOGLE_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY environment variable is missing.');
    process.exit(1);
  }
  process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey; // Ensure SDK finds it

  console.log('👁️  VISION-FOR-ALT: Sovereign Protocol Initiated...');

  // 1. Load Data
  if (!fs.existsSync(DATA_FILE)) {
    console.error(`❌ Data file not found: ${DATA_FILE}`);
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  const artworks = data.artworks;
  let updatedCount = 0;

  console.log(`📂 Loaded ${artworks.length} artworks.`);

  // 2. Process Artworks
  for (const artwork of artworks) {
    // Skip if altText already exists and looks "Sovereign" (long enough, no generic prefixes)
    // For now, let's process only those explicitly marked or empty.
    // Actually, let's process ALL that have an image file, to ensure sovereign quality.
    // Users can interrupt if needed. But consistent tone is key.
    
    // Check if image exists locally
    const imagePath = path.join(IMAGES_DIR, artwork.image);
    if (!fs.existsSync(imagePath)) {
      console.warn(`⚠️  Image not found: ${artwork.image} (Skipping)`);
      continue;
    }

    // Heuristics to skip robust descriptions if not forced (can add --force arg later)
    if (artwork.altText && artwork.altText.length > 50 && !process.argv.includes('--force')) {
        // Assume existing long description is okay for now, unless force
        // console.log(`⏭️  Skipping ${artwork.id} (Existing Alt: "${artwork.altText.substring(0, 20)}...")`);
        continue; 
    }

    console.log(`🎨 Processing: ${artwork.id}...`);

    try {
      const imageBuffer = fs.readFileSync(imagePath);
      
      const { text } = await generateText({
        model: google('gemini-2.0-flash-001'), // Back to 2.0
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Describe esta obra.' },
              { type: 'image', image: imageBuffer }
            ]
          }
        ]
      });

      console.log(`   ✨ Generated: "${text}"`);
      artwork.altText = text.trim();
      updatedCount++;

      // Save periodically to avoid losing progress
      if (updatedCount % 5 === 0) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        console.log('💾 Partial save.');
      }

    } catch (error) {
      console.error(`❌ Failed to generate for ${artwork.id}:`, error.message);
      if (error.message.includes('429') || error.message.includes('Quota')) {
        console.log('⏳ Quota hit. Sleeping for 60s...');
        await new Promise(resolve => setTimeout(resolve, 60000));
      }
    }
    
    // Rate limit: Sleep 10s always to be safe
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  // 3. Final Save
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  console.log(`\n✅ MISSION COMPLETE. Updated ${updatedCount} artworks with Sovereign Alt Text.`);
}

main().catch(console.error);
