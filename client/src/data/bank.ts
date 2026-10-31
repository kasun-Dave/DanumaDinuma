import { guestQuestions, type GuestQuestion } from '@/data/guestQuestions';
import { sinhalaQuestions } from '@/data/sinhalaQuestions';

export { guestTests, type GuestTest } from '@/data/guestTests';

// Every question available in guest mode: Sinhala current affairs first, then the English physiology set.
export const allQuestions: GuestQuestion[] = [...sinhalaQuestions, ...guestQuestions];
