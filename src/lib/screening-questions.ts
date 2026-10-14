/**
 * JobsDart — Recruiter Screening Questions & Application Questionnaire System
 * Shared Types, Schemas, Templates & Server/Client Validation Helpers
 */

export type ScreeningQuestionType =
  | 'short_text'
  | 'long_text'
  | 'single_choice'
  | 'multiple_choice'
  | 'yes_no'
  | 'numeric'
  | 'date'
  | 'dropdown'
  | 'url';

export interface QuestionValidationRules {
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  maxSelections?: number;
}

export interface ScreeningQuestion {
  id: string | number;
  jobPk?: number;
  jobId?: string;
  questionText: string;
  description?: string;
  questionType: ScreeningQuestionType;
  isRequired: boolean;
  displayOrder: number;
  options?: string[];
  validationRules?: QuestionValidationRules;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
  archivedAt?: string | null;
}

export interface ScreeningQuestionTypeRecord {
  code: ScreeningQuestionType;
  label: string;
  acceptsOptions: boolean;
  answerJsonType: 'string' | 'number' | 'boolean' | 'array';
  isActive: boolean;
}

export interface QuestionSnapshot {
  id: string | number;
  questionText: string;
  description?: string;
  questionType: ScreeningQuestionType;
  isRequired: boolean;
  options?: string[];
  validationRules?: QuestionValidationRules;
  version?: number;
}

export interface ApplicationAnswer {
  id?: string | number;
  applicationId: string | number;
  questionId: string | number;
  questionSnapshot: QuestionSnapshot;
  answerValue: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuestionTemplate {
  id: string;
  label: string;
  category: string;
  question: Omit<ScreeningQuestion, 'id' | 'displayOrder' | 'version'>;
}

/** Predefined templates inspired by top recruiting platforms (Naukri, LinkedIn) */
export const SCREENING_QUESTION_TEMPLATES: QuestionTemplate[] = [
  {
    id: 'exp_years',
    label: 'Years of Experience',
    category: 'Experience',
    question: {
      questionText: 'How many years of relevant experience do you have in this field?',
      description: 'Please specify your total relevant professional experience in years.',
      questionType: 'numeric',
      isRequired: true,
      options: [],
      validationRules: {
        minValue: 0,
        maxValue: 50,
      },
    },
  },
  {
    id: 'notice_period',
    label: 'Notice Period',
    category: 'Availability',
    question: {
      questionText: 'What is your current notice period?',
      description: 'Select the timeframe required by your current employer before joining.',
      questionType: 'dropdown',
      isRequired: true,
      options: [
        'Immediate / Serving Notice',
        '15 Days or less',
        '30 Days',
        '45 Days',
        '60 Days',
        '90 Days',
      ],
      validationRules: {},
    },
  },
  {
    id: 'earliest_joining',
    label: 'Earliest Joining Date',
    category: 'Availability',
    question: {
      questionText: 'What is your earliest available joining date?',
      description: 'The earliest date you would be ready to start work if an offer is extended.',
      questionType: 'date',
      isRequired: false,
      options: [],
      validationRules: {},
    },
  },
  {
    id: 'work_authorization',
    label: 'Work Authorization',
    category: 'Eligibility',
    question: {
      questionText: 'Are you legally authorized to work in the specified job location?',
      description: 'Confirmation of legal right to work without immediate sponsorship.',
      questionType: 'yes_no',
      isRequired: true,
      options: ['Yes', 'No'],
      validationRules: {},
    },
  },
  {
    id: 'relocation',
    label: 'Willingness to Relocate',
    category: 'Location',
    question: {
      questionText: 'Are you willing to relocate to the job location if required?',
      description: 'Indicate whether you are open to physical relocation for this position.',
      questionType: 'yes_no',
      isRequired: true,
      options: ['Yes', 'No'],
      validationRules: {},
    },
  },
  {
    id: 'expected_salary',
    label: 'Expected Compensation',
    category: 'Compensation',
    question: {
      questionText: 'What is your expected annual compensation?',
      description: 'Please specify your expected salary (including currency, e.g. USD / INR).',
      questionType: 'short_text',
      isRequired: false,
      options: [],
      validationRules: {
        minLength: 2,
        maxLength: 80,
      },
    },
  },
  {
    id: 'tech_experience',
    label: 'Key Technologies Expertise',
    category: 'Skills',
    question: {
      questionText: 'Describe your hands-on experience with the primary technologies listed in the job description.',
      description: 'Mention specific projects, libraries, and frameworks you have built production software with.',
      questionType: 'long_text',
      isRequired: false,
      options: [],
      validationRules: {
        minLength: 10,
        maxLength: 1500,
      },
    },
  },
  {
    id: 'portfolio_url',
    label: 'Portfolio or GitHub Profile',
    category: 'Profile',
    question: {
      questionText: 'Share a link to your portfolio, GitHub profile, or personal website.',
      description: 'Must be a valid URL starting with https://',
      questionType: 'url',
      isRequired: false,
      options: [],
      validationRules: {
        maxLength: 300,
      },
    },
  },
];

export const STANDARD_SCREENING_TEMPLATES = SCREENING_QUESTION_TEMPLATES;

export function createQuestionFromTemplate(
  template: QuestionTemplate,
  override: Partial<ScreeningQuestion> = {}
): ScreeningQuestion {
  return {
    id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    questionText: template.question.questionText,
    description: template.question.description,
    questionType: template.question.questionType,
    isRequired: template.question.isRequired,
    displayOrder: 0,
    options: template.question.options ? [...template.question.options] : [],
    validationRules: template.question.validationRules ? { ...template.question.validationRules } : {},
    version: 1,
    ...override,
  };
}

/** Sensible limits to protect database and UI integrity */
export const QUESTIONNAIRE_LIMITS = {
  MAX_QUESTIONS_PER_JOB: 25,
  MAX_QUESTION_TEXT_LENGTH: 500,
  MAX_DESCRIPTION_LENGTH: 600,
  MAX_OPTIONS_COUNT: 20,
  MAX_OPTION_TEXT_LENGTH: 150,
  MAX_SHORT_TEXT_LENGTH: 300,
  MAX_LONG_TEXT_LENGTH: 3000,
  MAX_URL_LENGTH: 500,
  MAX_NUMERIC_VALUE: 1000000000,
  MIN_NUMERIC_VALUE: -1000000,
};

/**
 * Validates a single question definition when recruiter is editing or creating questions.
 */
export function validateQuestionDefinition(q: Partial<ScreeningQuestion>): string | null {
  if (!q.questionText || typeof q.questionText !== 'string' || !q.questionText.trim()) {
    return 'Question text is required.';
  }
  if (q.questionText.trim().length > QUESTIONNAIRE_LIMITS.MAX_QUESTION_TEXT_LENGTH) {
    return `Question text cannot exceed ${QUESTIONNAIRE_LIMITS.MAX_QUESTION_TEXT_LENGTH} characters.`;
  }
  if (q.description && q.description.length > QUESTIONNAIRE_LIMITS.MAX_DESCRIPTION_LENGTH) {
    return `Question instructions cannot exceed ${QUESTIONNAIRE_LIMITS.MAX_DESCRIPTION_LENGTH} characters.`;
  }

  const validTypes: ScreeningQuestionType[] = [
    'short_text',
    'long_text',
    'single_choice',
    'multiple_choice',
    'yes_no',
    'numeric',
    'date',
    'dropdown',
    'url',
  ];
  if (!q.questionType || !validTypes.includes(q.questionType)) {
    return `Invalid question type: "${q.questionType}".`;
  }

  // Choice validations
  if (['single_choice', 'multiple_choice', 'dropdown'].includes(q.questionType)) {
    const opts = q.options || [];
    if (!Array.isArray(opts) || opts.length < 2) {
      return `Choice questions must have at least 2 options.`;
    }
    if (opts.length > QUESTIONNAIRE_LIMITS.MAX_OPTIONS_COUNT) {
      return `Maximum ${QUESTIONNAIRE_LIMITS.MAX_OPTIONS_COUNT} options allowed.`;
    }
    const cleanOpts = opts.map((o) => (typeof o === 'string' ? o.trim() : ''));
    if (cleanOpts.some((o) => !o)) {
      return 'All option labels must be non-empty.';
    }
    const unique = new Set(cleanOpts.map((o) => o.toLowerCase()));
    if (unique.size !== cleanOpts.length) {
      return 'Duplicate options are not allowed. Options must be unique.';
    }
  }

  // Multiple choice selection limits
  if (q.questionType === 'multiple_choice' && q.validationRules) {
    const { maxSelections } = q.validationRules;
    const opts = q.options || [];
    if (maxSelections !== undefined && maxSelections > opts.length) {
      return `Maximum selections cannot exceed the total number of options (${opts.length}).`;
    }
  }

  // Numeric range validations
  if (q.questionType === 'numeric' && q.validationRules) {
    const { minValue, maxValue } = q.validationRules;
    if (minValue !== undefined && maxValue !== undefined && minValue > maxValue) {
      return 'Minimum value cannot be greater than maximum value.';
    }
  }

  // Text range validations
  if (['short_text', 'long_text'].includes(q.questionType) && q.validationRules) {
    const { minLength, maxLength } = q.validationRules;
    if (minLength !== undefined && maxLength !== undefined && minLength > maxLength) {
      return 'Minimum length cannot be greater than maximum length.';
    }
  }

  return null;
}

/**
 * Validates submitted answers against the question definitions.
 */
export function validateQuestionnaireAnswers(
  questions: ScreeningQuestion[],
  answers: Record<string, any> | Array<{ questionId: string | number; answer?: any; answerValue?: any }>
): {
  valid: boolean;
  isValid: boolean;
  errors: Record<string, string>;
  normalizedAnswers: Array<{
    questionId: string | number;
    questionSnapshot: QuestionSnapshot;
    answerValue: any;
  }>;
} {
  const errors: Record<string, string> = {};
  const normalizedAnswers: Array<{
    questionId: string | number;
    questionSnapshot: QuestionSnapshot;
    answerValue: any;
  }> = [];

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return {
      valid: true,
      isValid: true,
      errors: {},
      normalizedAnswers: [],
    };
  }

  const answerMap: Record<string, any> = {};
  if (Array.isArray(answers)) {
    for (const item of answers) {
      if (item && item.questionId !== undefined) {
        answerMap[String(item.questionId)] = item.answer !== undefined ? item.answer : item.answerValue;
      }
    }
  } else if (answers && typeof answers === 'object') {
    Object.assign(answerMap, answers);
  }

  for (const q of questions) {
    const key = String(q.id);
    const rawVal = answerMap[key] ?? answerMap[q.questionText];
    const snapshot: QuestionSnapshot = {
      id: q.id,
      questionText: q.questionText,
      description: q.description,
      questionType: q.questionType,
      isRequired: q.isRequired,
      options: q.options || [],
      validationRules: q.validationRules || {},
      version: q.version || 1,
    };

    const isProvided =
      rawVal !== undefined &&
      rawVal !== null &&
      (typeof rawVal === 'string' ? rawVal.trim().length > 0 : true) &&
      (Array.isArray(rawVal) ? rawVal.length > 0 : true);

    if (q.isRequired && !isProvided) {
      errors[key] = 'This question is required.';
      continue;
    }

    if (!isProvided) {
      // Optional skipped question
      normalizedAnswers.push({
        questionId: q.id,
        questionSnapshot: snapshot,
        answerValue: null,
      });
      continue;
    }

    // Type-specific validations
    switch (q.questionType) {
      case 'short_text': {
        const val = String(rawVal).trim();
        const min = q.validationRules?.minLength;
        const max = q.validationRules?.maxLength || QUESTIONNAIRE_LIMITS.MAX_SHORT_TEXT_LENGTH;
        if (min !== undefined && val.length < min) {
          errors[key] = `Answer must be at least ${min} characters.`;
        } else if (val.length > max) {
          errors[key] = `Answer cannot exceed ${max} characters.`;
        } else {
          normalizedAnswers.push({ questionId: q.id, questionSnapshot: snapshot, answerValue: val });
        }
        break;
      }

      case 'long_text': {
        const val = String(rawVal).trim();
        const min = q.validationRules?.minLength;
        const max = q.validationRules?.maxLength || QUESTIONNAIRE_LIMITS.MAX_LONG_TEXT_LENGTH;
        if (min !== undefined && val.length < min) {
          errors[key] = `Answer must be at least ${min} characters.`;
        } else if (val.length > max) {
          errors[key] = `Answer cannot exceed ${max} characters.`;
        } else {
          normalizedAnswers.push({ questionId: q.id, questionSnapshot: snapshot, answerValue: val });
        }
        break;
      }

      case 'numeric': {
        const num = typeof rawVal === 'number' ? rawVal : Number(rawVal);
        if (isNaN(num)) {
          errors[key] = 'Please enter a valid number.';
        } else {
          const min = q.validationRules?.minValue;
          const max = q.validationRules?.maxValue;
          if (min !== undefined && num < min) {
            errors[key] = `Value cannot be less than ${min}.`;
          } else if (max !== undefined && num > max) {
            errors[key] = `Value cannot be greater than ${max}.`;
          } else {
            normalizedAnswers.push({ questionId: q.id, questionSnapshot: snapshot, answerValue: num });
          }
        }
        break;
      }

      case 'yes_no': {
        let boolVal: boolean | null = null;
        if (typeof rawVal === 'boolean') {
          boolVal = rawVal;
        } else if (typeof rawVal === 'string') {
          const l = rawVal.trim().toLowerCase();
          if (l === 'yes' || l === 'true') boolVal = true;
          else if (l === 'no' || l === 'false') boolVal = false;
        }
        if (boolVal === null) {
          errors[key] = 'Please select Yes or No.';
        } else {
          normalizedAnswers.push({
            questionId: q.id,
            questionSnapshot: snapshot,
            answerValue: boolVal ? 'Yes' : 'No',
          });
        }
        break;
      }

      case 'single_choice':
      case 'dropdown': {
        const val = String(rawVal).trim();
        const options = (q.options || []).map((o) => (typeof o === 'string' ? o.trim() : ''));
        if (!options.includes(val)) {
          errors[key] = 'Selected option does not belong to the question choices.';
        } else {
          normalizedAnswers.push({ questionId: q.id, questionSnapshot: snapshot, answerValue: val });
        }
        break;
      }

      case 'multiple_choice': {
        const arr = Array.isArray(rawVal) ? rawVal.map((v) => String(v).trim()) : [String(rawVal).trim()];
        const options = (q.options || []).map((o) => (typeof o === 'string' ? o.trim() : ''));
        const invalidSelections = arr.filter((v) => !options.includes(v));
        if (invalidSelections.length > 0) {
          errors[key] = 'One or more selected options are invalid.';
        } else if (q.validationRules?.maxSelections && arr.length > q.validationRules.maxSelections) {
          errors[key] = `You can select at most ${q.validationRules.maxSelections} option(s).`;
        } else {
          normalizedAnswers.push({ questionId: q.id, questionSnapshot: snapshot, answerValue: arr });
        }
        break;
      }

      case 'date': {
        const str = String(rawVal).trim();
        const parsed = Date.parse(str);
        if (isNaN(parsed)) {
          errors[key] = 'Please enter a valid date format.';
        } else {
          normalizedAnswers.push({ questionId: q.id, questionSnapshot: snapshot, answerValue: str });
        }
        break;
      }

      case 'url': {
        const str = String(rawVal).trim();
        const isUrl = /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(str);
        if (!isUrl) {
          errors[key] = 'Please provide a valid web URL starting with http:// or https://.';
        } else if (str.length > QUESTIONNAIRE_LIMITS.MAX_URL_LENGTH) {
          errors[key] = `URL cannot exceed ${QUESTIONNAIRE_LIMITS.MAX_URL_LENGTH} characters.`;
        } else {
          normalizedAnswers.push({ questionId: q.id, questionSnapshot: snapshot, answerValue: str });
        }
        break;
      }

      default:
        normalizedAnswers.push({ questionId: q.id, questionSnapshot: snapshot, answerValue: rawVal });
        break;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    isValid: Object.keys(errors).length === 0,
    errors,
    normalizedAnswers,
  };
}
