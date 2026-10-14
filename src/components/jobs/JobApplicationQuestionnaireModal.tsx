"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  ScreeningQuestion,
  validateQuestionnaireAnswers,
} from '@/lib/screening-questions';
import {
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  ArrowRight,
  ArrowLeft,
  FileText,
  Building2,
  Send,
  Edit2,
  Check,
  CornerDownLeft,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: ScreeningQuestion[];
  jobTitle: string;
  companyName: string;
  jobId: string | number;
  userId?: string;
  onSubmit: (answers: Record<string, any>) => Promise<void>;
  isSubmitting: boolean;
}

export function JobApplicationQuestionnaireModal({
  isOpen,
  onClose,
  questions = [],
  jobTitle,
  companyName,
  jobId,
  userId,
  onSubmit,
  isSubmitting,
}: QuestionnaireModalProps) {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const draftKey = `jobsdart_draft_screening_${jobId}_${userId || 'guest'}`;

  // Restore draft answers from localStorage on mount/open
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(draftKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            setAnswers(parsed);
            setHasRestoredDraft(true);
            setTimeout(() => setHasRestoredDraft(false), 4000);
          }
        }
      } catch (e) {}
    }
    if (isOpen) {
      setCurrentIndex(0);
      setIsReviewMode(false);
      setFieldErrors({});
    }
  }, [isOpen, draftKey]);

  // Auto-focus the input when question index changes
  useEffect(() => {
    if (!isReviewMode && isOpen) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, isReviewMode, isOpen]);

  const saveDraftToStorage = (updatedAnswers: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(draftKey, JSON.stringify(updatedAnswers));
      } catch (e) {}
    }
  };

  const handleSaveDraft = () => {
    saveDraftToStorage(answers);
    toast({
      title: 'Draft Saved',
      description: 'Your questionnaire progress has been saved locally.',
    });
  };

  const clearDraft = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(draftKey);
      } catch (e) {}
    }
  };

  const handleAnswerChange = (qId: string | number, value: any) => {
    const key = String(qId);
    setAnswers((prev) => {
      const next = { ...prev, [key]: value };
      saveDraftToStorage(next);
      return next;
    });

    // Clear error for field if user modifies it
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleMultipleChoiceToggle = (qId: string | number, option: string) => {
    const key = String(qId);
    const curr = Array.isArray(answers[key]) ? answers[key] : [];
    let updated: string[];
    if (curr.includes(option)) {
      updated = curr.filter((item: string) => item !== option);
    } else {
      updated = [...curr, option];
    }
    handleAnswerChange(qId, updated);
  };

  // Validates a single question
  const validateCurrentQuestion = (q: ScreeningQuestion): string | null => {
    if (!q) return null;
    const qId = String(q.id);
    const rawVal = answers[qId];

    const isProvided =
      rawVal !== undefined &&
      rawVal !== null &&
      (typeof rawVal === 'string' ? rawVal.trim().length > 0 : true) &&
      (Array.isArray(rawVal) ? rawVal.length > 0 : true);

    if (q.isRequired && !isProvided) {
      return 'Please answer this question to proceed.';
    }

    if (!isProvided) {
      return null; // Optional question skipped
    }

    switch (q.questionType) {
      case 'short_text': {
        const val = String(rawVal).trim();
        const min = q.validationRules?.minLength;
        const max = q.validationRules?.maxLength || 300;
        if (min !== undefined && val.length < min) {
          return `Answer must be at least ${min} characters.`;
        }
        if (val.length > max) {
          return `Answer cannot exceed ${max} characters.`;
        }
        break;
      }

      case 'long_text': {
        const val = String(rawVal).trim();
        const min = q.validationRules?.minLength;
        const max = q.validationRules?.maxLength || 3000;
        if (min !== undefined && val.length < min) {
          return `Answer must be at least ${min} characters.`;
        }
        if (val.length > max) {
          return `Answer cannot exceed ${max} characters.`;
        }
        break;
      }

      case 'numeric': {
        const num = typeof rawVal === 'number' ? rawVal : Number(rawVal);
        if (isNaN(num)) {
          return 'Please enter a valid numeric value.';
        }
        const min = q.validationRules?.minValue;
        const max = q.validationRules?.maxValue;
        if (min !== undefined && num < min) {
          return `Value cannot be less than ${min}.`;
        }
        if (max !== undefined && num > max) {
          return `Value cannot be greater than ${max}.`;
        }
        break;
      }

      case 'single_choice':
      case 'dropdown': {
        const val = String(rawVal).trim();
        const opts = (q.options || []).map((o) => (typeof o === 'string' ? o.trim() : ''));
        if (!opts.includes(val)) {
          return 'Please select an option from the list.';
        }
        break;
      }

      case 'multiple_choice': {
        const arr = Array.isArray(rawVal) ? rawVal : [rawVal];
        const opts = (q.options || []).map((o) => (typeof o === 'string' ? o.trim() : ''));
        const invalidSelections = arr.filter((v) => !opts.includes(v));
        if (invalidSelections.length > 0) {
          return 'One or more selected choices are invalid.';
        }
        if (q.validationRules?.maxSelections && arr.length > q.validationRules.maxSelections) {
          return `You can select at most ${q.validationRules.maxSelections} option(s).`;
        }
        break;
      }

      case 'yes_no': {
        const l = String(rawVal).trim().toLowerCase();
        if (l !== 'yes' && l !== 'no' && rawVal !== true && rawVal !== false) {
          return 'Please choose Yes or No.';
        }
        break;
      }

      case 'url': {
        const str = String(rawVal).trim();
        const isUrl = /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(str);
        if (!isUrl) {
          return 'Please enter a valid URL starting with http:// or https://';
        }
        if (str.length > 500) {
          return 'URL cannot exceed 500 characters.';
        }
        break;
      }

      case 'date': {
        const str = String(rawVal).trim();
        if (isNaN(Date.parse(str))) {
          return 'Please enter a valid date.';
        }
        break;
      }
    }

    return null;
  };

  const handleNext = () => {
    if (questions.length === 0) return;
    const currentQ = questions[currentIndex];
    const error = validateCurrentQuestion(currentQ);

    if (error) {
      setFieldErrors((prev) => ({ ...prev, [String(currentQ.id)]: error }));
      return;
    }

    // Clear current error
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[String(currentQ.id)];
      return next;
    });

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Reached the end -> switch to review mode
      setIsReviewMode(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSkipOptional = () => {
    const currentQ = questions[currentIndex];
    if (currentQ && !currentQ.isRequired) {
      // Clear answer and move forward
      const qId = String(currentQ.id);
      setAnswers((prev) => {
        const next = { ...prev };
        delete next[qId];
        saveDraftToStorage(next);
        return next;
      });
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[qId];
        return next;
      });

      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsReviewMode(true);
      }
    }
  };

  const handleJumpToQuestion = (idx: number) => {
    // Only allow jumping back, or jumping to questions already answered
    if (idx < currentIndex) {
      setCurrentIndex(idx);
      setIsReviewMode(false);
      return;
    }

    // If jumping forward, validate current question first
    const currentQ = questions[currentIndex];
    const error = validateCurrentQuestion(currentQ);
    if (error) {
      setFieldErrors((prev) => ({ ...prev, [String(currentQ.id)]: error }));
      return;
    }

    setCurrentIndex(idx);
    setIsReviewMode(false);
  };

  const handleFinalSubmit = async () => {
    const validation = validateQuestionnaireAnswers(questions, answers);
    if (!validation.valid) {
      setFieldErrors(validation.errors);
      setIsReviewMode(false);
      // Jump to first errored question
      const firstErrorQIndex = questions.findIndex((q) => validation.errors[String(q.id)]);
      if (firstErrorQIndex !== -1) {
        setCurrentIndex(firstErrorQIndex);
      }
      toast({
        title: 'Validation Incomplete',
        description: 'Please correct the highlighted question before submitting.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await onSubmit(answers);
      clearDraft();
    } catch (err) {
      // Handled by parent caller
    }
  };

  const totalQuestions = questions.length;
  const currentQ = questions[currentIndex];
  const qId = currentQ ? String(currentQ.id) : '';
  const currentAnswer = answers[qId];
  const currentError = fieldErrors[qId];

  const answeredCount = questions.filter((q) => {
    const v = answers[String(q.id)];
    return (
      v !== undefined &&
      v !== null &&
      (typeof v === 'string' ? v.trim() !== '' : true) &&
      (Array.isArray(v) ? v.length > 0 : true)
    );
  }).length;

  const progressPercent = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  if (totalQuestions === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* ── Modal Header with Progress ───────────────────────────────── */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-b from-slate-50/80 to-white dark:from-slate-900/80 dark:to-slate-900">
          <div className="flex items-center justify-between mb-3">
            <span className="text-primary font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-primary" />
              Screening Questionnaire
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-semibold text-xs py-0.5 px-2.5">
                {isReviewMode ? 'Review Mode' : `Question ${currentIndex + 1} of ${totalQuestions}`}
              </Badge>
              <Badge variant="secondary" className="font-mono text-xs">
                {answeredCount}/{totalQuestions} Answered
              </Badge>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {isReviewMode ? 'Review Your Responses' : `Question ${currentIndex + 1}`}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  Applying for <strong className="text-slate-800 dark:text-slate-200">{jobTitle}</strong> at{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{companyName}</strong>
                </span>
              </DialogDescription>
            </div>
          </div>

          {/* Smooth Animated Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300 ease-out rounded-full"
                style={{ width: `${isReviewMode ? 100 : progressPercent}%` }}
              />
            </div>
          </div>

          {/* Quick-Jump Step Dots */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto py-1 no-scrollbar">
            {questions.map((q, idx) => {
              const isAnswered = answers[String(q.id)] !== undefined && answers[String(q.id)] !== '';
              const isCurrent = !isReviewMode && idx === currentIndex;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => handleJumpToQuestion(idx)}
                  className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'bg-primary text-white shadow-sm ring-2 ring-primary/30 scale-105'
                      : isAnswered
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title={`Jump to Question ${idx + 1}`}
                >
                  {isAnswered && !isCurrent ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : idx + 1}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setIsReviewMode(true)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                isReviewMode
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Review
            </button>
          </div>
        </div>

        {hasRestoredDraft && (
          <div className="mx-6 mt-3 p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center gap-2 text-xs text-blue-800 dark:text-blue-200">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Restored your previously entered draft responses.</span>
          </div>
        )}

        <div className="px-6 py-5">
          {/* ── MODE 1: One-By-One Question Card ────────────────────────── */}
          {!isReviewMode ? (
            <div className="space-y-6">
              {/* Question Header Card */}
              <div className="space-y-3 bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-md">
                      Q{currentIndex + 1}
                    </span>
                    {currentQ.isRequired ? (
                      <Badge variant="destructive" className="text-[10px] uppercase font-bold py-0.5">
                        Required
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-slate-500 py-0.5">
                        Optional
                      </Badge>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-[10px] uppercase font-mono tracking-wider">
                    {currentQ.questionType.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="space-y-1.5 pt-1">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {currentQ.questionText}
                  </h3>
                  {currentQ.description && (
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-start gap-1.5 pt-1 leading-relaxed">
                      <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span>{currentQ.description}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Input Area */}
              <div className="space-y-3 pt-1">
                {currentQ.questionType === 'short_text' && (
                  <div className="space-y-1.5">
                    <Input
                      ref={inputRef as any}
                      placeholder="Type your response here..."
                      value={currentAnswer || ''}
                      onChange={(e) => handleAnswerChange(qId, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleNext();
                        }
                      }}
                      maxLength={currentQ.validationRules?.maxLength || 300}
                      className="bg-white dark:bg-slate-900 h-11 text-sm rounded-xl focus-visible:ring-primary shadow-sm"
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        Press <CornerDownLeft className="w-3 h-3" /> Enter to advance
                      </span>
                      <span>
                        {(currentAnswer || '').length} / {currentQ.validationRules?.maxLength || 300}
                      </span>
                    </div>
                  </div>
                )}

                {currentQ.questionType === 'long_text' && (
                  <div className="space-y-1.5">
                    <Textarea
                      ref={inputRef as any}
                      placeholder="Type your detailed response here..."
                      value={currentAnswer || ''}
                      onChange={(e) => handleAnswerChange(qId, e.target.value)}
                      maxLength={currentQ.validationRules?.maxLength || 3000}
                      className="bg-white dark:bg-slate-900 min-h-[140px] text-sm rounded-xl focus-visible:ring-primary shadow-sm leading-relaxed"
                    />
                    <div className="flex items-center justify-end text-[11px] text-slate-400 pt-1">
                      <span>
                        {(currentAnswer || '').length} / {currentQ.validationRules?.maxLength || 3000}
                      </span>
                    </div>
                  </div>
                )}

                {currentQ.questionType === 'numeric' && (
                  <div className="space-y-1.5">
                    <Input
                      ref={inputRef as any}
                      type="number"
                      placeholder={
                        currentQ.validationRules?.minValue !== undefined && currentQ.validationRules?.maxValue !== undefined
                          ? `Value between ${currentQ.validationRules.minValue} and ${currentQ.validationRules.maxValue}`
                          : 'Enter number...'
                      }
                      value={currentAnswer !== undefined ? currentAnswer : ''}
                      onChange={(e) => handleAnswerChange(qId, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleNext();
                        }
                      }}
                      min={currentQ.validationRules?.minValue}
                      max={currentQ.validationRules?.maxValue}
                      className="bg-white dark:bg-slate-900 h-11 text-sm rounded-xl max-w-sm focus-visible:ring-primary shadow-sm"
                    />
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-0.5">
                      Press <CornerDownLeft className="w-3 h-3" /> Enter to advance
                    </div>
                  </div>
                )}

                {currentQ.questionType === 'yes_no' && (
                  <RadioGroup
                    value={
                      currentAnswer === true || String(currentAnswer).toLowerCase() === 'yes'
                        ? 'Yes'
                        : currentAnswer === false || String(currentAnswer).toLowerCase() === 'no'
                        ? 'No'
                        : ''
                    }
                    onValueChange={(val) => {
                      handleAnswerChange(qId, val);
                    }}
                    className="grid grid-cols-2 gap-4 pt-2"
                  >
                    <Label
                      htmlFor={`yes-${qId}`}
                      className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer font-semibold transition-all ${
                        currentAnswer === 'Yes' || currentAnswer === true
                          ? 'border-primary bg-primary/5 text-primary shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <RadioGroupItem value="Yes" id={`yes-${qId}`} className="sr-only" />
                      <span className="text-base">Yes</span>
                    </Label>

                    <Label
                      htmlFor={`no-${qId}`}
                      className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer font-semibold transition-all ${
                        currentAnswer === 'No' || currentAnswer === false
                          ? 'border-primary bg-primary/5 text-primary shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <RadioGroupItem value="No" id={`no-${qId}`} className="sr-only" />
                      <span className="text-base">No</span>
                    </Label>
                  </RadioGroup>
                )}

                {currentQ.questionType === 'single_choice' && (
                  <RadioGroup
                    value={currentAnswer || ''}
                    onValueChange={(val) => handleAnswerChange(qId, val)}
                    className="space-y-2.5 pt-2"
                  >
                    {(currentQ.options || []).map((opt, oIdx) => {
                      const isSelected = currentAnswer === opt;
                      return (
                        <Label
                          key={oIdx}
                          htmlFor={`single-${qId}-${oIdx}`}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer text-sm font-medium transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5 text-primary shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                          }`}
                        >
                          <RadioGroupItem value={opt} id={`single-${qId}-${oIdx}`} />
                          <span className="flex-1">{opt}</span>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                )}

                {currentQ.questionType === 'dropdown' && (
                  <div className="pt-2">
                    <Select
                      value={currentAnswer || ''}
                      onValueChange={(val) => handleAnswerChange(qId, val)}
                    >
                      <SelectTrigger className="bg-white dark:bg-slate-900 h-11 rounded-xl text-sm shadow-sm">
                        <SelectValue placeholder="Choose an option..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(currentQ.options || []).map((opt, oIdx) => (
                          <SelectItem key={oIdx} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {currentQ.questionType === 'multiple_choice' && (
                  <div className="space-y-2.5 pt-2">
                    {(currentQ.options || []).map((opt, oIdx) => {
                      const isChecked = Array.isArray(currentAnswer) && currentAnswer.includes(opt);
                      return (
                        <Label
                          key={oIdx}
                          htmlFor={`multi-${qId}-${oIdx}`}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer text-sm font-medium transition-all ${
                            isChecked
                              ? 'border-primary bg-primary/5 text-primary shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                          }`}
                        >
                          <Checkbox
                            id={`multi-${qId}-${oIdx}`}
                            checked={isChecked}
                            onCheckedChange={() => handleMultipleChoiceToggle(qId, opt)}
                          />
                          <span className="flex-1">{opt}</span>
                        </Label>
                      );
                    })}
                    {currentQ.validationRules?.maxSelections && (
                      <p className="text-xs text-slate-400 pt-1">
                        Select up to {currentQ.validationRules.maxSelections} option(s).
                      </p>
                    )}
                  </div>
                )}

                {currentQ.questionType === 'date' && (
                  <div className="pt-2">
                    <Input
                      ref={inputRef as any}
                      type="date"
                      value={currentAnswer || ''}
                      onChange={(e) => handleAnswerChange(qId, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleNext();
                        }
                      }}
                      className="bg-white dark:bg-slate-900 h-11 text-sm rounded-xl max-w-sm shadow-sm"
                    />
                  </div>
                )}

                {currentQ.questionType === 'url' && (
                  <div className="space-y-1.5 pt-1">
                    <Input
                      ref={inputRef as any}
                      type="url"
                      placeholder="https://github.com/username or portfolio link"
                      value={currentAnswer || ''}
                      onChange={(e) => handleAnswerChange(qId, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleNext();
                        }
                      }}
                      maxLength={500}
                      className="bg-white dark:bg-slate-900 h-11 text-sm rounded-xl shadow-sm"
                    />
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-0.5">
                      Press <CornerDownLeft className="w-3 h-3" /> Enter to advance
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {currentError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2 mt-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span className="font-semibold">{currentError}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ── MODE 2: Comprehensive Review Mode ───────────────────────── */
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>
                  Please double-check your answers before submitting your application to{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{companyName}</strong>.
                </span>
                <Badge variant="outline" className="font-semibold text-xs shrink-0">
                  {answeredCount}/{totalQuestions} Answered
                </Badge>
              </div>

              <div className="space-y-3 max-h-[46vh] overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const key = String(q.id);
                  const val = answers[key];
                  const hasAnswer = val !== undefined && val !== null && val !== '';
                  let displayVal = 'Not answered (Optional)';
                  if (hasAnswer) {
                    if (Array.isArray(val)) {
                      displayVal = val.join(', ');
                    } else if (val === true) {
                      displayVal = 'Yes';
                    } else if (val === false) {
                      displayVal = 'No';
                    } else {
                      displayVal = String(val);
                    }
                  }

                  const hasError = fieldErrors[key];

                  return (
                    <div
                      key={key}
                      className={`p-4 rounded-xl border transition-all ${
                        hasError
                          ? 'border-red-300 bg-red-50/20'
                          : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-400">
                              Q{idx + 1}.
                            </span>
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {q.questionText}
                            </span>
                            {q.isRequired && (
                              <span className="text-red-500 text-xs font-bold shrink-0">*</span>
                            )}
                          </div>

                          <div className="text-sm font-medium text-slate-800 dark:text-slate-200 pl-6 pt-1">
                            {q.questionType === 'url' && hasAnswer ? (
                              <a
                                href={val}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline break-all"
                              >
                                {val}
                              </a>
                            ) : hasAnswer ? (
                              <span>{displayVal}</span>
                            ) : (
                              <span className="text-slate-400 italic text-xs">
                                Skipped by candidate
                              </span>
                            )}
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCurrentIndex(idx);
                            setIsReviewMode(false);
                          }}
                          className="text-xs text-primary hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950 shrink-0 h-8 gap-1 font-semibold"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </Button>
                      </div>

                      {hasError && (
                        <p className="text-xs text-red-600 dark:text-red-400 pl-6 pt-1 font-medium">
                          {hasError}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Modal Footer with Wizard Navigation ──────────────────────── */}
        <DialogFooter className="p-6 pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!isReviewMode ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0 || isSubmitting}
                  className="text-xs gap-1.5 rounded-xl h-10 px-4"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  className="text-xs gap-1.5 rounded-xl h-10 px-3 text-slate-600 dark:text-slate-400"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Draft
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsReviewMode(false)}
                disabled={isSubmitting}
                className="text-xs gap-1.5 rounded-xl h-10 px-4"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Questions
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs rounded-xl h-10 px-4"
            >
              Cancel
            </Button>

            {!isReviewMode ? (
              <>
                {/* Optional Skip button */}
                {!currentQ?.isRequired && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSkipOptional}
                    disabled={isSubmitting}
                    className="text-xs rounded-xl h-10 px-3.5 text-slate-500 hover:text-slate-800"
                  >
                    Skip
                  </Button>
                )}

                <Button
                  type="button"
                  size="sm"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="bg-[#2e5bff] hover:bg-blue-600 text-white font-semibold text-xs gap-1.5 px-6 rounded-xl h-10 shadow-sm"
                >
                  {currentIndex === totalQuestions - 1 ? (
                    <>
                      Review Answers
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      Next Question
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2 px-7 rounded-xl h-10 shadow-md transition-transform active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Submit Application
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
