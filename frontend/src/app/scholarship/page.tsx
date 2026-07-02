<<<<<<< HEAD
<<<<<<< HEAD
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, School, Award, ExternalLink, Check, Mail, Info, Upload, Send } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { enquiriesApi, jobsApi, donationsApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'
import { Button } from '@/components/ui'
import { useAuthStore } from '@/lib/store'
import { useNavigate } from 'react-router-dom'

const DIGITAL_GUJARAT_FILES = [
  { id: 'hsc_marksheet', label: 'HSC Marksheet / Result *' },
  { id: 'ssc_marksheet', label: 'SSC Marksheet / Result *' },
  { id: 'college_results', label: 'College Results (Last Sem/Year) *' },
  { id: 'leaving_certificate', label: 'School Leaving Certificate (LC) *' },
  { id: 'aadhar_card', label: 'Aadhar Card *' },
  { id: 'bank_passbook', label: 'Bank Passbook *' },
  { id: 'caste_certificate', label: 'Caste Certificate *' },
  { id: 'photograph', label: 'Passport Size Photograph *' },
  { id: 'income_certificate', label: 'Income Certificate *' },
  { id: 'fee_receipt', label: 'Current Year Fee Receipt *' },
  { id: 'bonafide_certificate', label: 'College Bonafide Certificate *' },
  { id: 'ration_card', label: 'Ration Card*' },
]

const MYSY_FRESH_FILES = [
  { id: 'aadhar_card', label: 'Aadhar Card *' },
  { id: 'bank_passbook', label: 'Bank Passbook *' },
  { id: 'photograph', label: 'Passport Size Photograph *' },
  { id: 'hsc_marksheet', label: 'HSC Marksheet / Result *' },
  { id: 'admission_letter', label: 'Admission Letter *' },
  { id: 'fee_receipt', label: 'Current Year Fee Receipt *' },
  { id: 'letterpad_certificate', label: 'Certificate on College Letterpad *' },
  { id: 'letterpad_fee_structure', label: 'Fee structure on College Letterpad *' },
  { id: 'father_income_cert', label: "Father's Income Certificate *" },
  { id: 'ration_card', label: 'Ration Card*' },
]

const MYSY_RENEW_FILES = [
  { id: 'aadhar_card', label: 'Aadhar Card *' },
  { id: 'bank_passbook', label: 'Bank Passbook *' },
  { id: 'photograph', label: 'Passport Size Photograph *' },
  { id: 'last_year_fee_receipt', label: 'Last Year Fee Receipt *' },
  { id: 'current_year_fee_receipt', label: 'Current Year Fee Receipt *' },
  { id: 'last_year_result', label: 'Last Year Result / Marksheet *' },
  { id: 'letterpad_certificate', label: 'Certificate on College Letterpad *' },
  { id: 'letterpad_fee_structure', label: 'Fee structure on College Letterpad *' },
  { id: 'father_income_cert', label: "Father's Income Certificate *" },
  { id: 'ration_card', label: 'Ration Card*' },
]

export default function ScholarshipPage() {
  const [formType, setFormType] = useState<'digital_gujarat' | 'mysy_fresh' | 'mysy_renew'>('digital_gujarat')
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    email: '',
    phone: '',
    college_start_date: '',
    college_end_date: '',
    admission_fee: '',
    tuition_fee: '',
    misc_fee: '',
    exam_fee: '',
  })
  const [files, setFiles] = useState<Record<string, File | null>>({})
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [donationId, setDonationId] = useState<string | null>(null)
  const [completingPayment, setCompletingPayment] = useState(false)
  const [uploadedUrls, setUploadedUrls] = useState<Record<string, string> | null>(null)
  const [messageBody, setMessageBody] = useState('')
  const [paymentFile, setPaymentFile] = useState<File | null>(null)
  const APPLICATION_FEE = 100
  const { isLoggedIn } = useAuthStore()
  const navigate = useNavigate()

  const activeFileFields = formType === 'digital_gujarat'
    ? DIGITAL_GUJARAT_FILES
    : formType === 'mysy_fresh'
      ? MYSY_FRESH_FILES
      : MYSY_RENEW_FILES

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!studentInfo.name || !studentInfo.email || !studentInfo.phone) {
      toast.error('Please fill in Name, Email, and Phone Number')
      return
    }

    if (formType === 'digital_gujarat') {
      if (!studentInfo.college_start_date || !studentInfo.college_end_date || !studentInfo.admission_fee || !studentInfo.tuition_fee) {
        toast.error('Please fill in term dates and fee details')
        return
      }
    }

    const missingFiles = activeFileFields.filter(f => !files[f.id])
    if (missingFiles.length > 0) {
      toast.error(`Please select the required file: ${missingFiles[0].label}`)
      return
    }

    setShowQR(true)
    toast.success('Documents ready! Please complete the payment.')
  }

  const handlePaymentComplete = async () => {
    if (!paymentFile) {
      toast.error('Please upload your payment screenshot to verify payment.')
      return
    }
    setCompletingPayment(true)
    try {
      const erpnextUrl = 'http://192.168.1.25:5100'
      const apiKey = '9ff88d537c92809'
      const apiSecret = '31a275388bce201'

      const currentDoctype = formType === 'digital_gujarat'
        ? 'Digital Gujarat Scholarship'
        : formType === 'mysy_fresh'
          ? 'MYSY Fresh Scholarship'
          : 'MYSY Renewal Scholarship'

      let payload: Record<string, any> = {
        doctype: currentDoctype,
        full_name: studentInfo.name,
        email_address: studentInfo.email,
        phone_number: studentInfo.phone,
      }

      if (formType === 'digital_gujarat') {
        payload = {
          ...payload,
          college_term_start_date: studentInfo.college_start_date,
          college_term_end_date: studentInfo.college_end_date,
          admission_fee: studentInfo.admission_fee,
          tuition_fee: studentInfo.tuition_fee,
          misc_fee: studentInfo.misc_fee || '0',
          exam_fee: studentInfo.exam_fee || '0',
        }
      }

      const createRes = await fetch(`${erpnextUrl}/api/resource/${encodeURIComponent(currentDoctype)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${apiKey}:${apiSecret}`,
          'X-Frappe-CSRF-Token': 'fetch',
        },
        body: JSON.stringify(payload),
      })

      const createResult = await createRes.json()
      if (!createRes.ok) throw new Error(createResult?.exception || 'ERPNext entry failed')

      const docName = createResult?.data?.name

      const fieldMapDG: Record<string, string> = {
        hsc_marksheet: 'hsc_marksheetresult',
        ssc_marksheet: 'ssc_marksheetresult_copy',
        college_results: 'college_results_last_semyear',
        leaving_certificate: 'school_leaving_certificate_lc',
        aadhar_card: 'aadhar_card',
        bank_passbook: 'bank_passbook',
        caste_certificate: 'caste_certificate',
        photograph: 'passport_size_photograph',
        income_certificate: 'income_certificate',
        fee_receipt: 'current_year_fee_receipt',
        bonafide_certificate: 'college_bonafide_certificate',
        ration_card: 'ration_card',
      }

      const fieldMapMF: Record<string, string> = {
        aadhar_card: 'aadhar_card',
        bank_passbook: 'bank_passbook',
        photograph: 'passport_size_photograph',
        hsc_marksheet: 'hsc_marksheetresult',
        admission_letter: 'admission_letter',
        fee_receipt: 'current_year_fee_receipt',
        letterpad_certificate: 'certificate_on_college_letterpad',
        letterpad_fee_structure: 'fee_structure_on_college_letterpad',
        father_income_cert: 'fadhars_income_certificate',
        ration_card: 'ration_card',
      }

      const fieldMapMR: Record<string, string> = {
        aadhar_card: 'aadhar_card',
        bank_passbook: 'bank_passbook',
        photograph: 'passport_size_photograph',
        last_year_fee_receipt: 'last_year_fee_receipt',
        current_year_fee_receipt: 'current_year_fee_receipt',
        last_year_result: 'last_year_result__marksheet',
        letterpad_certificate: 'certificate_on_college_letterpad',
        letterpad_fee_structure: 'fee_structure_on_college_letterpad',
        father_income_cert: 'fadhars_income_certificate',
        ration_card: 'ration_card',
      }

      const fieldMap = formType === 'digital_gujarat'
        ? fieldMapDG
        : formType === 'mysy_fresh'
          ? fieldMapMF
          : fieldMapMR

      for (const field of activeFileFields) {
        const file = files[field.id]
        const erpField = fieldMap[field.id]
        if (!file || !erpField) continue
        try {
          const fileForm = new FormData()
          fileForm.append('file', file, file.name)
          fileForm.append('doctype', currentDoctype)
          fileForm.append('docname', docName)
          fileForm.append('fieldname', erpField)
          fileForm.append('is_private', '0')
          fileForm.append('folder', 'Home/Attachments')

          const uploadRes = await fetch(`${erpnextUrl}/api/method/upload_file`, {
            method: 'POST',
            headers: {
              'Authorization': `token ${apiKey}:${apiSecret}`,
              'X-Frappe-CSRF-Token': 'fetch',
            },
            body: fileForm,
          })
          const uploadResult = await uploadRes.json()
          const fileUrl = uploadResult?.message?.file_url
          if (fileUrl) {
            await fetch(`${erpnextUrl}/api/resource/${encodeURIComponent(currentDoctype)}/${encodeURIComponent(docName)}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `token ${apiKey}:${apiSecret}`,
                'X-Frappe-CSRF-Token': 'fetch',
              },
              body: JSON.stringify({ [erpField]: fileUrl }),
            })
          }
        } catch (uploadErr) {
          console.error(`Upload failed for ${field.id}:`, uploadErr)
        }
      }

      const ssForm = new FormData()
      ssForm.append('file', paymentFile, paymentFile.name)
      ssForm.append('doctype', currentDoctype)
      ssForm.append('docname', docName)
      ssForm.append('fieldname', 'upload_payment_screenshot')
      ssForm.append('is_private', '0')
      ssForm.append('folder', 'Home/Attachments')

      const ssRes = await fetch(`${erpnextUrl}/api/method/upload_file`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${apiKey}:${apiSecret}`,
          'X-Frappe-CSRF-Token': 'fetch',
        },
        body: ssForm,
      })
      const ssResult = await ssRes.json()
      const ssUrl = ssResult?.message?.file_url

      if (ssUrl) {
        await fetch(`${erpnextUrl}/api/resource/${encodeURIComponent(currentDoctype)}/${encodeURIComponent(docName)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `token ${apiKey}:${apiSecret}`,
            'X-Frappe-CSRF-Token': 'fetch',
          },
          body: JSON.stringify({ upload_payment_screenshot: ssUrl }),
        })
      }

     // Entry for Webiste admin panel
      try {
        const schemeLabel = formType === 'digital_gujarat'
          ? 'Digital Gujarat Scholarship'
          : formType === 'mysy_fresh'
            ? 'MYSY (Fresh Application)'
            : 'MYSY (Renewal)'

        let adminMessage = `Scholarship Type: ${schemeLabel}`

        if (formType === 'digital_gujarat') {
          adminMessage += `\nCollege Start Date: ${studentInfo.college_start_date}`
          adminMessage += `\nCollege End Date: ${studentInfo.college_end_date}`
          adminMessage += `\nAdmission Fee: ₹${studentInfo.admission_fee}`
          adminMessage += `\nTuition Fee: ₹${studentInfo.tuition_fee}`
          adminMessage += `\nMisc Fee: ₹${studentInfo.misc_fee || '0'}`
          adminMessage += `\nExam Fee: ₹${studentInfo.exam_fee || '0'}`
        }

        // ✅ Documents section
        const fieldLabels: Record<string, string> = formType === 'digital_gujarat' ? {
          hsc_marksheet: 'HSC Marksheet / Result *',
          ssc_marksheet: 'SSC Marksheet / Result *',
          college_results: 'College Results (Last Sem/Year) *',
          leaving_certificate: 'School Leaving Certificate (LC) *',
          aadhar_card: 'Aadhar Card *',
          bank_passbook: 'Bank Passbook *',
          caste_certificate: 'Caste Certificate *',
          photograph: 'Passport Size Photograph *',
          income_certificate: 'Income Certificate *',
          fee_receipt: 'Current Year Fee Receipt *',
          bonafide_certificate: 'College Bonafide Certificate *',
          ration_card: 'Ration Card*',
        } : formType === 'mysy_fresh' ? {
          aadhar_card: 'Aadhar Card *',
          bank_passbook: 'Bank Passbook *',
          photograph: 'Passport Size Photograph *',
          hsc_marksheet: 'HSC Marksheet / Result *',
          admission_letter: 'Admission Letter *',
          fee_receipt: 'Current Year Fee Receipt *',
          letterpad_certificate: 'Certificate on College Letterpad *',
          letterpad_fee_structure: 'Fee structure on College Letterpad *',
          father_income_cert: "Father's Income Certificate *",
          ration_card: 'Ration Card*',
        } : {
          aadhar_card: 'Aadhar Card *',
          bank_passbook: 'Bank Passbook *',
          photograph: 'Passport Size Photograph *',
          last_year_fee_receipt: 'Last Year Fee Receipt *',
          current_year_fee_receipt: 'Current Year Fee Receipt *',
          last_year_result: 'Last Year Result / Marksheet *',
          letterpad_certificate: 'Certificate on College Letterpad *',
          letterpad_fee_structure: 'Fee structure on College Letterpad *',
          father_income_cert: "Father's Income Certificate *",
          ration_card: 'Ration Card*',
        }

        adminMessage += '\n\nDocuments:'
        for (const field of activeFileFields) {
          const file = files[field.id]
          const label = fieldLabels[field.id]
          if (file && label) {
            adminMessage += `\n${label}: http://192.168.1.25:5100/files/${encodeURIComponent(file.name)}`
          }
        }

        if (ssUrl) {
          adminMessage += `\nPayment Screenshot: http://192.168.1.25:5100${ssUrl}`
        }

        await enquiriesApi.submit({
          name: studentInfo.name,
          email: studentInfo.email,
          phone: studentInfo.phone,
          enquiry_type: 'scholarship',
          message: adminMessage,
        })
      } catch (adminErr) {
        console.error('Admin panel entry failed:', adminErr)
      }
      toast.success('Application submitted successfully!')
      setSent(true)
      setShowQR(false)
      setPaymentFile(null)
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || 'Failed to complete submission.')
    } finally {
      setCompletingPayment(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-trust-950 pt-28 pb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-20" />
          <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-saffron-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="page-container relative z-10 max-w-4xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-4"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Applications Open</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl font-semibold text-white mb-4"
            >
              Scholarship Application Assistance
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-white/60 text-base sm:text-lg leading-relaxed max-w-2xl"
            >
              Devkalp provides professional verification and registration guidance for government schemes including Digital Gujarat and MYSY.
            </motion.p>
          </div>
        </section>

        {/* Content Section */}
        <div className="page-container py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-12 max-w-5xl mx-auto">

            {/* Left Side: Details & Program Description (3 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="md:col-span-3 space-y-8"
            >
              {/* Eligibility Criteria */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs">
                <h3 className="font-display text-xl font-bold text-trust-900 mb-4 flex items-center gap-2">
                  <School size={20} className="text-saffron-500" /> Eligibility Criteria
                </h3>
                <ul className="space-y-3">
                  {[
                    "MYSY: Secured 80+ percentile in 12th Board examinations.",
                    "Digital Gujarat: Resident of Gujarat pursuing degree/diploma courses.",
                    "Income Limits: Annual family income must be less than ₹6.0 Lakhs for MYSY.",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-slate-600 text-sm">
                      <Check size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* How Devkalp Helps */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs">
                <h3 className="font-display text-xl font-bold text-trust-900 mb-4 flex items-center gap-2">
                  <BookOpen size={20} className="text-saffron-500" /> How Devkalp Assists You
                </h3>
                <ul className="space-y-3">
                  {[
                    "Complete guidance checking eligibility and document requirements.",
                    "Detailed portal registration and uploading attachments without errors.",
                    "Active tracking of status and query resolution to prevent rejection."
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-slate-600 text-sm">
                      <Check size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Right Side: CTA & Quick Contact (2 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="md:col-span-2 space-y-6"
            >
              {/* Application Form Card */}
              <div className="bg-gradient-to-br from-trust-900 to-trust-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-white/5 relative overflow-hidden">
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-saffron-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="relative z-10 text-left">
                  <h3 className="font-display text-xl font-bold mb-3">Apply for Assistance</h3>
                  <p className="text-xs text-white/70 leading-relaxed mb-6">
                    Fill out our online submission form below, attach the required documents, and our coordinators will verify your application. (Note: A processing fee of ₹{APPLICATION_FEE} applies).
                  </p>
                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        toast.error('Please log in to apply for scholarship assistance.')
                        navigate('/auth/login?redirect=/scholarship')
                      } else {
                        document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' })
                      }
                    }}
                    className="w-full justify-center px-6 py-3.5 bg-saffron-400 hover:bg-saffron-300 text-trust-950 font-bold rounded-xl text-sm transition-all duration-300 shadow-md flex items-center justify-center gap-1.5 hover:scale-[1.01]"
                  >
                    Apply Online Below <ExternalLink size={14} />
                  </button>
                </div>
              </div>

              {/* Support Info Card */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100/50">
                    <Mail size={18} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Scholarship Support</p>
                    <a href="mailto:devkalp986@gmail.com" className="text-xs font-semibold text-trust-700 hover:underline">devkalp986@gmail.com</a>
                  </div>
                </div>

                <div className="bg-saffron-50 border border-saffron-100 rounded-2xl p-4 flex gap-2">
                  <Info size={16} className="text-saffron-600 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <strong>Notice:</strong> There is a minimal fee of ₹{APPLICATION_FEE} to apply for scholarship support.
                  </p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Online Application Assistant Section */}
        <section id="apply-form" className="bg-white border-t border-slate-100 py-16 scroll-mt-10">
          <div className="page-container max-w-4xl px-4 sm:px-6 lg:px-8">
            {!isLoggedIn ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-card max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-trust-50 flex items-center justify-center mx-auto mb-4 border border-trust-100">
                  <BookOpen size={28} className="text-trust-600" />
                </div>
                <h2 className="font-display text-2xl text-trust-900 mb-2">Login Required</h2>
                <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed mb-6">
                  You must be logged in to your Devkalp account to request scholarship application assistance.
                </p>
                <Button
                  onClick={() => navigate('/auth/login?redirect=/scholarship')}
                  className="px-8 py-3 mx-auto"
                >
                  Log In to Apply
                </Button>
              </div>
            ) : sent ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-card max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-sage-100 flex items-center justify-center mx-auto mb-4">
                  <Send size={28} className="text-sage-600" />
                </div>
                <h2 className="font-display text-2xl text-trust-900 mb-2">Request Submitted!</h2>
                <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                  Thank you for submitting your scholarship documents. Our verification coordinators will review them and get back to you shortly.
                </p>
                <button
                  onClick={() => {
                    setSent(false)
                    setStudentInfo({
                      name: '', email: '', phone: '', college_start_date: '', college_end_date: '',
                      admission_fee: '', tuition_fee: '', misc_fee: '', exam_fee: ''
                    })
                    setFiles({})
                  }}
                  className="mt-6 text-sm text-trust-600 hover:underline"
                >
                  Submit another application
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-trust-50 to-saffron-50/20 rounded-3xl border border-trust-100 p-6 sm:p-10 shadow-card text-left">
                <div className="mb-8">
                  <h2 className="font-display text-2xl font-bold text-trust-900">Scholarship Application Assistant</h2>
                  <p className="text-slate-400 text-xs mt-1">Select your scholarship scheme, fill in your info, and attach your document scans.</p>
                </div>

                {/* Scheme Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { value: 'digital_gujarat', label: 'Digital Gujarat' },
                    { value: 'mysy_fresh', label: 'MYSY (Fresh)' },
                    { value: 'mysy_renew', label: 'MYSY (Renewal) (1st & 2nd year)' },
                  ].map(tab => (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => {
                        setFormType(tab.value as any)
                        setFiles({})
                      }}
                      className={clsx(
                        'px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-colors',
                        formType === tab.value
                          ? 'bg-trust-800 text-white border-trust-800'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-trust-300'
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Student Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="label">Full Name *</label>
                      <input required className="input text-sm" placeholder="Student name" value={studentInfo.name} onChange={e => setStudentInfo(s => ({ ...s, name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Email Address *</label>
                      <input required type="email" className="input text-sm" placeholder="student@email.com" value={studentInfo.email} onChange={e => setStudentInfo(s => ({ ...s, email: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Phone Number *</label>
                      <input required type="tel" className="input text-sm" placeholder="e.g. +91 9876543210" value={studentInfo.phone} onChange={e => setStudentInfo(s => ({ ...s, phone: e.target.value }))} />
                    </div>
                  </div>

                  {/* Digital Gujarat Specific Date/Fee Fields */}
                  {formType === 'digital_gujarat' && (
                    <div className="space-y-4 border-t border-slate-200/60 pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="label">College Term Start Date *</label>
                          <input required type="date" className="input text-sm" value={studentInfo.college_start_date} onChange={e => setStudentInfo(s => ({ ...s, college_start_date: e.target.value }))} />
                        </div>
                        <div>
                          <label className="label">College Term End Date *</label>
                          <input required type="date" className="input text-sm" value={studentInfo.college_end_date} onChange={e => setStudentInfo(s => ({ ...s, college_end_date: e.target.value }))} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="label">Admission Fee * (₹)</label>
                          <input required type="number" min="0" className="input text-sm" placeholder="e.g. 5000" value={studentInfo.admission_fee} onChange={e => setStudentInfo(s => ({ ...s, admission_fee: e.target.value }))} />
                        </div>
                        <div>
                          <label className="label">Tuition Fee * (₹)</label>
                          <input required type="number" min="0" className="input text-sm" placeholder="e.g. 25000" value={studentInfo.tuition_fee} onChange={e => setStudentInfo(s => ({ ...s, tuition_fee: e.target.value }))} />
                        </div>
                        <div>
                          <label className="label">Misc Fee (₹)</label>
                          <input type="number" min="0" className="input text-sm" placeholder="e.g. 1500" value={studentInfo.misc_fee} onChange={e => setStudentInfo(s => ({ ...s, misc_fee: e.target.value }))} />
                        </div>
                        <div>
                          <label className="label">Exam Fee (₹)</label>
                          <input type="number" min="0" className="input text-sm" placeholder="e.g. 2000" value={studentInfo.exam_fee} onChange={e => setStudentInfo(s => ({ ...s, exam_fee: e.target.value }))} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Document Scans Upload Grid */}
                  <div className="border-t border-slate-200/60 pt-4">
                    <label className="label mb-3 block font-extrabold uppercase text-[10px] text-slate-400 tracking-wider">Required Document Uploads *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeFileFields.map(field => {
                        const hasFile = !!files[field.id];
                        return (
                          <div key={field.id} className="relative border border-slate-200 rounded-xl p-3.5 bg-white hover:border-trust-300 transition-colors flex items-center justify-between gap-3 overflow-hidden">
                            <input
                              type="file"
                              required
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={e => {
                                const file = e.target.files?.[0] || null;
                                if (file && file.size > 10 * 1024 * 1024) {
                                  toast.error('File size must be under 10MB');
                                  return;
                                }
                                setFiles(prev => ({ ...prev, [field.id]: file }));
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-700 truncate">{field.label}</p>
                              {hasFile ? (
                                <p className="text-[10px] font-bold text-emerald-600 truncate">
                                  ✓ Selected: {files[field.id]!.name} ({(files[field.id]!.size / 1024 / 1024).toFixed(2)} MB)
                                </p>
                              ) : (
                                <p className="text-[10px] text-slate-400">Click to upload document (PDF, JPG, PNG)</p>
                              )}
                            </div>
                            <div className={clsx(
                              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                              hasFile ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-slate-50 border-slate-200 text-slate-400"
                            )}>
                              <Upload size={14} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Submission Buttons */}
                  <Button type="submit" loading={submitting} className="w-full justify-center mt-4" size="lg">
                    <Send size={16} /> {submitting ? 'Uploading & Submitting...' : 'Submit Application Details'}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </section>
      </main>

      {showQR && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowQR(false)}>
          <div className="bg-white rounded-3xl shadow-float w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 text-center">
              <p className="font-accent italic text-saffron-600 text-sm mb-1">Step 2: Scan & Pay</p>
              <h2 className="font-display text-2xl text-trust-900">Application Fee</h2>
            </div>
            <div className="p-6 flex flex-col items-center text-center space-y-5">
              <p className="text-slate-600 text-sm">
                Please scan the QR code using GPay, PhonePe, Paytm, or any UPI app to complete your scholarship application fee of <strong className="text-trust-800">₹{APPLICATION_FEE}</strong>.
              </p>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center">
                <img src="/donation_qr.jpg" alt="UPI QR Code" className="w-[200px] h-[200px] object-contain" />
              </div>

              {/* Payment Screenshot Uploader */}
              <div className="w-full text-left space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Upload Payment Screenshot *</label>
                <div className="relative border border-dashed border-slate-300 hover:border-trust-400 rounded-xl p-3.5 bg-slate-50 hover:bg-slate-100/50 transition-colors flex items-center justify-between gap-3 overflow-hidden">
                  <input
                    type="file"
                    required
                    accept="image/*,.pdf"
                    disabled={completingPayment}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={e => {
                      const file = e.target.files?.[0] || null;
                      if (file && file.size > 10 * 1024 * 1024) {
                        toast.error('File size must be under 10MB');
                        return;
                      }
                      setPaymentFile(file);
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    {paymentFile ? (
                      <p className="text-xs font-bold text-emerald-600 truncate">
                        ✓ Selected: {paymentFile.name} ({(paymentFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 font-semibold truncate">Select transaction screenshot (JPG, PNG, PDF)</p>
                    )}
                  </div>
                  <div className={clsx(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                    paymentFile ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-slate-100 border-slate-200 text-slate-400"
                  )}>
                    <Upload size={14} />
                  </div>
                </div>
              </div>

              <div className="w-full pt-4 space-y-2.5">
                <Button onClick={handlePaymentComplete} loading={completingPayment} className="w-full justify-center" size="lg">
                  I have completed the payment
                </Button>
                <button onClick={() => setShowQR(false)} disabled={completingPayment} className="w-full text-slate-500 hover:text-slate-700 text-sm font-semibold py-2">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

=======
=======
>>>>>>> b04bab009f1c4adf64d70a782f2f69baa641450a
import React from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, ArrowRight, BookOpen, School, Award, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const FUTURE_FEATURES = [
  {
    icon: <School size={20} className="text-saffron-500" />,
    title: 'Tuition Fee Support',
    desc: 'Direct financial assistance covering school, college, and vocational program fees.'
  },
  {
    icon: <Award size={20} className="text-saffron-500" />,
    title: 'Merit Recognition',
    desc: 'Additional rewards and support for outstanding academic achievements.'
  },
  {
    icon: <BookOpen size={20} className="text-saffron-500" />,
    title: 'Mentorship & Guidance',
    desc: 'Connecting scholarship recipients with professional mentors for career preparation.'
  }
]

export default function ScholarshipPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="page-container max-w-4xl">
          
          {/* Main Card */}
          <div className="bg-[#0a1128] text-white rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl relative overflow-hidden">
            
            {/* Background lighting orbs */}
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-saffron-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-trust-500/15 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              
              {/* Badge */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-saffron-500/15 border border-saffron-500/30 rounded-full mb-6"
              >
                <span className="w-2 h-2 rounded-full bg-saffron-400 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-saffron-300">Coming Soon</span>
              </motion.div>

              {/* Icon */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-saffron-400 mb-6 shadow-inner"
              >
                <GraduationCap size={36} />
              </motion.div>

              {/* Title */}
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mb-4"
              >
                Devkalp Scholarship Program
              </motion.h1>

              {/* Description */}
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed mb-10"
              >
                We are currently building our merit-cum-means scholarship fund to empower students from lower-income backgrounds, helping them access quality higher education and vocational training in Surat, Gujarat and beyond.
              </motion.p>

              {/* Focus Pillars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left mt-4 border-t border-white/10 pt-8 mb-10">
                {FUTURE_FEATURES.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                    className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col gap-3 shadow-md"
                  >
                    <div className="w-9 h-9 rounded-lg bg-saffron-500/10 flex items-center justify-center shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">{feature.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA Section */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 items-center"
              >
                <Link 
                  to="/contact" 
                  className="px-6 py-3 bg-saffron-400 hover:bg-saffron-300 text-trust-950 font-bold rounded-xl text-sm transition-all duration-300 shadow-lg hover:shadow-saffron-400/20 inline-flex items-center gap-1.5"
                >
                  <Mail size={16} /> Contact to Stay Updated <ArrowRight size={14} />
                </Link>
                <Link 
                  to="/" 
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl text-sm border border-white/10 transition-colors"
                >
                  Return Home
                </Link>
              </motion.div>

            </div>
          </div>

        </div>
      </main>

<<<<<<< HEAD
>>>>>>> b04bab009f1c4adf64d70a782f2f69baa641450a
=======
>>>>>>> b04bab009f1c4adf64d70a782f2f69baa641450a
      <Footer />
    </div>
  )
}
