"use client";

import React, { useState } from 'react';
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
import { ScreeningQuestion } from '@/lib/screening-questions';
import {
  Eye,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Check,
  RotateCcw,
  LayoutList,
  Sparkles,
} from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: ScreeningQuestion[];
  jobTitle?: string;
  companyName?: string;
}

export function ScreeningQuestionsPreviewModal({
  isOpen,
  onClose,
  questions = [],
  jobTitle = 'Senior Software Engineer',
  companyName = 'Acme Corp',
}: PreviewModalProps) {
  const [viewMode, setViewMode] = useState<'step_by_step' | 'all'>('step_by_step');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testAnswers, setTestAnswers] = useState<Record<string, any>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);

  const totalQuestions = questions.length;
  const currentQ = questions[currentIndex];
  const progressPercent = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  const handleTextChange = (qId: string | number, value: any) => {
    setTestAnswers((prev) => ({ ...prev, [String(qId)]: value }));
    setErrorMsg(null);
  };

  const handleCheckboxToggle = (qId: string | number, option: string) => {
    const key = String(qId);
    const curr = Array.isArray(testAnswers[key]) ? testAnswers[key] : [];
    if (curr.includes(option)) {
      setTestAnswers((prev) => ({
        ...prev,
        [key]: curr.filter((item: string) => item !== option),
      }));
    } else {
      setTestAnswers((prev) => ({
        ...prev,
        [key]: [...curr, option],
      }));
    }
    setErrorMsg(null);
  };

  const validateStep = (q: ScreeningQuestion): string | null => {
    if (!q) return null;
    const qId = String(q.id);
    const val = testAnswers[qId];
    const isProvided =
      val !== undefined &&
      val !== null &&
      (typeof val === 'string' ? val.trim().length > 0 : true) &&
      (Array.isArray(val) ? val.length > 0 : true);

    if (q.isRequired && !isProvided) {
      return 'This question is required for candidates to continue.';
    }
    return null;
  };

  const handleNextStep = () => {
    if (!currentQ) return;
    const err = validateStep(currentQ);
    if (err) {
      setErrorMsg(err);
      return;
    }
    setErrorMsg(null);

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsReviewMode(true);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    if (isReviewMode) {
      setIsReviewMode(false);
      setCurrentIndex(totalQuestions - 1);
    } else if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleResetPreview = () => {
    setTestAnswers({});
    setCurrentIndex(0);
    setIsReviewMode(false);
    setErrorMsg(null);
    setSubmitted(false);
  };

  const renderQuestionInput = (q: ScreeningQuestion) => {
    const qId = String(q.id);
    const answer = testAnswers[qId];

    return (
      <div className="space-y-4">
        {q.questionType === 'short_text' && (
          <Input
            placeholder="Candidate will enter a short response here..."
            value={answer || ''}
            onChange={(e) => handleTextChange(qId, e.target.value)}
            className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 h-11"
            maxLength={q.validationRules?.maxLength}
          />
        )}

        {q.questionType === 'long_text' && (
          <Textarea
            placeholder="Candidate will enter their detailed response here..."
            value={answer || ''}
            onChange={(e) => handleTextChange(qId, e.target.value)}
            className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 min-h-[110px]"
            maxLength={q.validationRules?.maxLength}
          />
        )}

        {q.questionType === 'numeric' && (
          <Input
            type="number"
            placeholder={
              q.validationRules?.minValue !== undefined && q.validationRules?.maxValue !== undefined
                ? `Between ${q.validationRules.minValue} and ${q.validationRules.maxValue}`
                : 'Enter a number...'
            }
            value={answer !== undefined ? answer : ''}
            onChange={(e) => handleTextChange(qId, e.target.value)}
            min={q.validationRules?.minValue}
            max={q.validationRules?.maxValue}
            className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 h-11 max-w-xs"
          />
        )}

        {q.questionType === 'yes_no' && (
          <RadioGroup
            value={answer || ''}
            onValueChange={(val) => handleTextChange(qId, val)}
            className="grid grid-cols-2 gap-3 max-w-sm"
          >
            {['Yes', 'No'].map((opt) => {
              const isSelected = answer === opt;
              return (
                <label
                  key={opt}
                  className={`flex items-center space-x-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#2e5bff] bg-blue-50/70 dark:bg-blue-950/40 text-[#2e5bff] font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <RadioGroupItem value={opt} id={`prev-${opt}-${qId}`} />
                  <span className="text-sm">{opt}</span>
                </label>
              );
            })}
          </RadioGroup>
        )}

        {q.questionType === 'single_choice' && (
          <RadioGroup
            value={answer || ''}
            onValueChange={(val) => handleTextChange(qId, val)}
            className="space-y-2.5"
          >
            {(q.options || []).map((opt, oIdx) => {
              const isSelected = answer === opt;
              return (
                <label
                  key={oIdx}
                  className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#2e5bff] bg-blue-50/70 dark:bg-blue-950/40 text-[#2e5bff] font-medium'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <RadioGroupItem value={opt} id={`prev-opt-${qId}-${oIdx}`} />
                  <span className="text-sm">{opt}</span>
                </label>
              );
            })}
          </RadioGroup>
        )}

        {q.questionType === 'dropdown' && (
          <Select value={answer || ''} onValueChange={(val) => handleTextChange(qId, val)}>
            <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 h-11 max-w-md">
              <SelectValue placeholder="Choose an option..." />
            </SelectTrigger>
            <SelectContent>
              {(q.options || []).map((opt, oIdx) => (
                <SelectItem key={oIdx} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {q.questionType === 'multiple_choice' && (
          <div className="space-y-2.5">
            {(q.options || []).map((opt, oIdx) => {
              const isChecked = Array.isArray(answer) && answer.includes(opt);
              return (
                <label
                  key={oIdx}
                  className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    isChecked
                      ? 'border-[#2e5bff] bg-blue-50/70 dark:bg-blue-950/40 text-[#2e5bff] font-medium'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <Checkbox
                    id={`prev-multi-${qId}-${oIdx}`}
                    checked={isChecked}
                    onCheckedChange={() => handleCheckboxToggle(qId, opt)}
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              );
            })}
            {q.validationRules?.maxSelections && (
              <p className="text-xs text-slate-400">
                Max selections allowed: {q.validationRules.maxSelections}
              </p>
            )}
          </div>
        )}

        {q.questionType === 'date' && (
          <Input
            type="date"
            value={answer || ''}
            onChange={(e) => handleTextChange(qId, e.target.value)}
            className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 h-11 max-w-xs"
          />
        )}

        {q.questionType === 'url' && (
          <Input
            type="url"
            placeholder="https://github.com/candidate or portfolio link..."
            value={answer || ''}
            onChange={(e) => handleTextChange(qId, e.target.value)}
            className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 h-11"
          />
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800">
        <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#2e5bff] font-semibold text-xs tracking-wider uppercase">
              <Eye className="w-4 h-4" />
              Recruiter Live Candidate Preview
            </div>
            {totalQuestions > 0 && (
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('step_by_step')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    viewMode === 'step_by_step'
                      ? 'bg-white dark:bg-slate-700 text-[#2e5bff] shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  One-by-One Flow
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('all')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                    viewMode === 'all'
                      ? 'bg-white dark:bg-slate-700 text-[#2e5bff] shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  All Questions
                </button>
              </div>
            )}
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Application Questionnaire Preview
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
            Applying to <span className="font-semibold text-slate-700 dark:text-slate-200">{jobTitle}</span> at{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{companyName}</span>
          </DialogDescription>
        </DialogHeader>

        {totalQuestions === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-40 text-amber-500" />
            <p className="font-medium text-slate-600 dark:text-slate-300">No screening questions configured yet.</p>
            <p className="text-xs text-slate-400 mt-1">Add questions or select from templates to see them previewed here.</p>
          </div>
        ) : viewMode === 'step_by_step' ? (
          /* ── Step-by-Step Candidate Experience ─────────────────────────── */
          <div className="py-4 space-y-6">
            {/* Progress Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                <span>
                  {isReviewMode ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Final Application Review
                    </span>
                  ) : (
                    <>Question <strong className="text-slate-800 dark:text-slate-100">{currentIndex + 1}</strong> of {totalQuestions}</>
                  )}
                </span>
                <span>{isReviewMode ? '100%' : `${progressPercent}%`} complete</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#2e5bff] to-blue-400 transition-all duration-300 ease-out"
                  style={{ width: `${isReviewMode ? 100 : progressPercent}%` }}
                />
              </div>

              {/* Numbered quick jump pills */}
              <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1">
                {questions.map((q, idx) => {
                  const qId = String(q.id);
                  const isAnswered =
                    testAnswers[qId] !== undefined &&
                    testAnswers[qId] !== '' &&
                    (!Array.isArray(testAnswers[qId]) || testAnswers[qId].length > 0);
                  const isCurrent = !isReviewMode && idx === currentIndex;

                  return (
                    <button
                      key={qId}
                      type="button"
                      onClick={() => {
                        setIsReviewMode(false);
                        setCurrentIndex(idx);
                        setErrorMsg(null);
                      }}
                      className={`h-7 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center shrink-0 ${
                        isCurrent
                          ? 'bg-[#2e5bff] text-white shadow-sm ring-2 ring-[#2e5bff]/30'
                          : isAnswered
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                      title={q.questionText}
                    >
                      {isAnswered && !isCurrent ? (
                        <span className="flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Q{idx + 1}
                        </span>
                      ) : (
                        <span>Q{idx + 1}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-red-700 dark:text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Review Mode View */}
            {isReviewMode ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-200 text-sm">
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Preview: Candidate Review Summary
                  </div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Candidates see all their completed answers before final submission, with options to edit any question.
                  </p>
                </div>

                <div className="space-y-3">
                  {questions.map((q, idx) => {
                    const ans = testAnswers[String(q.id)];
                    const displayAns = Array.isArray(ans)
                      ? ans.join(', ')
                      : ans !== undefined && ans !== ''
                      ? String(ans)
                      : '(No answer provided)';

                    return (
                      <div
                        key={String(q.id)}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-slate-400">Q{idx + 1}</span>
                            <span className="font-medium text-slate-800 dark:text-slate-100">{q.questionText}</span>
                            {q.isRequired && <span className="text-red-500 text-xs font-bold">*</span>}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 pl-6 italic">
                            {displayAns}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsReviewMode(false);
                            setCurrentIndex(idx);
                          }}
                          className="text-xs text-[#2e5bff] hover:bg-blue-50 dark:hover:bg-blue-950/50 shrink-0 h-8"
                        >
                          Edit
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Single Question Card */
              currentQ && (
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <Label className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-baseline gap-2">
                        <span>{currentQ.questionText}</span>
                        {currentQ.isRequired ? (
                          <span className="text-red-500 text-xs font-bold">* Required</span>
                        ) : (
                          <span className="text-slate-400 text-xs font-normal">(Optional)</span>
                        )}
                      </Label>
                      {currentQ.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
                          <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {currentQ.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider shrink-0">
                      {currentQ.questionType.replace('_', ' ')}
                    </Badge>
                  </div>

                  {renderQuestionInput(currentQ)}
                </div>
              )
            )}
          </div>
        ) : (
          /* ── All Questions Overview Mode ───────────────────────────────── */
          <div className="space-y-5 py-4">
            {submitted && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-emerald-800 dark:text-emerald-200 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Preview validation passed! Answers entered test successfully.</span>
              </div>
            )}

            {questions.map((q, idx) => {
              const qId = String(q.id);

              return (
                <div
                  key={qId}
                  className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Label className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-baseline gap-2">
                      <span className="text-slate-400 font-mono text-xs">Q{idx + 1}.</span>
                      <span>{q.questionText}</span>
                      {q.isRequired ? (
                        <span className="text-red-500 text-xs font-bold">* Required</span>
                      ) : (
                        <span className="text-slate-400 text-xs font-normal">(Optional)</span>
                      )}
                    </Label>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider shrink-0">
                      {q.questionType.replace('_', ' ')}
                    </Badge>
                  </div>

                  {q.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 leading-relaxed">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {q.description}
                    </p>
                  )}

                  <div className="pt-1">{renderQuestionInput(q)}</div>
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close Preview
            </Button>
            {totalQuestions > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetPreview}
                className="text-xs flex items-center gap-1 text-slate-600 hover:text-slate-900"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </Button>
            )}
          </div>

          {viewMode === 'step_by_step' && totalQuestions > 0 ? (
            <div className="flex items-center gap-2">
              {(currentIndex > 0 || isReviewMode) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrevStep}
                  className="flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </Button>
              )}

              {!isReviewMode && currentQ && !currentQ.isRequired && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setErrorMsg(null);
                    if (currentIndex < totalQuestions - 1) {
                      setCurrentIndex((prev) => prev + 1);
                    } else {
                      setIsReviewMode(true);
                    }
                  }}
                  className="text-xs text-slate-500"
                >
                  Skip
                </Button>
              )}

              {isReviewMode ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setSubmitted(true);
                    setTimeout(() => setSubmitted(false), 3000);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Test Submit Complete
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleNextStep}
                  className="bg-[#2e5bff] hover:bg-blue-600 text-white font-semibold flex items-center gap-1"
                >
                  {currentIndex === totalQuestions - 1 ? 'Review Answers' : 'Next Question'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          ) : (
            totalQuestions > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSubmitted(true);
                  setTimeout(() => setSubmitted(false), 3000);
                }}
                className="bg-[#2e5bff]/10 text-[#2e5bff] border-[#2e5bff]/20 hover:bg-[#2e5bff]/20"
              >
                Test Submit Answers
              </Button>
            )
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
