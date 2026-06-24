import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Star, ChevronRight } from 'lucide-react'
import { HeartHandshake, User, Heart } from 'lucide-react'
import { Button, Spinner } from '@/components/ui'
import { emotionalApi } from '@/lib/api'
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
  self_awareness: 'bg-trust-50 text-trust-700 border-trust-100',
  family_dynamics: 'bg-saffron-50 text-saffron-800 border-saffron-100',
  communication: 'bg-indigo-50/70 text-indigo-700 border-indigo-100/50',
  values: 'bg-amber-50 text-amber-800 border-amber-100',
  readiness: 'bg-purple-50 text-purple-700 border-purple-100',
}

const CATEGORY_LABELS: Record<string, string> = {
  self_awareness: 'Self Awareness',
  family_dynamics: 'Family Dynamics',
  communication: 'Communication',
  values: 'Values & Goals',
  readiness: 'Emotional Readiness',
}

export default function EvaluationSection({ id }: { id?: string }) {
  const [questions, setQuestions] = useState<any[]>([])
  const [existing, setExisting] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<any>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const [qRes, rRes] = await Promise.allSettled([emotionalApi.questions(), emotionalApi.myResponse()])
        if (qRes.status === 'fulfilled') setQuestions(qRes.value.data)
        if (rRes.status === 'fulfilled' && rRes.value.data.completed) {
          setExisting(rRes.value.data); setSubmitted(true); setResult(rRes.value.data)
        }
      } catch { /* ok */ }
      finally { setLoading(false) }
    }
    load()
  }, [])

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
    setSubmitting(true)
    try {
      const res = await emotionalApi.submit({ answers: answerList })
      setResult(res.data)
      setSubmitted(true)
      toast.success('Evaluation submitted! Our counselors will review it.')
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Submission failed')
    } finally { setSubmitting(false) }
  }

  if (loading) return (
    <div id={id} className="scroll-mt-32 w-full pt-10 border-t border-slate-100 mt-10">
      <div className="flex justify-center py-16"><Spinner size="lg" /></div>
    </div>
  )

  if (submitted && result) return (
    <div id={id} className="scroll-mt-32 w-full pt-10 border-t border-slate-100 mt-10">
      <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-8">
        
        {/* Verification banner */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
            <Check size={28} className="stroke-[3]" />
          </div>
          <div className="space-y-1">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-trust-900">Evaluation Completed</h1>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Our matchmaking counselors will analyze these responses to help find matching partners aligned with your thoughts.
            </p>
          </div>
        </div>

        {/* Readiness Score Layout */}
        {result.overall_score !== undefined && (
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-card text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-trust-50/30 rounded-full blur-2xl pointer-events-none" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Marriage Readiness Quotient</p>
            <p className="font-display text-6xl font-black text-trust-900 mb-3 tracking-tight">
              {Math.round(result.overall_score)}<span className="text-2xl font-bold text-trust-400">%</span>
            </p>
            <p className="text-slate-600 text-sm font-semibold leading-relaxed max-w-md mx-auto">
              {result.overall_score >= 75 ? '🌟 Prepared & Self-Aware — you display high maturity and family dynamics alignment.' :
               result.overall_score >= 50 ? '✨ Positive foundations — matches showing matching communication values will be prioritized.' :
               '🌱 Active Reflection — counselors will guide you through matching values during the screening.'}
            </p>
          </div>
        )}

        {/* Category breakdown list */}
        {result.category_scores && Object.keys(result.category_scores).length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-card space-y-5">
            <h3 className="font-display text-lg font-bold text-trust-900 border-b border-slate-50 pb-3">
              Section Alignment Analysis
            </h3>
            <div className="space-y-4">
              {Object.entries(result.category_scores).map(([cat, score]: [string, any]) => (
                <div key={cat} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className={clsx('px-2.5 py-1 text-[11px] font-bold rounded-lg border capitalize', CATEGORY_COLORS[cat])}>
                      {CATEGORY_LABELS[cat] || cat}
                    </span>
                    <span className="font-bold text-slate-700">{Math.round(score)}%</span>
                  </div>
                  <div className="w-full bg-slate-50 border border-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-trust-600 to-indigo-500 transition-all duration-700" style={{ width: `${score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button onClick={() => navigate('/dashboard/matrimony')} className="w-full justify-center h-11 font-semibold shadow-warm">
          Return to Dashboard <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )

  return (
    <div id={id} className="scroll-mt-32 w-full pt-10 border-t border-slate-100 mt-10">
      <div className="p-4 md:p-6 max-w-xl mx-auto space-y-5">
        
        {/* Header Title */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-trust-600">Step 2: Understanding Your Values</span>
          <h1 className="font-display text-xl md:text-2xl font-bold text-trust-900 mt-0.5">Readiness Assessment</h1>
          <p className="text-slate-500 text-xs mt-1">Our counseling team reviews these responses for match compatibility mapping. Answers are fully private.</p>
        </div>

        {/* Progress Bar Header */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Question {currentIdx + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-trust-600 to-indigo-500 transition-all duration-500"
              style={{ width: `${((currentIdx + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }} />
          </div>
        </div>

        {current && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-card space-y-5">
            
            {/* Category tag */}
            <div>
              <span className={clsx('px-2.5 py-1 text-[10px] font-bold rounded-lg border capitalize', CATEGORY_COLORS[current.category])}>
                {CATEGORY_LABELS[current.category] || current.category}
              </span>
            </div>

            <h2 className="font-display text-lg md:text-xl font-bold text-trust-900 leading-snug">
              {current.question_text}
            </h2>

            {/* Scale type rendering */}
            {current.question_type === 'scale' && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                  {Array.from({ length: current.scale_max - current.scale_min + 1 }, (_, i) => i + current.scale_min).map(n => (
                    <button key={n} onClick={() => setAnswer(current.id, { scale_value: n })}
                      className={clsx(
                        'w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 text-xs sm:text-sm font-bold transition-all flex items-center justify-center shadow-sm',
                        answers[current.id]?.scale_value === n
                          ? 'border-trust-700 bg-trust-800 text-white scale-105 shadow-warm'
                          : 'border-slate-200 text-slate-600 hover:border-trust-400 hover:bg-trust-50/50'
                      )}>
                      {n}
                    </button>
                  ))}
                </div>
                {current.scale_labels && (
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 px-2 pt-2 border-t border-slate-50">
                    <span>{current.scale_labels[String(current.scale_min)]}</span>
                    <span>{current.scale_labels[String(current.scale_max)]}</span>
                  </div>
                )}
              </div>
            )}

            {/* Text type rendering */}
            {current.question_type === 'text' && (
              <textarea
                className="input resize-none border-slate-200 focus:border-trust-400 p-3 text-sm font-medium"
                rows={3}
                placeholder="Share your thoughts openly — there are no wrong answers…"
                value={answers[current.id]?.text_value || ''}
                onChange={e => setAnswer(current.id, { text_value: e.target.value })}
              />
            )}

            {/* MCQ type rendering */}
            {current.question_type === 'mcq' && current.options && (
              <div className="space-y-2">
                {current.options.map((opt: string) => (
                  <button key={opt} onClick={() => setAnswer(current.id, { selected_option: opt })}
                    className={clsx(
                      'w-full text-left p-3 rounded-xl border-2 text-xs transition-all flex items-center justify-between',
                      answers[current.id]?.selected_option === opt
                        ? 'border-trust-700 bg-trust-50/40 text-trust-800 font-bold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/50'
                    )}>
                    <span className="flex-1 pr-4 font-semibold">{opt}</span>
                    <span className={clsx(
                      'inline-flex items-center justify-center w-4.5 h-4.5 rounded-full border-2 text-xs shrink-0 transition-all',
                      answers[current.id]?.selected_option === opt ? 'border-trust-700 bg-trust-700 text-white' : 'border-slate-300'
                    )}>
                      {answers[current.id]?.selected_option === opt && <Check size={8} className="stroke-[3]" />}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0} className="font-semibold text-slate-500 shadow-none text-xs h-9 py-0">
            <ArrowLeft size={14} /> Previous
          </Button>

          {currentIdx < questions.length - 1 ? (
            <Button onClick={() => setCurrentIdx(i => i + 1)} disabled={!isAnswered} className="font-semibold shadow-warm text-xs h-9 py-0">
              Next Question <ArrowRight size={14} />
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={submitting} variant="secondary" disabled={!isAnswered} className="font-semibold shadow-warm text-xs h-9 py-0">
              Submit Evaluation <Check size={14} />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
