import pdf from 'pdf-parse';
import { ParsedQuestion } from '../types';

interface ParseResult {
  questions: ParsedQuestion[];
  errors: string[];
  totalFound: number;
}

export const parsePdfBuffer = async (buffer: Buffer, subject: string = '', topic: string = ''): Promise<ParseResult> => {
  const errors: string[] = [];
  const questions: ParsedQuestion[] = [];

  try {
    const data = await pdf(buffer);
    const text: string = data.text || '';
    
    // Split by question number patterns: "1.", "1)", "Q1.", "Q.1", etc.
    const questionBlocks = text.split(/(?=(?:^|\n)\s*(?:Q\.?\s*)?(\d+)\s*[.)]\s)/gm);
    
    let rawBlocks: string[] = [];
    
    // Re-join split parts into complete question blocks
    for (let i = 0; i < questionBlocks.length; i++) {
      const block = questionBlocks[i].trim();
      if (!block) continue;
      
      // Check if block starts with a question number pattern
      const isQuestion = /^(?:Q\.?\s*)?\d+\s*[.)]/i.test(block);
      if (isQuestion) {
        rawBlocks.push(block);
      } else if (rawBlocks.length > 0) {
        // Append to previous block
        rawBlocks[rawBlocks.length - 1] += '\n' + block;
      }
    }

    // If the simple split didn't work, try another pattern
    if (rawBlocks.length === 0) {
      rawBlocks = text.split(/\n\s*\n/).filter(b => b.trim().length > 20);
    }

    for (let i = 0; i < rawBlocks.length; i++) {
      try {
        const parsed = parseQuestionBlock(rawBlocks[i], i + 1);
        if (parsed) {
          parsed.subject = subject || 'Physiology';
          parsed.topic = topic || 'General';
          questions.push(parsed);
        }
      } catch (err: any) {
        errors.push(`Block ${i + 1}: ${err.message}`);
      }
    }

    // Fallback: If 0 questions were parsed, use the custom line-by-line algorithm (Question -> 5 Options -> Answer number)
    if (questions.length === 0) {
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      let lastAnswerIndex = -1;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/^[1-5]$/.test(line)) {
          const correctOptionIndex = parseInt(line, 10) - 1;
          
          if (i - lastAnswerIndex > 5) {
            const options = [
              lines[i-5],
              lines[i-4],
              lines[i-3],
              lines[i-2],
              lines[i-1]
            ];
            
            const questionTextLines = lines.slice(lastAnswerIndex + 1, i - 5);
            let questionText = questionTextLines.join(' ').trim();
            questionText = questionText.replace(/^\d+\s+/, ''); // Remove leading numbers
            
            if (questionText.length > 15 && options.every(o => o.length > 0)) {
              questions.push({
                questionText,
                options,
                correctOptionIndex,
                explanation: `The correct option is ${options[correctOptionIndex]}.`,
                subject: subject || 'Physiology',
                topic: topic || 'General Physiology',
              });
            }
          }
          lastAnswerIndex = i;
        }
      }
    }

    return {
      questions,
      errors,
      totalFound: questions.length || rawBlocks.length,
    };
  } catch (err: any) {
    return {
      questions: [],
      errors: [`PDF parse error: ${err.message}`],
      totalFound: 0,
    };
  }
};

function parseQuestionBlock(block: string, index: number): ParsedQuestion | null {
  const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  if (lines.length < 3) return null;

  // Extract question text (remove question number prefix)
  let questionText = lines[0].replace(/^(?:Q\.?\s*)?\d+\s*[.)]\s*/, '').trim();
  
  // Collect more question lines until we hit an option
  let optionStartIndex = 1;
  for (let i = 1; i < lines.length; i++) {
    if (/^[a-dA-D][.)]\s/.test(lines[i]) || /^\([a-dA-D]\)\s/.test(lines[i])) {
      optionStartIndex = i;
      break;
    }
    questionText += ' ' + lines[i];
  }

  // Extract options
  const options: string[] = [];
  let answerLine = '';
  
  for (let i = optionStartIndex; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this is an option line
    const optionMatch = line.match(/^(?:([a-dA-D])[.)]\s*|\(([a-dA-D])\)\s*)(.*)/);
    if (optionMatch) {
      const optionText = optionMatch[3]?.trim() || '';
      if (optionText) {
        options.push(optionText);
      }
      continue;
    }
    
    // Check if this is an answer line
    const answerMatch = line.match(/(?:ans(?:wer)?|correct|key)\s*[.:)]\s*([a-dA-D])/i);
    if (answerMatch) {
      answerLine = answerMatch[1].toLowerCase();
      continue;
    }

    // Check for standalone answer indicator
    const standaloneAnswer = line.match(/^(?:Ans\s*[-:.]?\s*)?([a-dA-D])\s*$/i);
    if (standaloneAnswer && options.length >= 2) {
      answerLine = standaloneAnswer[1].toLowerCase();
    }
  }

  if (options.length < 2) return null;
  
  // Map answer letter to index
  let correctOptionIndex = 0;
  if (answerLine) {
    correctOptionIndex = answerLine.charCodeAt(0) - 'a'.charCodeAt(0);
  }
  
  // Validate index
  if (correctOptionIndex < 0 || correctOptionIndex >= options.length) {
    correctOptionIndex = 0;
  }

  // Clean up question text
  questionText = questionText.replace(/\s+/g, ' ').trim();
  
  if (questionText.length < 10) return null;

  return {
    questionText,
    options,
    correctOptionIndex,
    explanation: '',
    subject: '',
    topic: '',
  };
}

export const detectDuplicates = (
  newQuestions: ParsedQuestion[],
  existingTexts: string[]
): { unique: ParsedQuestion[]; duplicates: ParsedQuestion[] } => {
  const existingSet = new Set(existingTexts.map(t => normalizeText(t)));
  const unique: ParsedQuestion[] = [];
  const duplicates: ParsedQuestion[] = [];

  for (const q of newQuestions) {
    const normalized = normalizeText(q.questionText);
    if (existingSet.has(normalized)) {
      duplicates.push(q);
    } else {
      existingSet.add(normalized);
      unique.push(q);
    }
  }

  return { unique, duplicates };
};

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 100);
}
