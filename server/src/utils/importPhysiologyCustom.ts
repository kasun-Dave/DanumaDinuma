import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import pdf from 'pdf-parse';
dotenv.config();

import { Question, User } from '../models';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/danumadinuma';
const PDF_PATH = path.resolve(__dirname, '../../../full physiology.pdf');

async function main() {
  try {
    console.log(`📡 Connecting to MongoDB at: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected successfully!');

    console.log(`📄 Checking for PDF at: ${PDF_PATH}`);
    if (!fs.existsSync(PDF_PATH)) {
      throw new Error(`PDF file not found at path: ${PDF_PATH}`);
    }

    const fileBuffer = fs.readFileSync(PDF_PATH);
    console.log(`⚡ PDF found! File size: ${(fileBuffer.length / (1024 * 1024)).toFixed(2)} MB`);
    console.log('⚙️ Parsing PDF using custom line-by-line algorithm...');

    const data = await pdf(fileBuffer);
    const text = data.text || '';
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    console.log(`📊 Total lines extracted: ${lines.length}`);

    const parsedQuestions = [];
    let lastAnswerIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Check if the line is exactly a single digit 1-5 (indicating the correct option)
      if (/^[1-5]$/.test(line)) {
        const correctOptionIndex = parseInt(line, 10) - 1;
        
        // Ensure we have at least 5 lines between this answer and the last answer
        if (i - lastAnswerIndex > 5) {
          const options = [
            lines[i-5],
            lines[i-4],
            lines[i-3],
            lines[i-2],
            lines[i-1]
          ];
          
          // Question text is everything between the last answer and the options
          const questionTextLines = lines.slice(lastAnswerIndex + 1, i - 5);
          let questionText = questionTextLines.join(' ').trim();
          
          // Clean up any stray numbers or page header artifacts at the start of question text
          questionText = questionText.replace(/^\d+\s+/, ''); // Remove leading numbers if present
          
          // Validation: Ensure question text is long enough and options are filled
          if (questionText.length > 15 && options.every(o => o.length > 0)) {
            parsedQuestions.push({
              subject: 'Physiology',
              topic: 'General Physiology',
              questionText,
              options,
              correctOptionIndex,
              explanation: `The correct option is ${options[correctOptionIndex]}.`,
              difficulty: 'medium',
              isPublished: true,
              source: 'pdf_import'
            });
          }
        }
        lastAnswerIndex = i;
      }
    }

    console.log(`📝 Successfully parsed ${parsedQuestions.length} physiology questions!`);

    if (parsedQuestions.length === 0) {
      console.log('❌ No questions could be extracted. Check the PDF format logic.');
      process.exit(1);
    }

    console.log('🔍 Checking for duplicates in database...');
    const existingQuestions = await Question.find({}).select('questionText').lean();
    const existingSet = new Set(existingQuestions.map(q => q.questionText.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 100)));
    
    const uniqueQuestions = [];
    const duplicates = [];

    for (const q of parsedQuestions) {
      const normalized = q.questionText.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 100);
      if (existingSet.has(normalized)) {
        duplicates.push(q);
      } else {
        existingSet.add(normalized);
        uniqueQuestions.push(q);
      }
    }

    console.log(`👉 Unique questions to import: ${uniqueQuestions.length}`);
    console.log(`👉 Duplicate questions skipped: ${duplicates.length}`);

    if (uniqueQuestions.length === 0) {
      console.log('✅ All parsed questions already exist in the database. Nothing to import!');
      process.exit(0);
    }

    // Get admin user as creator reference
    const adminUser = await User.findOne({ role: 'admin' });
    const finalQuestions = uniqueQuestions.map(q => ({
      ...q,
      createdBy: adminUser?._id || null
    }));

    console.log('💾 Saving questions to database...');
    const saved = await Question.insertMany(finalQuestions);
    console.log(`🎉 Success! Saved ${saved.length} new physiology questions directly to the database.`);

    const totalQuestionsCount = await Question.countDocuments();
    console.log(`📈 New total active questions count in database: ${totalQuestionsCount}`);

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Critical error during import:', error);
    process.exit(1);
  }
}

main();
