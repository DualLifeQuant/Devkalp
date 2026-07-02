'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Star, ChevronRight } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { HeartHandshake, User, Heart } from 'lucide-react'
import { Button } from '@/components/ui'
import { PageLoader } from '@/components/common/LoadingStates'
import { useEvalQuestions, useMyEvalResponse, useSubmitEvaluation } from '@/hooks/useApiQueries'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const NAV = [
  { href: '/dashboard/matrimony',            icon: <HeartHandshake size={18} />, label: 'Overview' },
  { href: '/dashboard/matrimony/profile',    icon: <User size={18} />,           label: 'My Profile' },
  { href: '/dashboard/matrimony/matches',    icon: <Heart size={18} />,          label: 'Matches' },
  { href: '/dashboard/matrimony/evaluation', icon: <Star size={18} />,           label: 'Readiness Eval.' },
  { href: '/dashboard/matrimony/family',     icon: <User size={18} />,           label: 'Family Details' },
]

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

export default function EvaluationPage() {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<any>(null)
  const router = useRouter()

  const { data: questions = [], isLoading: questionsLoading } = useEvalQuestions()
  const { data: existingResponse, isLoading: responseLoading } = useMyEvalResponse()
  const submitMutation = useSubmitEvaluation()
  const loading = questionsLoading || responseLoading

  useEffect(() => {
    if (existingResponse?.completed) {
      setSubmitted(true)
      setResult(existingResponse)
    }
  }, [existingResponse])

  const current = questions[currentIdx]
  const progress = questions.length > 0 ? ((currentIdx) / questions.length) * 100 : 0
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
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Submission failed')
    }
  }

  if (loading) return (
    <DashboardLayout navItems={NAV} title="Matrimony">
      <PageLoader />
    </DashboardLayout>
  )

  if (submitted && result) return (
    <DashboardLayout navItems={NAV} title="Matrimony">
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4">
            <Check size={36} className="text-sage-600" />
          </div>
          <h1 className="font-display text-3xl text-trust-900 mb-2">Evaluation Complete</h1>
          <p className="text-slate-500">Our counselors will review your responses and use them to guide your journey.</p>
        </div>

        {result.overall_score && (
          <div className="bg-gradient-to-br from-trust-50 to-saffron-50 rounded-3xl p-8 mb-6 text-center">
            <p className="text-slate-500 text-sm mb-2">Overall Readiness Score</p>
            <p className="font-display text-6xl font-semibold text-trust-800 mb-1">{Math.round(result.overall_score)}<span className="text-2xl text-slate-400">%</span></p>
            <p className="text-slate-500 text-sm">
              {result.overall_score >= 75 ? '🌟 Excellent readiness — you seem very prepared for this journey.' :
               result.overall_score >= 50 ? '✨ Good foundation with some areas to explore with your counselor.' :
               '🌱 Early stage — our counselors will guide you with care and patience.'}
            </p>
          </div>
        )}

        {result.category_scores && Object.keys(result.category_scores).length > 0 && (
          <div className="space-y-3 mb-8">
            <p className="font-semibold text-slate-700 text-sm mb-3">Score by Category</p>
            {Object.entries(result.category_scores).map(([cat, score]: [string, any]) => (
              <div key={cat}>
                <div className="flex items-center justify-between mb-1">
                  <span className={clsx('badge text-xs', CATEGORY_COLORS[cat])}>{CATEGORY_LABELS[cat] || cat}</span>
                  <span className="text-sm font-semibold text-slate-700">{Math.round(score)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="h-2 rounded-full bg-trust-500 transition-all duration-700" style={{ width: `${score}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        <Button onClick={() => router.push('/dashboard/matrimony')} className="w-full justify-center">
          Back to Dashboard →
        </Button>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout navItems={NAV} title="Matrimony">
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="font-accent italic text-saffron-600 text-base mb-1">Understanding You Better</p>
          <h1 className="font-display text-2xl text-trust-900 mb-2">Emotional Readiness Evaluation</h1>
          <p className="text-slate-500 text-sm">This questionnaire helps our counselors understand your readiness for marriage. Your answers are private and used only to guide your journey.</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Question {currentIdx + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="h-2 rounded-full bg-gradient-to-r from-trust-600 to-saffron-500 transition-all duration-500"
              style={{ width: `${((currentIdx + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }} />
          </div>
        </div>

        {current && (
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-card mb-6">
            {/* Category badge */}
            <span className={clsx('badge text-xs mb-5 inline-flex', CATEGORY_COLORS[current.category])}>
              {CATEGORY_LABELS[current.category] || current.category}
            </span>

            <h2 className="font-display text-xl text-trust-900 leading-relaxed mb-6">{current.question_text}</h2>

            {/* Scale question */}
            {current.question_type === 'scale' && (
              <div>
                <div className="flex items-center gap-4 mb-3">
                  {Array.from({ length: current.scale_max - current.scale_min + 1 }, (_, i) => i + current.scale_min).map(n => (
                    <button key={n} onClick={() => setAnswer(current.id, { scale_value: n })}
                      className={clsx(
                        'w-10 h-10 rounded-xl border-2 text-sm font-semibold transition-all duration-150',
                        answers[current.id]?.scale_value === n
                          ? 'border-trust-700 bg-trust-800 text-white scale-110'
                          : 'border-slate-200 text-slate-600 hover:border-trust-400 hover:bg-trust-50'
                      )}>
                      {n}
                    </button>
                  ))}
                </div>
                {current.scale_labels && (
                  <div className="flex justify-between text-xs text-slate-400 px-1">
                    <span>{current.scale_labels[String(current.scale_min)]}</span>
                    <span>{current.scale_labels[String(current.scale_max)]}</span>
                  </div>
                )}
              </div>
            )}

            {/* Text question */}
            {current.question_type === 'text' && (
              <textarea
                className="input resize-none"
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
                  <button key={opt} onClick={() => setAnswer(current.id, { selected_option: opt })}
                    className={clsx(
                      'w-full text-left p-4 rounded-xl border-2 text-sm transition-all duration-150',
                      answers[current.id]?.selected_option === opt
                        ? 'border-trust-700 bg-trust-50 text-trust-800 font-medium'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    )}>
                    <span className={clsx(
                      'inline-flex items-center justify-center w-5 h-5 rounded-full border-2 mr-3 text-xs shrink-0',
                      answers[current.id]?.selected_option === opt ? 'border-trust-700 bg-trust-700 text-white' : 'border-slate-300'
                    )}>
                      {answers[current.id]?.selected_option === opt && <Check size={10} />}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0}>
            <ArrowLeft size={16} /> Previous
          </Button>

          {currentIdx < questions.length - 1 ? (
            <Button onClick={() => setCurrentIdx(i => i + 1)} disabled={!isAnswered}>
              Next <ArrowRight size={16} />
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={submitMutation.isPending} variant="secondary" disabled={!isAnswered}>
              Submit Evaluation ✓
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
