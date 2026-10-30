import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

const PDF_PATH = path.resolve(__dirname, '../../../full physiology.pdf');

async function main() {
  try {
    const fileBuffer = fs.readFileSync(PDF_PATH);
    const data = await pdf(fileBuffer);
    const text = data.text || '';
    
    console.log('--- FIRST 2000 CHARACTERS OF PDF TEXT ---');
    console.log(text.substring(0, 2000));
    console.log('----------------------------------------');

    // Let's also split by blocks like the parser does
    const questionBlocks = text.split(/(?=(?:^|\n)\s*(?:Q\.?\s*)?(\d+)\s*[.)]\s)/gm);
    console.log(`Split size: ${questionBlocks.length}`);
    
    let sampleCount = 0;
    for (let i = 0; i < questionBlocks.length; i++) {
      const block = questionBlocks[i].trim();
      if (!block) continue;
      sampleCount++;
      console.log(`\n--- BLOCK #${sampleCount} ---`);
      console.log(block);
      console.log('---------------------------');
      if (sampleCount >= 5) break;
    }
  } catch (error) {
    console.error('Error checking PDF format:', error);
  }
}

main();
