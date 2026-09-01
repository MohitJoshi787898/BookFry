const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const brainDir = 'C:/Users/mohit/.gemini/antigravity/brain/99678e39-2944-4e3f-8f60-4b7fed76e08f';
const outDir = path.resolve(__dirname, 'public/assets/bookfry');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Function to remove white/near-white background from an image buffer
async function removeWhiteBg(inputPath) {
  const image = sharp(inputPath);
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Perform smooth alpha keying for white background
  // For pixels close to white (R>240, G>240, B>240), make transparent
  // For edge pixels (220-240), feather alpha smoothly
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const minVal = Math.min(r, g, b);
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));

    // If pixel is nearly neutral white/light grey
    if (minVal > 248 && maxDiff < 10) {
      data[i + 3] = 0; // fully transparent
    } else if (minVal > 230 && maxDiff < 15) {
      const factor = (248 - minVal) / 18;
      data[i + 3] = Math.round(data[i + 3] * Math.max(0, Math.min(1, factor)));
    }
  }

  return sharp(data, { raw: { width, height, channels } });
}

async function processAll() {
  console.log('Processing assets into', outDir);

  // 1. Existing Fox Reading (already transparent PNG)
  const existingFox = path.resolve(__dirname, 'public/fox_reading_178491148655455.png');
  if (fs.existsSync(existingFox)) {
    await sharp(existingFox).png().toFile(path.join(outDir, 'bookfry-fox-reading.png'));
    await sharp(existingFox).webp({ quality: 90 }).toFile(path.join(outDir, 'bookfry-fox-reading.webp'));
    console.log('Processed bookfry-fox-reading');
  }

  // 2. Fox Pointing
  const foxPointing = path.join(brainDir, 'fox_pointing_mascot_1787683477999.jpg');
  if (fs.existsSync(foxPointing)) {
    const processed = await removeWhiteBg(foxPointing);
    await processed.clone().png().toFile(path.join(outDir, 'bookfry-fox-pointing.png'));
    await processed.clone().webp({ quality: 90 }).toFile(path.join(outDir, 'bookfry-fox-pointing.webp'));
    console.log('Processed bookfry-fox-pointing');
  }

  // 3. Fox Floating
  const foxFloating = path.join(brainDir, 'fox_floating_reading_1787683560349.jpg');
  if (fs.existsSync(foxFloating)) {
    const processed = await removeWhiteBg(foxFloating);
    await processed.clone().png().toFile(path.join(outDir, 'bookfry-fox-floating.png'));
    await processed.clone().webp({ quality: 90 }).toFile(path.join(outDir, 'bookfry-fox-floating.webp'));
    console.log('Processed bookfry-fox-floating');
  }

  // 4. Large Book Stack
  const bookStack = path.join(brainDir, 'book_stack_large_1787683509522.jpg');
  if (fs.existsSync(bookStack)) {
    const processed = await removeWhiteBg(bookStack);
    await processed.clone().png().toFile(path.join(outDir, 'book-stack-large.png'));
    await processed.clone().webp({ quality: 90 }).toFile(path.join(outDir, 'book-stack-large.webp'));
    console.log('Processed book-stack-large');
  }

  // 5. Reading Plant
  const plant = path.join(brainDir, 'reading_plant_1787683533902.jpg');
  if (fs.existsSync(plant)) {
    const processed = await removeWhiteBg(plant);
    await processed.clone().png().toFile(path.join(outDir, 'reading-plant.png'));
    await processed.clone().webp({ quality: 90 }).toFile(path.join(outDir, 'reading-plant.webp'));
    console.log('Processed reading-plant');
  }

  // 6. Floating Books
  const floatingBooks = path.join(brainDir, 'floating_books_1787683584494.jpg');
  if (fs.existsSync(floatingBooks)) {
    const processed = await removeWhiteBg(floatingBooks);
    await processed.clone().png().toFile(path.join(outDir, 'floating-books.png'));
    await processed.clone().webp({ quality: 90 }).toFile(path.join(outDir, 'floating-books.webp'));
    console.log('Processed floating-books');
  }

  // 7. Medium Book Stack
  const bookStackMed = path.join(brainDir, 'book_stack_medium_1787683713006.jpg');
  if (fs.existsSync(bookStackMed)) {
    const processed = await removeWhiteBg(bookStackMed);
    await processed.clone().png().toFile(path.join(outDir, 'book-stack-medium.png'));
    await processed.clone().webp({ quality: 90 }).toFile(path.join(outDir, 'book-stack-medium.webp'));
    console.log('Processed book-stack-medium');
  }

  // 8. Reading Elements
  const readingElements = path.join(brainDir, 'reading_elements_1787683741352.jpg');
  if (fs.existsSync(readingElements)) {
    const processed = await removeWhiteBg(readingElements);
    await processed.clone().png().toFile(path.join(outDir, 'reading-elements.png'));
    await processed.clone().webp({ quality: 90 }).toFile(path.join(outDir, 'reading-elements.webp'));
    console.log('Processed reading-elements');
  }

  console.log('All mandatory assets successfully created in public/assets/bookfry/ !');
}

processAll().catch(err => {
  console.error('Error processing assets:', err);
  process.exit(1);
});
