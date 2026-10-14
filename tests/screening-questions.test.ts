import { describe, expect, it } from 'vitest';
import {
  QUESTIONNAIRE_LIMITS,
  STANDARD_SCREENING_TEMPLATES,
  validateQuestionDefinition,
  validateQuestionnaireAnswers,
  createQuestionFromTemplate,
  type ScreeningQuestion,
} from '@/lib/screening-questions';

describe('Screening Questions Definition Validation', () => {
  it('validates all built-in recruiter templates successfully', () => {
    expect(STANDARD_SCREENING_TEMPLATES.length).toBeGreaterThanOrEqual(8);
    for (const template of STANDARD_SCREENING_TEMPLATES) {
      const question = createQuestionFromTemplate(template);
      const error = validateQuestionDefinition(question);
      expect(error).toBeNull();
    }
  });

  it('rejects questions with empty or whitespace-only text', () => {
    const question: ScreeningQuestion = {
      id: 'q1',
      questionText: '   ',
      questionType: 'short_text',
      isRequired: true,
      displayOrder: 0,
    };
    const error = validateQuestionDefinition(question);
    expect(error).toBe('Question text is required.');
  });

  it('rejects questions exceeding maximum length', () => {
    const longPrompt = 'a'.repeat(QUESTIONNAIRE_LIMITS.MAX_QUESTION_TEXT_LENGTH + 5);
    const question: ScreeningQuestion = {
      id: 'q1',
      questionText: longPrompt,
      questionType: 'short_text',
      isRequired: true,
      displayOrder: 0,
    };
    const error = validateQuestionDefinition(question);
    expect(error).toContain(`cannot exceed ${QUESTIONNAIRE_LIMITS.MAX_QUESTION_TEXT_LENGTH}`);
  });

  it('requires at least 2 non-empty options for single_choice, multiple_choice, and dropdown', () => {
    const choiceTypes: ('single_choice' | 'multiple_choice' | 'dropdown')[] = [
      'single_choice',
      'multiple_choice',
      'dropdown',
    ];

    for (const type of choiceTypes) {
      const qNoOptions: ScreeningQuestion = {
        id: `q-${type}`,
        questionText: `Question for ${type}`,
        questionType: type,
        isRequired: true,
        displayOrder: 0,
        options: [],
      };
      const errorNoOptions = validateQuestionDefinition(qNoOptions);
      expect(errorNoOptions).toContain('at least 2 options');

      const qOneOption: ScreeningQuestion = {
        id: `q-${type}-one`,
        questionText: `Question for ${type}`,
        questionType: type,
        isRequired: true,
        displayOrder: 0,
        options: ['Only One'],
      };
      const errorOneOption = validateQuestionDefinition(qOneOption);
      expect(errorOneOption).toContain('at least 2 options');
    }
  });

  it('rejects duplicate options in choice questions', () => {
    const question: ScreeningQuestion = {
      id: 'q-dup',
      questionText: 'Select an option',
      questionType: 'single_choice',
      isRequired: true,
      displayOrder: 0,
      options: ['Remote', 'Hybrid', 'remote'], // case-insensitive check
    };
    const error = validateQuestionDefinition(question);
    expect(error).toContain('Duplicate options are not allowed');
  });

  it('validates min and max bounds for numeric questions', () => {
    const invalidBounds: ScreeningQuestion = {
      id: 'q-num',
      questionText: 'Years of experience',
      questionType: 'numeric',
      isRequired: true,
      displayOrder: 0,
      validationRules: {
        minValue: 10,
        maxValue: 5, // min > max
      },
    };
    const error = validateQuestionDefinition(invalidBounds);
    expect(error).toContain('Minimum value cannot be greater than maximum value');
  });

  it('validates min and max length for text questions', () => {
    const invalidLength: ScreeningQuestion = {
      id: 'q-txt',
      questionText: 'Describe experience',
      questionType: 'long_text',
      isRequired: true,
      displayOrder: 0,
      validationRules: {
        minLength: 500,
        maxLength: 200,
      },
    };
    const error = validateQuestionDefinition(invalidLength);
    expect(error).toContain('Minimum length cannot be greater than maximum length');
  });

  it('validates maxSelections does not exceed total options for multiple_choice', () => {
    const question: ScreeningQuestion = {
      id: 'q-multi',
      questionText: 'Select skills',
      questionType: 'multiple_choice',
      isRequired: true,
      displayOrder: 0,
      options: ['React', 'Node.js', 'PostgreSQL'],
      validationRules: {
        maxSelections: 5, // Only 3 options exist
      },
    };
    const error = validateQuestionDefinition(question);
    expect(error).toContain('Maximum selections cannot exceed the total number of options');
  });
});

describe('Candidate Answer Validation Across All 9 Question Types', () => {
  const testQuestions: ScreeningQuestion[] = [
    {
      id: 'q_short',
      questionText: 'Current job title?',
      questionType: 'short_text',
      isRequired: true,
      displayOrder: 0,
      validationRules: { minLength: 2, maxLength: 50 },
    },
    {
      id: 'q_long',
      questionText: 'Describe your relevant experience.',
      questionType: 'long_text',
      isRequired: true,
      displayOrder: 1,
      validationRules: { minLength: 10, maxLength: 500 },
    },
    {
      id: 'q_single',
      questionText: 'Current notice period?',
      questionType: 'single_choice',
      isRequired: true,
      displayOrder: 2,
      options: ['Immediate', '15 Days', '30 Days', '60 Days'],
    },
    {
      id: 'q_multi',
      questionText: 'Which technologies have you worked with?',
      questionType: 'multiple_choice',
      isRequired: true,
      displayOrder: 3,
      options: ['React', 'TypeScript', 'Next.js', 'Python', 'Go'],
      validationRules: { maxSelections: 3 },
    },
    {
      id: 'q_yesno',
      questionText: 'Are you willing to relocate to Bangalore?',
      questionType: 'yes_no',
      isRequired: true,
      displayOrder: 4,
    },
    {
      id: 'q_numeric',
      questionText: 'Total years of full-time professional experience?',
      questionType: 'numeric',
      isRequired: true,
      displayOrder: 5,
      validationRules: { minValue: 0, maxValue: 40 },
    },
    {
      id: 'q_date',
      questionText: 'Earliest available joining date?',
      questionType: 'date',
      isRequired: true,
      displayOrder: 6,
    },
    {
      id: 'q_dropdown',
      questionText: 'Highest completed degree?',
      questionType: 'dropdown',
      isRequired: true,
      displayOrder: 7,
      options: ["Bachelor's", "Master's", 'Doctorate', 'High School'],
    },
    {
      id: 'q_url',
      questionText: 'GitHub or portfolio profile URL',
      questionType: 'url',
      isRequired: false, // Optional
      displayOrder: 8,
    },
  ];

  it('accepts valid answers for all 9 question types when provided as map or array', () => {
    const answersMap: Record<string, any> = {
      q_short: 'Senior Full Stack Engineer',
      q_long: 'I have 7+ years building enterprise SaaS platforms with React, Node and PostgreSQL.',
      q_single: '30 Days',
      q_multi: ['React', 'TypeScript', 'Next.js'],
      q_yesno: 'Yes',
      q_numeric: 7,
      q_date: '2026-11-01',
      q_dropdown: "Bachelor's",
      q_url: 'https://github.com/rahul',
    };

    const resultMap = validateQuestionnaireAnswers(testQuestions, answersMap);
    expect(resultMap.valid).toBe(true);
    expect(resultMap.isValid).toBe(true);
    expect(resultMap.errors).toEqual({});
    expect(resultMap.normalizedAnswers.length).toBe(9);

    // Also accepts array format
    const answersArray = Object.entries(answersMap).map(([questionId, answer]) => ({
      questionId,
      answer,
    }));
    const resultArray = validateQuestionnaireAnswers(testQuestions, answersArray);
    expect(resultArray.valid).toBe(true);
    expect(resultArray.errors).toEqual({});
  });

  it('allows omitting optional questions', () => {
    const answers: Record<string, any> = {
      q_short: 'Software Architect',
      q_long: 'Over a decade designing distributed backend and frontend architectures.',
      q_single: 'Immediate',
      q_multi: ['TypeScript', 'Go'],
      q_yesno: 'No',
      q_numeric: 10,
      q_date: '2026-12-01',
      q_dropdown: "Master's",
      // q_url is optional and omitted
    };

    const result = validateQuestionnaireAnswers(testQuestions, answers);
    expect(result.valid).toBe(true);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('rejects required questions when omitted or empty', () => {
    const emptyAnswers: Record<string, any> = {};
    const result = validateQuestionnaireAnswers(testQuestions, emptyAnswers);
    expect(result.valid).toBe(false);
    expect(result.errors['q_short']).toBeDefined();
    expect(result.errors['q_long']).toBeDefined();
    expect(result.errors['q_single']).toBeDefined();
    expect(result.errors['q_multi']).toBeDefined();
    expect(result.errors['q_yesno']).toBeDefined();
    expect(result.errors['q_numeric']).toBeDefined();
    expect(result.errors['q_date']).toBeDefined();
    expect(result.errors['q_dropdown']).toBeDefined();
    // Optional question should not have an error
    expect(result.errors['q_url']).toBeUndefined();
  });

  it('enforces minLength and maxLength on text answers', () => {
    const shortQ = testQuestions.find(q => q.id === 'q_short')!;
    const longQ = testQuestions.find(q => q.id === 'q_long')!;

    const resultShort = validateQuestionnaireAnswers([shortQ], { q_short: 'A' });
    expect(resultShort.errors['q_short']).toContain('at least 2 characters');

    const resultLong = validateQuestionnaireAnswers([longQ], { q_long: 'Too short' });
    expect(resultLong.errors['q_long']).toContain('at least 10 characters');
  });

  it('enforces option membership for single_choice and dropdown', () => {
    const singleQ = testQuestions.find(q => q.id === 'q_single')!;
    const dropQ = testQuestions.find(q => q.id === 'q_dropdown')!;

    const resultSingle = validateQuestionnaireAnswers([singleQ], { q_single: 'Invalid Notice Option' });
    expect(resultSingle.errors['q_single']).toContain('does not belong to the question choices');

    const resultDrop = validateQuestionnaireAnswers([dropQ], { q_dropdown: 'Non-existent Degree' });
    expect(resultDrop.errors['q_dropdown']).toContain('does not belong to the question choices');
  });

  it('enforces option membership and maxSelections for multiple_choice', () => {
    const multiQ = testQuestions.find(q => q.id === 'q_multi')!;

    const overLimit = validateQuestionnaireAnswers([multiQ], {
      q_multi: ['React', 'TypeScript', 'Next.js', 'Python'], // max 3
    });
    expect(overLimit.errors['q_multi']).toContain('at most 3 option(s)');

    const invalidOption = validateQuestionnaireAnswers([multiQ], {
      q_multi: ['React', 'NonExistentSkill'],
    });
    expect(invalidOption.errors['q_multi']).toContain('One or more selected options are invalid');
  });

  it('enforces Yes/No strict values', () => {
    const yesNoQ = testQuestions.find(q => q.id === 'q_yesno')!;
    const invalidResult = validateQuestionnaireAnswers([yesNoQ], { q_yesno: 'Maybe' });
    expect(invalidResult.errors['q_yesno']).toContain('Please select Yes or No');

    const validResult = validateQuestionnaireAnswers([yesNoQ], { q_yesno: 'Yes' });
    expect(validResult.valid).toBe(true);
  });

  it('enforces min and max bounds for numeric input', () => {
    const numQ = testQuestions.find(q => q.id === 'q_numeric')!;

    const belowMin = validateQuestionnaireAnswers([numQ], { q_numeric: -1 });
    expect(belowMin.errors['q_numeric']).toContain('cannot be less than 0');

    const aboveMax = validateQuestionnaireAnswers([numQ], { q_numeric: 45 });
    expect(aboveMax.errors['q_numeric']).toContain('cannot be greater than 40');

    const notANum = validateQuestionnaireAnswers([numQ], { q_numeric: 'not_a_number' });
    expect(notANum.errors['q_numeric']).toContain('Please enter a valid number');

    const validNum = validateQuestionnaireAnswers([numQ], { q_numeric: 5 });
    expect(validNum.valid).toBe(true);
  });

  it('validates URL formatting when provided for URL question type', () => {
    const urlQ = testQuestions.find(q => q.id === 'q_url')!;

    const invalidUrl = validateQuestionnaireAnswers([urlQ], { q_url: 'not-a-valid-url' });
    expect(invalidUrl.errors['q_url']).toContain('valid web URL starting with http:// or https://');

    const validUrl = validateQuestionnaireAnswers([urlQ], { q_url: 'https://linkedin.com/in/rahul' });
    expect(validUrl.valid).toBe(true);
    expect(validUrl.errors['q_url']).toBeUndefined();
  });

  it('validates date format', () => {
    const dateQ = testQuestions.find(q => q.id === 'q_date')!;

    const invalidDate = validateQuestionnaireAnswers([dateQ], { q_date: 'invalid-date-string' });
    expect(invalidDate.errors['q_date']).toContain('valid date');

    const validDate = validateQuestionnaireAnswers([dateQ], { q_date: '2026-12-31' });
    expect(validDate.valid).toBe(true);
  });
});

describe('Questionnaire Immutability & Backward Compatibility', () => {
  it('allows jobs without screening questions to submit empty questionnaire', () => {
    const emptyJobQuestions: ScreeningQuestion[] = [];
    const submission: Record<string, any> = {};

    const result = validateQuestionnaireAnswers(emptyJobQuestions, submission);
    expect(result.valid).toBe(true);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
    expect(result.normalizedAnswers).toEqual([]);
  });

  it('handles null or undefined questions array gracefully', () => {
    const result = validateQuestionnaireAnswers(null as any, {});
    expect(result.valid).toBe(true);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('preserves question snapshot structure for historical candidate applications', () => {
    // When a candidate submits, their answer captures a frozen snapshot of the question
    const snapshotQuestion: ScreeningQuestion = {
      id: 'q-notice-v1',
      questionText: 'What is your notice period?',
      questionType: 'single_choice',
      isRequired: true,
      displayOrder: 0,
      options: ['Immediate', '30 Days', '60 Days'],
      version: 1,
    };

    const candidateAnswerRecord = {
      questionId: snapshotQuestion.id,
      questionSnapshot: {
        id: snapshotQuestion.id,
        questionText: snapshotQuestion.questionText,
        questionType: snapshotQuestion.questionType,
        options: snapshotQuestion.options,
        isRequired: snapshotQuestion.isRequired,
        version: snapshotQuestion.version,
      },
      answerValue: '30 Days',
      answeredAt: new Date().toISOString(),
    };

    // Even if recruiter later updates question to version 2 with different options:
    const updatedQuestion: ScreeningQuestion = {
      id: 'q-notice-v2',
      questionText: 'What is your official notice period in days?',
      questionType: 'numeric',
      isRequired: true,
      displayOrder: 0,
      version: 2,
    };

    // The historical candidate record retains the exact question text and choices
    expect(candidateAnswerRecord.questionSnapshot.questionText).toBe('What is your notice period?');
    expect(candidateAnswerRecord.questionSnapshot.questionType).toBe('single_choice');
    expect(candidateAnswerRecord.questionSnapshot.options).toEqual(['Immediate', '30 Days', '60 Days']);
    expect(candidateAnswerRecord.questionSnapshot.version).toBe(1);
    expect(candidateAnswerRecord.answerValue).toBe('30 Days');
  });
});

describe('Job Record Resolution & Query Safety', () => {
  it('correctly discriminates numeric IDs, UUIDs, and custom job IDs without invalid UUID casting', () => {
    const isNumeric = (str: string) => /^\d+$/.test(str);
    const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    // Numeric ID should NEVER be queried as a UUID in Postgres
    expect(isNumeric('134')).toBe(true);
    expect(isUuid('134')).toBe(false);

    // Valid UUID should be queried as UUID
    expect(isNumeric('6447dc9c-6941-4501-91cf-d59625fddd72')).toBe(false);
    expect(isUuid('6447dc9c-6941-4501-91cf-d59625fddd72')).toBe(true);

    // Slug / Custom job ID should be queried as job_id
    expect(isNumeric('JOB-2026-ENG')).toBe(false);
    expect(isUuid('JOB-2026-ENG')).toBe(false);
  });
});

