"use client";

import React, { useState } from 'react';
import {
  ScreeningQuestion,
  ScreeningQuestionType,
  SCREENING_QUESTION_TEMPLATES,
  QUESTIONNAIRE_LIMITS,
  validateQuestionDefinition,
} from '@/lib/screening-questions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Trash2,
  Edit2,
  ChevronUp,
  ChevronDown,
  Eye,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  FileQuestion,
  Check,
  X,
  ListPlus,
  ArrowUpDown,
} from 'lucide-react';
import { ScreeningQuestionsPreviewModal } from './ScreeningQuestionsPreviewModal';

interface ScreeningQuestionsBuilderProps {
  questions: ScreeningQuestion[];
  onChange: (questions: ScreeningQuestion[]) => void;
  hasExistingApplicants?: boolean;
  jobTitle?: string;
  companyName?: string;
}

const QUESTION_TYPE_LABELS: Record<ScreeningQuestionType, { label: string; description: string }> = {
  short_text: { label: 'Short Text', description: 'Single line answer (e.g. reason for applying)' },
  long_text: { label: 'Long Text', description: 'Multi-line detailed answer (e.g. relevant projects)' },
  single_choice: { label: 'Single Choice', description: 'Radio selection (pick exactly 1 option)' },
  multiple_choice: { label: 'Multiple Choice', description: 'Checkbox selection (pick 1 or more options)' },
  yes_no: { label: 'Yes / No', description: 'Quick binary response (e.g. willing to relocate)' },
  numeric: { label: 'Numeric Input', description: 'Numbers only (e.g. years of experience)' },
  date: { label: 'Date Input', description: 'Date selection (e.g. earliest joining date)' },
  dropdown: { label: 'Dropdown List', description: 'Select 1 option from a dropdown menu' },
  url: { label: 'URL / Link', description: 'Website link (e.g. portfolio, GitHub, LinkedIn)' },
};

export function ScreeningQuestionsBuilder({
  questions = [],
  onChange,
  hasExistingApplicants = false,
  jobTitle = 'New Job Opening',
  companyName = 'Company',
}: ScreeningQuestionsBuilderProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ScreeningQuestion | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);

  // Draft state for question editor
  const [draftText, setDraftText] = useState('');
  const [draftDesc, setDraftDesc] = useState('');
  const [draftType, setDraftType] = useState<ScreeningQuestionType>('short_text');
  const [draftRequired, setDraftRequired] = useState(true);
  const [draftOptions, setDraftOptions] = useState<string[]>(['Option 1', 'Option 2']);
  const [newOptionInput, setNewOptionInput] = useState('');
  const [draftMinLength, setDraftMinLength] = useState<number | undefined>(undefined);
  const [draftMaxLength, setDraftMaxLength] = useState<number | undefined>(undefined);
  const [draftMinValue, setDraftMinValue] = useState<number | undefined>(undefined);
  const [draftMaxValue, setDraftMaxValue] = useState<number | undefined>(undefined);
  const [draftMaxSelections, setDraftMaxSelections] = useState<number | undefined>(undefined);

  const openAddQuestion = () => {
    if (questions.length >= QUESTIONNAIRE_LIMITS.MAX_QUESTIONS_PER_JOB) {
      alert(`Maximum ${QUESTIONNAIRE_LIMITS.MAX_QUESTIONS_PER_JOB} questions allowed per job.`);
      return;
    }
    setEditingQuestion(null);
    setDraftText('');
    setDraftDesc('');
    setDraftType('short_text');
    setDraftRequired(true);
    setDraftOptions(['Option 1', 'Option 2']);
    setNewOptionInput('');
    setDraftMinLength(undefined);
    setDraftMaxLength(undefined);
    setDraftMinValue(undefined);
    setDraftMaxValue(undefined);
    setDraftMaxSelections(undefined);
    setEditorError(null);
    setIsEditorOpen(true);
  };

  const openEditQuestion = (q: ScreeningQuestion) => {
    setEditingQuestion(q);
    setDraftText(q.questionText || '');
    setDraftDesc(q.description || '');
    setDraftType(q.questionType);
    setDraftRequired(q.isRequired);
    setDraftOptions(q.options && q.options.length > 0 ? [...q.options] : ['Option 1', 'Option 2']);
    setNewOptionInput('');
    setDraftMinLength(q.validationRules?.minLength);
    setDraftMaxLength(q.validationRules?.maxLength);
    setDraftMinValue(q.validationRules?.minValue);
    setDraftMaxValue(q.validationRules?.maxValue);
    setDraftMaxSelections(q.validationRules?.maxSelections);
    setEditorError(null);
    setIsEditorOpen(true);
  };

  const handleApplyTemplate = (templateId: string) => {
    if (questions.length >= QUESTIONNAIRE_LIMITS.MAX_QUESTIONS_PER_JOB) {
      alert(`Maximum ${QUESTIONNAIRE_LIMITS.MAX_QUESTIONS_PER_JOB} questions allowed per job.`);
      return;
    }
    const tmpl = SCREENING_QUESTION_TEMPLATES.find((t) => t.id === templateId);
    if (!tmpl) return;

    const newQ: ScreeningQuestion = {
      id: `sq_${Date.now()}_${questions.length}`,
      questionText: tmpl.question.questionText,
      description: tmpl.question.description || '',
      questionType: tmpl.question.questionType,
      isRequired: tmpl.question.isRequired,
      displayOrder: questions.length,
      options: tmpl.question.options ? [...tmpl.question.options] : [],
      validationRules: tmpl.question.validationRules ? { ...tmpl.question.validationRules } : {},
      version: 1,
    };

    onChange([...questions, newQ]);
  };

  const handleSaveQuestion = () => {
    const qData: Partial<ScreeningQuestion> = {
      questionText: draftText.trim(),
      description: draftDesc.trim(),
      questionType: draftType,
      isRequired: draftRequired,
      options: ['single_choice', 'multiple_choice', 'dropdown'].includes(draftType)
        ? draftOptions.map((o) => o.trim()).filter(Boolean)
        : [],
      validationRules: {
        ...(draftMinLength !== undefined ? { minLength: Number(draftMinLength) } : {}),
        ...(draftMaxLength !== undefined ? { maxLength: Number(draftMaxLength) } : {}),
        ...(draftMinValue !== undefined ? { minValue: Number(draftMinValue) } : {}),
        ...(draftMaxValue !== undefined ? { maxValue: Number(draftMaxValue) } : {}),
        ...(draftMaxSelections !== undefined ? { maxSelections: Number(draftMaxSelections) } : {}),
      },
    };

    const err = validateQuestionDefinition(qData);
    if (err) {
      setEditorError(err);
      return;
    }

    if (editingQuestion) {
      // Update existing
      const updated = questions.map((item) =>
        item.id === editingQuestion.id
          ? ({
              ...item,
              ...qData,
              options: qData.options,
              validationRules: qData.validationRules,
            } as ScreeningQuestion)
          : item
      );
      onChange(updated);
    } else {
      // Create new
      const created: ScreeningQuestion = {
        id: `sq_${Date.now()}_${questions.length}`,
        questionText: qData.questionText!,
        description: qData.description || '',
        questionType: draftType,
        isRequired: draftRequired,
        displayOrder: questions.length,
        options: qData.options || [],
        validationRules: qData.validationRules || {},
        version: 1,
      };
      onChange([...questions, created]);
    }

    setIsEditorOpen(false);
  };

  const handleDelete = (index: number) => {
    const next = questions.filter((_, i) => i !== index).map((q, i) => ({ ...q, displayOrder: i }));
    onChange(next);
    setDeleteConfirmIndex(null);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === questions.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const next = [...questions];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;

    onChange(next.map((q, i) => ({ ...q, displayOrder: i })));
  };

  const handleAddOption = () => {
    const trimmed = newOptionInput.trim();
    if (!trimmed) return;
    if (draftOptions.includes(trimmed)) {
      setEditorError('This option already exists.');
      return;
    }
    setDraftOptions([...draftOptions, trimmed]);
    setNewOptionInput('');
    setEditorError(null);
  };

  const handleRemoveOption = (optIdx: number) => {
    if (draftOptions.length <= 2) {
      setEditorError('Choice questions must retain at least 2 options.');
      return;
    }
    setDraftOptions(draftOptions.filter((_, i) => i !== optIdx));
  };

  return (
    <div className="space-y-6">
      {/* Existing Applicants Warning Notice */}
      {hasExistingApplicants && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
            <p className="font-semibold text-sm">Notice: Candidates have already applied for this job</p>
            <p>
              Your changes will be saved as a new questionnaire version. All previously submitted candidate
              answers will remain securely preserved with their original question snapshots intact.
            </p>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Application Questions / Candidate Screening
            </h3>
            <Badge variant="secondary" className="font-mono text-xs">
              {questions.length} / {QUESTIONNAIRE_LIMITS.MAX_QUESTIONS_PER_JOB}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Filter and qualify applicants before scheduling interviews with customized screening questions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Templates dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Templates
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 max-h-80 overflow-y-auto">
              <DropdownMenuLabel className="text-xs text-slate-400 uppercase font-mono">
                Standard Screening Templates
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {SCREENING_QUESTION_TEMPLATES.map((tmpl) => (
                <DropdownMenuItem
                  key={tmpl.id}
                  onClick={() => handleApplyTemplate(tmpl.id)}
                  className="cursor-pointer text-xs flex flex-col items-start py-2"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-100">{tmpl.label}</span>
                  <span className="text-[10px] text-slate-400">{tmpl.category} • {tmpl.question.questionType.replace('_', ' ')}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Preview button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
            disabled={questions.length === 0}
            className="h-9 gap-1.5 text-xs font-semibold"
          >
            <Eye className="w-3.5 h-3.5" />
            Candidate Preview
          </Button>

          {/* Add Question button */}
          <Button
            type="button"
            size="sm"
            onClick={openAddQuestion}
            className="h-9 gap-1.5 text-xs font-semibold bg-[#2e5bff] hover:bg-blue-600 text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Questions list */}
      {questions.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 text-center bg-slate-50/50 dark:bg-slate-900/40">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center mx-auto mb-3 text-primary">
            <FileQuestion className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            No screening questions added yet
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-4">
            Candidates will apply using the standard profile & resume flow. Add questions to screen for notice period, experience, relocation, or key skills.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleApplyTemplate('notice_period')}
              className="text-xs font-medium"
            >
              + Notice Period
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleApplyTemplate('exp_years')}
              className="text-xs font-medium"
            >
              + Experience in Years
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleApplyTemplate('work_authorization')}
              className="text-xs font-medium"
            >
              + Work Authorization
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, index) => (
            <div
              key={q.id || index}
              className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xs hover:border-blue-200 dark:hover:border-blue-900 transition-all flex items-start gap-3"
            >
              {/* Order and reorder buttons */}
              <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-mono font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <div className="flex flex-col gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                    title="Move up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    disabled={index === questions.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    title="Move down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Main question summary */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-slate-900 dark:text-white leading-snug">
                    {q.questionText}
                  </span>
                  {q.isRequired ? (
                    <Badge variant="destructive" className="text-[10px] uppercase font-bold py-0 h-4">
                      Required
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-slate-500 py-0 h-4">
                      Optional
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-[10px] uppercase font-mono py-0 h-4">
                    {QUESTION_TYPE_LABELS[q.questionType]?.label || q.questionType}
                  </Badge>
                </div>

                {q.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {q.description}
                  </p>
                )}

                {/* Options preview for choice questions */}
                {['single_choice', 'multiple_choice', 'dropdown'].includes(q.questionType) &&
                  q.options &&
                  q.options.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[11px] text-slate-400 font-medium">Choices:</span>
                      {q.options.slice(0, 4).map((opt, oIdx) => (
                        <span
                          key={oIdx}
                          className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md"
                        >
                          {opt}
                        </span>
                      ))}
                      {q.options.length > 4 && (
                        <span className="text-[10px] text-slate-400">
                          +{q.options.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                {/* Validation rules summary */}
                <div className="text-[11px] text-slate-400 flex items-center gap-3">
                  {q.validationRules?.minValue !== undefined && (
                    <span>Min value: {q.validationRules.minValue}</span>
                  )}
                  {q.validationRules?.maxValue !== undefined && (
                    <span>Max value: {q.validationRules.maxValue}</span>
                  )}
                  {q.validationRules?.maxLength !== undefined && (
                    <span>Max chars: {q.validationRules.maxLength}</span>
                  )}
                  {q.validationRules?.maxSelections !== undefined && (
                    <span>Max selections: {q.validationRules.maxSelections}</span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  onClick={() => openEditQuestion(q)}
                  title="Edit question"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-destructive"
                  onClick={() => setDeleteConfirmIndex(index)}
                  title="Delete question"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmIndex !== null}
        onOpenChange={(open) => !open && setDeleteConfirmIndex(null)}
      >
        <DialogContent className="max-w-md bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
              Remove Screening Question?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Are you sure you want to remove this question? Candidates applying in the future will no
              longer be asked to answer it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmIndex(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => deleteConfirmIndex !== null && handleDelete(deleteConfirmIndex)}
            >
              Delete Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Add / Edit Modal */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 p-6 rounded-2xl">
          <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              {editingQuestion ? 'Edit Screening Question' : 'Add New Screening Question'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Configure question prompt, required status, and response validation parameters.
            </DialogDescription>
          </DialogHeader>

          {editorError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{editorError}</span>
            </div>
          )}

          <div className="space-y-4 py-2">
            {/* Question Text */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Question Text <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g. How many years of experience do you have with TypeScript?"
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                maxLength={QUESTIONNAIRE_LIMITS.MAX_QUESTION_TEXT_LENGTH}
                className="bg-white dark:bg-slate-950"
              />
              <span className="text-[10px] text-slate-400 block text-right">
                {draftText.length} / {QUESTIONNAIRE_LIMITS.MAX_QUESTION_TEXT_LENGTH}
              </span>
            </div>

            {/* Description / Instructions */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Instructions / Context (Optional)
              </Label>
              <Input
                placeholder="e.g. Include internships and full-time professional roles."
                value={draftDesc}
                onChange={(e) => setDraftDesc(e.target.value)}
                maxLength={QUESTIONNAIRE_LIMITS.MAX_DESCRIPTION_LENGTH}
                className="bg-white dark:bg-slate-950"
              />
            </div>

            {/* Question Type & Required status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Question Type
                </Label>
                <Select
                  value={draftType}
                  onValueChange={(val: ScreeningQuestionType) => setDraftType(val)}
                >
                  <SelectTrigger className="bg-white dark:bg-slate-950">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(QUESTION_TYPE_LABELS) as ScreeningQuestionType[]).map((k) => (
                      <SelectItem key={k} value={k}>
                        {QUESTION_TYPE_LABELS[k].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 flex flex-col justify-end pb-1">
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Required Answer
                    </Label>
                    <p className="text-[10px] text-slate-400">Must be answered to submit</p>
                  </div>
                  <Switch checked={draftRequired} onCheckedChange={setDraftRequired} />
                </div>
              </div>
            </div>

            {/* Choice options editor */}
            {['single_choice', 'multiple_choice', 'dropdown'].includes(draftType) && (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Answer Options ({draftOptions.length})
                  </Label>
                  <span className="text-[10px] text-slate-400">Min 2, Max {QUESTIONNAIRE_LIMITS.MAX_OPTIONS_COUNT}</span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {draftOptions.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400 w-4">{oIdx + 1}.</span>
                      <Input
                        value={opt}
                        onChange={(e) => {
                          const updated = [...draftOptions];
                          updated[oIdx] = e.target.value;
                          setDraftOptions(updated);
                        }}
                        className="h-8 text-xs bg-white dark:bg-slate-900"
                        maxLength={QUESTIONNAIRE_LIMITS.MAX_OPTION_TEXT_LENGTH}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-destructive shrink-0"
                        onClick={() => handleRemoveOption(oIdx)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>

                {draftOptions.length < QUESTIONNAIRE_LIMITS.MAX_OPTIONS_COUNT && (
                  <div className="flex items-center gap-2 pt-1">
                    <Input
                      placeholder="Add another option..."
                      value={newOptionInput}
                      onChange={(e) => setNewOptionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddOption();
                        }
                      }}
                      className="h-8 text-xs bg-white dark:bg-slate-900"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddOption}
                      className="h-8 text-xs font-semibold shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add
                    </Button>
                  </div>
                )}

                {draftType === 'multiple_choice' && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                    <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Maximum selections allowed (optional)
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={draftOptions.length}
                      value={draftMaxSelections ?? ''}
                      onChange={(e) =>
                        setDraftMaxSelections(e.target.value ? Number(e.target.value) : undefined)
                      }
                      placeholder={`Up to ${draftOptions.length}`}
                      className="h-8 text-xs max-w-xs mt-1 bg-white dark:bg-slate-900"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Numeric constraints */}
            {draftType === 'numeric' && (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Minimum Value</Label>
                  <Input
                    type="number"
                    value={draftMinValue ?? ''}
                    onChange={(e) => setDraftMinValue(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g. 0"
                    className="h-8 text-xs bg-white dark:bg-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Maximum Value</Label>
                  <Input
                    type="number"
                    value={draftMaxValue ?? ''}
                    onChange={(e) => setDraftMaxValue(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g. 50"
                    className="h-8 text-xs bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Text constraints */}
            {['short_text', 'long_text'].includes(draftType) && (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Min Character Length</Label>
                  <Input
                    type="number"
                    min={0}
                    value={draftMinLength ?? ''}
                    onChange={(e) => setDraftMinLength(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g. 10"
                    className="h-8 text-xs bg-white dark:bg-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Max Character Length</Label>
                  <Input
                    type="number"
                    min={1}
                    value={draftMaxLength ?? ''}
                    onChange={(e) => setDraftMaxLength(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder={draftType === 'short_text' ? '300' : '3000'}
                    className="h-8 text-xs bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditorOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveQuestion}
              className="bg-[#2e5bff] hover:bg-blue-600 text-white font-semibold"
            >
              {editingQuestion ? 'Update Question' : 'Add Question'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recruiter Live Candidate Preview Modal */}
      <ScreeningQuestionsPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        questions={questions}
        jobTitle={jobTitle}
        companyName={companyName}
      />
    </div>
  );
}
