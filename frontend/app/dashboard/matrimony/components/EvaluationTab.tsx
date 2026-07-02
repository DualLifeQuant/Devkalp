'use client'
import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Check, Star, ChevronRight, AlertCircle, Heart } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { PageLoader, SkeletonList, InlineError } from '@/components/common/LoadingStates'
import { useEvalQuestions, useMyEvalResponse, useSubmitEvaluation } from '@/hooks/useApiQueries'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const CATEGORY_COLORS: Record<string, string> = {
  self_awareness: 'bg-trust-100 text-trust-800 border-trust-200',
  family_dynamics: 'bg-saffron-100 text-saffron-800 border-saffron-200',
  communication: 'bg-sage-100 text-sage-800 border-sage-200',
  values: 'bg-warm-100 text-warm-800 border-warm-200',
  readiness: 'bg-purple-100 text-purple-800 border-purple-200',
}

const CATEGORY_LABELS: Record<string, string> = {
  self_awareness: 'Self Awareness',
  family_dynamics: 'Family Dynamics',
  communication: 'Communication',
  values: 'Values & Goals',
  readiness: 'Emotional Readiness',
}

interface EvaluationTabProps {
  onEvaluationComplete?: () => void
}

export default function EvaluationTab({ onEvaluationComplete }: EvaluationTabProps) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<any>(null)

  const { data: questions = [], isLoading: questionsLoading, isError: questionsError, refetch: refetchQuestions } = useEvalQuestions()
  const { data: existingResponse, isLoading: responseLoading, isError: responseError, refetch: refetchResponse } = useMyEvalResponse()
  const submitMutation = useSubmitEvaluation()
  const loading = questionsLoading || responseLoading

  useEffect(() => {
    if (existingResponse?.completed) {
      setSubmitted(true)
      setResult(existingResponse)
    }
  }, [existingResponse])

  const current = questions[currentIdx]
  const progress = questions.length > 0 ? (currentIdx / questions.length) * 100 : 0
  const isAnswered = current && (
    (current.question_type === 'scale' && answers[current.id]?.scale_value != null) ||
    (current.question_type === 'text' && answers[current.id]?.text_value?.trim()) ||
    (current.question_type === 'mcq' && answers[current.id]?.selected_option)
  )

  const setAnswer = (questionId: string, data: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: { question_id: questionId, ...data } }))
  }

  const handleSubmit = async () => {
    const answerList = Object.values(answers)
    try {
      const res = await submitMutation.mutateAsync({ answers: answerList })
      setResult((res as any).data)
      setSubmitted(true)
      toast.success('Evaluation submitted! Our counselors will review it.')
      if (onEvaluationComplete) {
        onEvaluationComplete()
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Submission failed')
    }
  }

  if (loading) return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-slate-100 pb-5">
        <h2 className="font-display text-2xl text-trust-900 font-bold">Emotional Readiness Evaluation</h2>
      </div>
      <SkeletonList count={3} />
    </div>
  )

  if (questionsError || responseError) return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-slate-100 pb-5">
        <h2 className="font-display text-2xl text-trust-900 font-bold">Emotional Readiness Evaluation</h2>
      </div>
      <InlineError 
        message="Failed to load evaluation questions." 
        onRetry={() => {
          refetchQuestions()
          refetchResponse()
        }} 
      />
    </div>
  )

  if (submitted && result) return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div className="border-b border-slate-100 pb-5 text-center">
        <div className="w-16 h-16 rounded-full bg-sage-50 border border-sage-100 flex items-center justify-center mx-auto mb-4 text-sage-600 shadow-sm">
          <Check size={28} />
        </div>
        <h2 className="font-display text-2xl font-bold text-trust-900 mb-1">Evaluation Complete</h2>
        <p className="text-slate-500 text-sm">
          Our counseling specialists will utilize your responses to map personal alignment and guide your match suggestions.
        </p>
      </div>

      {result.overall_score !== undefined && result.overall_score !== null && (
        <div className="bg-gradient-to-br from-trust-50/50 to-saffron-50/50 border border-slate-100 rounded-3xl p-8 text-center shadow-sm">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Overall Readiness Score</p>
          <p className="font-display text-6xl font-extrabold text-trust-800 mb-2">
            {Math.round(result.overall_score)}
            <span className="text-2xl text-slate-400 font-normal">%</span>
          </p>
          <p className="text-slate-600 text-xs max-w-md mx-auto leading-relaxed">
            {result.overall_score >= 75 ? '🌟 Excellent readiness — you seem very prepared for this journey.' :
             result.overall_score >= 50 ? '✨ Good foundation with some areas to explore with your counselor.' :
             '🌱 Early stage — our counselors will guide you with care and patience.'}
          </p>
        </div>
      )}

      {result.category_scores && Object.keys(result.category_scores).length > 0 && (
        <Card className="p-6 md:p-8 rounded-3xl border-slate-100 shadow-card space-y-5">
          <p className="font-display text-sm font-bold text-slate-800 mb-1">Score by Dimension</p>
          {Object.entries(result.category_scores).map(([cat, score]: [string, any]) => (
            <div key={cat} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className={clsx('badge text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full border', CATEGORY_COLORS[cat])}>
                  {CATEGORY_LABELS[cat] || cat}
                </span>
                <span className="text-xs font-bold text-slate-700">{Math.round(score)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full bg-trust-600 transition-all duration-1000" style={{ width: `${score}%` }} />
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      {/* Header Info */}
      <div className="border-b border-slate-100 pb-5">
        <p className="font-accent italic text-saffron-600 text-sm mb-1">Devkalp Counseling Vetting</p>
        <h2 className="font-display text-2xl text-trust-900 font-bold">Emotional Readiness Evaluation</h2>
        <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
          This questionnaire helps our counselor team understand your marriage goals, expectations, and alignment.
          All answers are strictly confidential and private.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>Question {currentIdx + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-trust-600 to-saffron-500 transition-all duration-500"
            style={{ width: `${((currentIdx + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }} 
          />
        </div>
      </div>

      {current && (
        <Card className="p-6 md:p-8 bg-white border-slate-100 shadow-card rounded-3xl space-y-6">
          {/* Category badge */}
          <span className={clsx('badge text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full border', CATEGORY_COLORS[current.category])}>
            {CATEGORY_LABELS[current.category] || current.category}
          </span>

          <h3 className="font-display text-lg font-bold text-slate-800 leading-relaxed">
            {current.question_text}
          </h3>

          {/* Scale question */}
          {current.question_type === 'scale' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5 py-2 justify-center sm:justify-start">
                {Array.from({ length: current.scale_max - current.scale_min + 1 }, (_, i) => i + current.scale_min).map(n => (
                  <button 
                    key={n} 
                    onClick={() => setAnswer(current.id, { scale_value: n })}
                    className={clsx(
                      'w-11 h-11 rounded-xl border-2 text-sm font-bold transition-all duration-150 flex items-center justify-center',
                      answers[current.id]?.scale_value === n
                        ? 'border-trust-750 bg-trust-800 text-white shadow-md scale-105'
                        : 'border-slate-200 text-slate-600 hover:border-trust-400 hover:bg-trust-50/50'
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
              {current.scale_labels && (
                <div className="flex justify-between text-[11px] text-slate-400 font-semibold px-1">
                  <span>{current.scale_labels[String(current.scale_min)]}</span>
                  <span>{current.scale_labels[String(current.scale_max)]}</span>
                </div>
              )}
            </div>
          )}

          {/* Text question */}
          {current.question_type === 'text' && (
            <textarea
              className="input text-sm resize-none w-full"
              rows={4}
              placeholder="Share your thoughts openly — there are no wrong answers…"
              value={answers[current.id]?.text_value || ''}
              onChange={e => setAnswer(current.id, { text_value: e.target.value })}
            />
          )}

          {/* MCQ question */}
          {current.question_type === 'mcq' && current.options && (
            <div className="space-y-2.5">
              {current.options.map((opt: string) => (
                <button 
                  key={opt} 
                  onClick={() => setAnswer(current.id, { selected_option: opt })}
                  className={clsx(
                    'w-full text-left p-4 rounded-xl border-2 text-xs sm:text-sm transition-all duration-150 flex items-center',
                    answers[current.id]?.selected_option === opt
                      ? 'border-trust-700 bg-trust-50/30 text-trust-850 font-bold'
                      : 'border-slate-250/70 text-slate-600 hover:border-slate-350 hover:bg-slate-50/50'
                  )}
                >
                  <span className={clsx(
                    'inline-flex items-center justify-center w-5 h-5 rounded-full border-2 mr-3 text-[10px] shrink-0',
                    answers[current.id]?.selected_option === opt ? 'border-trust-700 bg-trust-700 text-white' : 'border-slate-300'
                  )}>
                    {answers[current.id]?.selected_option === opt && <Check size={10} />}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <Button 
          variant="ghost" 
          onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} 
          disabled={currentIdx === 0}
          className="flex items-center gap-1 text-xs"
        >
          <ArrowLeft size={14} /> Previous
        </Button>

        {currentIdx < questions.length - 1 ? (
          <Button 
            onClick={() => setCurrentIdx(i => i + 1)} 
            disabled={!isAnswered}
            className="flex items-center gap-1 text-xs bg-trust-800"
          >
            Next <ArrowRight size={14} />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit} 
            loading={submitMutation.isPending} 
            variant="secondary" 
            disabled={!isAnswered}
            className="flex items-center gap-1 text-xs bg-saffron-500 hover:bg-saffron-600 border-none text-trust-950 font-bold"
          >
            Submit Evaluation ✓
          </Button>
        )}
      </div>
    </div>
  )
}
