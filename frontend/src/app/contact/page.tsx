import { useState, useEffect } from 'react'
import { Mail, Phone, MapPin, Send, HeartHandshake, HandHeart, Users, Briefcase, Upload } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui'
import toast from 'react-hot-toast'
import { enquiriesApi, jobsApi } from '@/lib/api'

const ENQUIRY_TYPES = [
  { value: 'matrimony', label: 'Matrimony Services', icon: <HeartHandshake size={16} /> },
  { value: 'donation', label: 'Donation / Partnership', icon: <HandHeart size={16} /> },
  { value: 'volunteer', label: 'Volunteer Registration', icon: <Users size={16} /> },
  { value: 'careers', label: 'Career Opportunities', icon: <Briefcase size={16} /> },
  { value: 'recruitment', label: 'Employer Recruitment', icon: <Briefcase size={16} /> },
  { value: 'general', label: 'General Enquiry', icon: <Mail size={16} /> },
]

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    enquiry_type: 'general',
    message: '',
    desired_job_title: '',
    department: 'Health Programs',
    experience_years: 0,
    expected_salary: '',
    skills: '',
    company_name: '',
    contact_person: '',
    recruitment_job_title: '',
    recruitment_job_location: '',
    recruitment_job_type: 'full-time',
    recruitment_salary_range: '',
    recruitment_description: '',
    recruitment_requirements: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const type = params.get('type')
      const jobTitle = params.get('job_title')
      const dept = params.get('department')

      setForm(f => {
        const next = { ...f }
        if (type && ['matrimony', 'donation', 'volunteer', 'careers', 'recruitment', 'general'].includes(type)) {
          next.enquiry_type = type
        }
        if (jobTitle) {
          next.desired_job_title = jobTitle
        }
        if (dept) {
          next.department = dept
        }
        return next
      })
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (form.enquiry_type === 'careers') {
      if (!form.name || !form.email || !form.phone || !form.desired_job_title) {
        toast.error('Please fill in all required fields')
        return
      }
      setSending(true)
      try {
        // const erpnextUrl = 'http://dellerp.com:8000'
        // const apiKey = '27f43d4573046e6'
        // const apiSecret = '1aa5e455a212d9c'
        const erpnextUrl = 'http://192.168.1.25:5100'
        const apiKey = '9ff88d537c92809'
        const apiSecret = '31a275388bce201'

        const payload: Record<string, any> = {
          doctype: 'Job Applicant',
          applicant_name: form.name,
          email_id: form.email,
          phone_number: form.phone,
          designation: form.department,
          // job_title: formData.desired_job_title, 
          custom_experience: Number(form.experience_years),
          cover_letter: form.message,
          custom_key_skills: form.skills,
          status: 'Open',
        }

        if (form.expected_salary) {
          payload.custom_expected_salary = parseFloat(form.expected_salary)
        }

        const response = await fetch(`${erpnextUrl}/api/resource/Job Applicant`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `token ${apiKey}:${apiSecret}`,
            'X-Frappe-CSRF-Token': 'fetch',
          },
          body: JSON.stringify(payload),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result?.exception || 'ERPNext error')
        }

        const docName = result?.data?.name

        if (file && docName) {
          try {
            const fileForm = new FormData()
            fileForm.append('file', file, file.name)
            fileForm.append('doctype', 'Job Applicant')
            fileForm.append('docname', docName)
            fileForm.append('fieldname', 'resume_attachment')
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
              await fetch(`${erpnextUrl}/api/resource/Job Applicant/${encodeURIComponent(docName)}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `token ${apiKey}:${apiSecret}`,
                  'X-Frappe-CSRF-Token': 'fetch',
                },
                body: JSON.stringify({
                  resume_attachment: fileUrl,
                }),
              })
            }
          } catch (uploadErr) {
            console.error('Resume upload error:', uploadErr)
          }
        }

        setSent(true)
        toast.success('Your application has been submitted successfully!')
      } catch (err: any) {
        console.error(err)
        toast.error(err?.message || 'Failed to submit application')
      } finally {
        setSending(false)
      }
    } else if (form.enquiry_type === 'recruitment') {
      if (!form.company_name || !form.contact_person || !form.email || !form.phone || !form.recruitment_job_title || !form.recruitment_job_location || !form.recruitment_description || !form.recruitment_requirements) {
        toast.error('Please fill in all required fields')
        return
      }
      setSending(true)
      try {
        await enquiriesApi.submit({
          name: `${form.contact_person} (${form.company_name})`,
          email: form.email,
          phone: form.phone,
          enquiry_type: form.enquiry_type,
          message: `Company Name: ${form.company_name}\nContact Person: ${form.contact_person}\nJob Title: ${form.recruitment_job_title}\nLocation: ${form.recruitment_job_location}\nJob Type: ${form.recruitment_job_type}\nSalary/Compensation: ${form.recruitment_salary_range || 'Not Specified'}\n\nJob Description:\n${form.recruitment_description}\n\nJob Requirements:\n${form.recruitment_requirements}`,
        })
        setSent(true)
        toast.success('Your recruitment posting request has been submitted successfully!')
      } catch (err: any) {
        toast.error(err?.response?.data?.detail || 'Failed to submit recruitment details')
      } finally {
        setSending(false)
      }
    } else {
      if (!form.name || !form.email || !form.message) {
        toast.error('Please fill all required fields')
        return
      }
      setSending(true)
      try {
        await enquiriesApi.submit({
          name: form.name,
          email: form.email,
          phone: form.phone,
          enquiry_type: form.enquiry_type,
          message: form.message,
        })
        setSent(true)
        toast.success("Message sent! We'll get back to you within 24 hours.")
      } catch {
        toast.error('Failed to send message. Please try again.')
      } finally {
        setSending(false)
      }
    }
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />

      {/* Hero */}
      <section className="bg-trust-950 pt-28 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-20" />
        <div className="page-container relative z-10 max-w-2xl">
          <p className="font-accent italic text-saffron-300 text-lg mb-2">We're Here</p>
          <h1 className="font-display text-5xl font-semibold text-white mb-4">Let's Talk</h1>
          <p className="text-white/60 text-lg leading-relaxed">
            Whether you have a question, need guidance, or simply want to connect — reach out.
            A real person will respond.
          </p>
        </div>
      </section>

      <div className="page-container py-16">
        <div className="grid md:grid-cols-5 gap-12">

          {/* Contact Info */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <p className="font-accent italic text-saffron-600 text-lg mb-4">Reach Us Directly</p>
              <div className="space-y-4">
                {[
                  { icon: <Mail size={18} className="text-trust-600" />, label: 'Email', value: 'devkalp986@gmail.com', href: 'mailto:devkalp986@gmail.com' },
                  { icon: <Phone size={18} className="text-trust-600" />, label: 'Phone', value: '+91 91040 98600', href: 'tel:+91 91040 98600' },
                  { icon: <MapPin size={18} className="text-trust-600" />, label: 'Address', value: 'Surat, Gujarat, India', href: null },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-trust-50 flex items-center justify-center shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="text-sm font-medium text-slate-800 hover:text-trust-700 transition-colors">{item.value}</a>
                      ) : (
                        <p className="text-sm font-medium text-slate-800">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-trust-50 to-saffron-50 border border-trust-100 rounded-2xl p-5">
              <p className="font-semibold text-trust-800 text-sm mb-2">Response Time</p>
              <p className="text-slate-600 text-sm leading-relaxed">
                We respond to all enquiries within <strong>24 hours</strong> on working days.
                For urgent matters, please call directly.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Department Contacts</p>
              {[
                { dept: 'Matrimony Counseling', email: 'devkalp986@gmail.com' },
                { dept: 'Donations & Partnerships', email: 'devkalp986@gmail.com' },
                { dept: 'HR & Recruiters', email: 'devkalp986@gmail.com' },
              ].map(d => (
                <div key={d.dept} className="p-3 bg-white border border-slate-100 rounded-xl">
                   <p className="text-xs font-medium text-slate-700">{d.dept}</p>
                  <a href={`mailto:${d.email}`} className="text-xs text-trust-600 hover:underline">{d.email}</a>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-3">
            {sent ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-card">
                <div className="w-16 h-16 rounded-2xl bg-sage-100 flex items-center justify-center mx-auto mb-4">
                  <Send size={28} className="text-sage-600" />
                </div>
                <h2 className="font-display text-2xl text-trust-900 mb-2">
                  {form.enquiry_type === 'careers'
                    ? 'Application Submitted!'
                    : form.enquiry_type === 'recruitment'
                    ? 'Recruitment Request Sent!'
                    : 'Message Sent!'}
                </h2>
                <p className="text-slate-500 max-w-xs mx-auto">
                  {form.enquiry_type === 'careers'
                    ? 'Thank you for applying. Our HR team will evaluate your profile and get back to you shortly.'
                    : form.enquiry_type === 'recruitment'
                    ? 'Thank you for submitting your recruitment needs. Our partnerships team will review the details and contact you shortly.'
                    : "Thank you for reaching out. Our team will respond within 24 hours."}
                </p>
                <button
                  onClick={() => {
                    setSent(false)
                    setForm({
                      name: '',
                      email: '',
                      phone: '',
                      enquiry_type: 'general',
                      message: '',
                      desired_job_title: '',
                      department: 'Health Programs',
                      experience_years: 0,
                      expected_salary: '',
                      skills: '',
                      company_name: '',
                      contact_person: '',
                      recruitment_job_title: '',
                      recruitment_job_location: '',
                      recruitment_job_type: 'full-time',
                      recruitment_salary_range: '',
                      recruitment_description: '',
                      recruitment_requirements: '',
                    })
                    setFile(null)
                  }}
                  className="mt-6 text-sm text-trust-600 hover:underline"
                >
                  {form.enquiry_type === 'careers'
                    ? 'Submit another application'
                    : form.enquiry_type === 'recruitment'
                    ? 'Post another job availability'
                    : 'Send another message'}
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-card">
                <h2 className="font-display text-2xl text-trust-900 mb-6 flex items-center gap-2">
                  {form.enquiry_type === 'careers' ? (
                    <>
                      <Briefcase size={22} className="text-trust-800" /> General Application
                    </>
                  ) : form.enquiry_type === 'recruitment' ? (
                    <>
                      <Briefcase size={22} className="text-trust-800" /> Post Job Availability
                    </>
                  ) : (
                    'Send a Message'
                  )}
                </h2>
                {form.enquiry_type === 'careers' && (
                  <p className="text-slate-400 text-xs -mt-4 mb-6">Tell us what you're looking for and upload your resume.</p>
                )}
                {form.enquiry_type === 'recruitment' && (
                  <p className="text-slate-400 text-xs -mt-4 mb-6">Submit details about your company and recruitment needs.</p>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Enquiry Type */}
                  <div>
                    <label className="label">What is this about?</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {ENQUIRY_TYPES.map(t => (
                        <button key={t.value} type="button" onClick={() => setForm(f => ({ ...f, enquiry_type: t.value }))}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all ${form.enquiry_type === t.value
                            ? 'border-trust-400 bg-trust-50 text-trust-800 font-medium'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}>
                          {t.icon} {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {form.enquiry_type === 'careers' ? (
                    <>
                      {/* Careers specific fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="label">Full Name *</label>
                          <input required className="input text-sm" placeholder="John Doe" value={form.name} onChange={set('name')} />
                        </div>
                        <div>
                          <label className="label">Email *</label>
                          <input required type="email" className="input text-sm" placeholder="john@example.com" value={form.email} onChange={set('email')} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="label">Phone Number *</label>
                          <input required type="tel" className="input text-sm" placeholder="e.g. +91 9876543210" value={form.phone} onChange={set('phone')} />
                        </div>
                        <div>
                          <label className="label">Desired Job Title *</label>
                          <input required className="input text-sm" placeholder="e.g. Full Stack Developer" value={form.desired_job_title} onChange={set('desired_job_title')} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="label">Department</label>
                          <select className="input text-sm w-full bg-white border border-slate-200 rounded-xl p-2.5" value={form.department} onChange={set('department')}>
                            {Array.from(new Set([
                              'Health Programs', 'Education Programs', 'Grassroots Dev', 'Administration', 'IT Support', 'Social Work', 'Other',
                              ...(form.department ? [form.department] : [])
                            ])).map(dep => (
                              <option key={dep} value={dep}>{dep}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="label">Experience (Years)</label>
                          <input type="number" min="0" className="input text-sm" value={form.experience_years} onChange={e => setForm(d => ({ ...d, experience_years: parseInt(e.target.value) || 0 }))} />
                        </div>
                        <div>
                          <label className="label">Expected Salary (₹/MO)</label>
                          <input type="number" min="0" className="input text-sm" placeholder="Optional" value={form.expected_salary} onChange={set('expected_salary')} />
                        </div>
                      </div>

                      <div>
                        <label className="label">Key Skills / Area of Expertise</label>
                        <input className="input text-sm" placeholder="e.g. React, public health outreach, team coordination" value={form.skills} onChange={set('skills')} />
                      </div>

                      <div>
                        <label className="label">Resume / CV (PDF, DOC, JPEG, PNG) *</label>
                        <div className="border-2 border-dashed border-slate-200 hover:border-trust-500 transition-colors rounded-2xl p-6 text-center relative cursor-pointer bg-slate-50/50">
                          <input type="file" required accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFile(e.target.files?.[0] || null)} />
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="w-10 h-10 rounded-full bg-trust-50 text-trust-800 flex items-center justify-center mx-auto">
                              <Upload size={18} className="text-trust-600" />
                            </div>
                            {file ? (
                              <p className="text-xs font-bold text-trust-900">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
                            ) : (
                              <>
                                <p className="text-xs font-bold text-slate-700">Click to upload or drag & drop</p>
                                <p className="text-[10px] text-slate-400">PDF, DOC, DOCX, JPEG, PNG up to 10MB</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="label">Brief Statement / Job Criteria Notes</label>
                        <textarea className="input resize-none text-sm" rows={4} placeholder="Describe your ideal role, availability, and how you wish to contribute..." value={form.message} onChange={set('message')} />
                      </div>
                    </>
                  ) : form.enquiry_type === 'recruitment' ? (
                    <>
                      {/* Employer Recruitment specific fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="label">Company Name *</label>
                          <input required className="input text-sm" placeholder="e.g. Acme Corp" value={form.company_name} onChange={set('company_name')} />
                        </div>
                        <div>
                          <label className="label">Contact Person Name *</label>
                          <input required className="input text-sm" placeholder="e.g. Jane Smith" value={form.contact_person} onChange={set('contact_person')} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="label">Email Address *</label>
                          <input required type="email" className="input text-sm" placeholder="hr@company.com" value={form.email} onChange={set('email')} />
                        </div>
                        <div>
                          <label className="label">Phone Number *</label>
                          <input required type="tel" className="input text-sm" placeholder="e.g. +91 9876543210" value={form.phone} onChange={set('phone')} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="label">Job Title *</label>
                          <input required className="input text-sm" placeholder="e.g. Assistant Project Coordinator" value={form.recruitment_job_title} onChange={set('recruitment_job_title')} />
                        </div>
                        <div>
                          <label className="label">Job Type</label>
                          <select className="input text-sm w-full bg-white border border-slate-200 rounded-xl p-2.5" value={form.recruitment_job_type} onChange={set('recruitment_job_type')}>
                            {['full-time', 'part-time', 'contract', 'internship'].map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="label">Job Location *</label>
                          <input required className="input text-sm" placeholder="e.g. Surat, Gujarat (or Remote)" value={form.recruitment_job_location} onChange={set('recruitment_job_location')} />
                        </div>
                        <div>
                          <label className="label">Salary Range / Compensation</label>
                          <input className="input text-sm" placeholder="e.g. ₹25,000 - ₹35,000 / month" value={form.recruitment_salary_range} onChange={set('recruitment_salary_range')} />
                        </div>
                      </div>

                      <div>
                        <label className="label">Job Description *</label>
                        <textarea required className="input resize-none text-sm" rows={4} placeholder="Describe the role, responsibilities, and impact..." value={form.recruitment_description} onChange={set('recruitment_description')} />
                      </div>

                      <div>
                        <label className="label">Requirements / Qualifications *</label>
                        <textarea required className="input resize-none text-sm" rows={4} placeholder="Describe the education, experience, and skills required..." value={form.recruitment_requirements} onChange={set('recruitment_requirements')} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="label">Full Name *</label>
                          <input required className="input text-sm" placeholder="Your name" value={form.name} onChange={set('name')} />
                        </div>
                        <div>
                          <label className="label">Phone</label>
                          <input className="input text-sm" placeholder="+91 98765..." value={form.phone} onChange={set('phone')} />
                        </div>
                      </div>

                      <div>
                        <label className="label">Email Address *</label>
                        <input required type="email" className="input text-sm" placeholder="you@example.com" value={form.email} onChange={set('email')} />
                      </div>

                      <div>
                        <label className="label">Your Message *</label>
                        <textarea required className="input resize-none text-sm" rows={5} placeholder="Tell us how we can help you..." value={form.message} onChange={set('message')} />
                      </div>
                    </>
                  )}

                  <Button type="submit" loading={sending} className="w-full justify-center" size="lg">
                    {form.enquiry_type === 'careers' ? (
                      <>
                        <Send size={16} /> Submit Application
                      </>
                    ) : form.enquiry_type === 'recruitment' ? (
                      <>
                        <Send size={16} /> Submit Recruitment Request
                      </>
                    ) : (
                      <>
                        <Send size={16} /> Send Message
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-slate-400 text-center">
                    Your information is kept strictly confidential and used only to respond to your enquiry.
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
