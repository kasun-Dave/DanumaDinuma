import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { Question, User } from '../models';
import { parsePdfBuffer, detectDuplicates } from './pdfParser';

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
    console.log('⚙️ Parsing PDF. This might take a few moments...');

    const result = await parsePdfBuffer(fileBuffer, 'Physiology', 'General Physiology');
    console.log(`✅ Parsing complete!`);
    console.log(`📊 Found raw blocks: ${result.totalFound}`);
    console.log(`📝 Parsed questions: ${result.questions.length}`);
    console.log(`⚠️ Errors: ${result.errors.length}`);

    if (result.errors.length > 0 && result.errors.length < 20) {
      console.log('Parsing Warnings:', result.errors);
    } else if (result.errors.length >= 20) {
      console.log(`Skipped displaying ${result.errors.length} warnings.`);
    }

    if (result.questions.length === 0) {
      console.log('❌ No questions could be extracted from the PDF. Exiting.');
      process.exit(0);
    }

    console.log('🔍 Checking for duplicates in database...');
    const existingQuestions = await Question.find({}).select('questionText').lean();
    const existingTexts = existingQuestions.map((q) => q.questionText);
    
    const { unique, duplicates } = detectDuplicates(result.questions, existingTexts);
    console.log(`👉 Unique questions to import: ${unique.length}`);
    console.log(`👉 Duplicate questions skipped: ${duplicates.length}`);

    if (unique.length === 0) {
      console.log('✅ All parsed questions already exist in the database. Nothing to import!');
      process.exit(0);
    }

    // Get admin user as creator
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('⚠️ No admin user found in database. The questions will be imported without a createdBy user reference.');
    }

    const finalQuestions = unique.map((q) => ({
      ...q,
      createdBy: adminUser?._id || null,
      isPublished: true, // Make them active and accessible immediately
      source: 'pdf_import'
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
