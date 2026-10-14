"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Application, ApplicationAnswer } from '@/lib/types';
import {
  FileText,
  User,
  ExternalLink,
  CheckCircle,
  HelpCircle,
  Calendar,
  Layers,
  AlertCircle,
  X,
} from 'lucide-react';
import { format } from 'date-fns';

interface AnswersModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
}

export function CandidateScreeningAnswersModal({
  isOpen,
  onClose,
  application,
}: AnswersModalProps) {
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && application?.id) {
      setLoading(true);
      setError(null);
      fetch(`/api/applications/${application.id}/answers`)
        .then(async (res) => {
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to load answers');
          }
          return res.json();
        })
        .then((data) => {
          setAnswers(Array.isArray(data.answers) ? data.answers : []);
        })
        .catch((err: any) => {
          setError(err.message || 'Failed to load answers.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, application?.id]);

  if (!application) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800">
        <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <span className="text-primary font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Applicant Questionnaire Answers
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-[10px]">
                App #{application.id}
              </Badge>
              {answers.length > 0 && answers[0]?.questionSnapshot?.version && (
                <Badge variant="secondary" className="font-mono text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Version {answers[0].questionSnapshot.version}
                </Badge>
              )}
            </div>
          </div>

          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
            <span>{application.applicantName || 'Candidate'}</span>
          </DialogTitle>

          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 pt-1">
            <span>{application.applicantEmail}</span>
            {application.appliedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Applied {format(new Date(application.appliedAt), 'MMM dd, yyyy')}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-8 text-center text-xs text-destructive flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8 opacity-60 text-destructive" />
            <p className="font-semibold">{error}</p>
          </div>
        ) : answers.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="font-medium text-slate-600 dark:text-slate-300">No screening answers recorded</p>
            <p className="text-xs text-slate-400 mt-1">This application was submitted without screening questions.</p>
          </div>
        ) : (
          <div className="space-y-4 py-3">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-primary" />
                Historical question snapshot preserved at time of submission
              </span>
              <span className="font-mono font-semibold">{answers.length} Responses</span>
            </div>

            {answers.map((item, idx) => {
              const snapshot = item.questionSnapshot || {};
              const answerVal = item.answerValue;
              const hasAnswer =
                answerVal !== undefined &&
                answerVal !== null &&
                (typeof answerVal === 'string' ? answerVal.trim() !== '' : true) &&
                (Array.isArray(answerVal) ? answerVal.length > 0 : true);

              return (
                <div
                  key={item.id || idx}
                  className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400 font-bold">
                          Q{idx + 1}.
                        </span>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {snapshot.questionText || `Question ${idx + 1}`}
                        </h4>
                      </div>
                      {snapshot.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 pl-6 leading-relaxed">
                          {snapshot.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {snapshot.isRequired ? (
                        <Badge variant="destructive" className="text-[10px] uppercase font-bold py-0 h-4">
                          Required
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-slate-500 py-0 h-4">
                          Optional
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-[10px] uppercase font-mono py-0 h-4">
                        {(snapshot.questionType || '').replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  {/* Candidate's answer */}
                  <div className="pt-2 pl-6">
                    {!hasAnswer ? (
                      <span className="text-xs italic text-slate-400">
                        Skipped by candidate (Optional question)
                      </span>
                    ) : snapshot.questionType === 'url' ? (
                      <a
                        href={String(answerVal)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline break-all"
                      >
                        {String(answerVal)}
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : snapshot.questionType === 'yes_no' ? (
                      <Badge
                        className={`text-xs font-bold px-3 py-0.5 rounded-full ${
                          String(answerVal).toLowerCase() === 'yes'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-200'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {String(answerVal)}
                      </Badge>
                    ) : snapshot.questionType === 'multiple_choice' && Array.isArray(answerVal) ? (
                      <div className="flex flex-wrap gap-1.5">
                        {answerVal.map((v, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs px-2.5 py-0.5"
                          >
                            {v}
                          </Badge>
                        ))}
                      </div>
                    ) : snapshot.questionType === 'single_choice' || snapshot.questionType === 'dropdown' ? (
                      <Badge
                        variant="secondary"
                        className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900 text-xs font-semibold px-2.5 py-0.5"
                      >
                        {String(answerVal)}
                      </Badge>
                    ) : snapshot.questionType === 'numeric' ? (
                      <span className="font-mono text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md">
                        {String(answerVal)}
                      </span>
                    ) : snapshot.questionType === 'date' ? (
                      <span className="font-mono text-xs font-medium text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md">
                        {String(answerVal)}
                      </span>
                    ) : (
                      <p className="text-xs text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                        {String(answerVal)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter className="border-t border-slate-100 dark:border-slate-800 pt-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
