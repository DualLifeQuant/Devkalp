import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const SECTIONS = [
  {
    title: 'Acceptance of Terms',
    body: 'By creating an account or using any service offered by Devkalp Foundation, you agree to these Terms of Use. If you do not agree, please do not use our platform.',
  },
  {
    title: 'Eligibility',
    body: 'Our services are available to individuals aged 18 and above. Matrimony services are available to Indian residents and the Indian diaspora. By registering, you confirm that all information provided is accurate and truthful.',
  },
  {
    title: 'Matrimony Services',
    body: 'The matrimony service is a private, counselor-facilitated matchmaking program. It is not a dating service. Profiles are reviewed and approved by our team before activation. Any misrepresentation of identity, age, marital status, or other profile information may result in immediate suspension.',
  },
  {
    title: 'Donations',
    body: 'All donations made through our platform are voluntary and non-refundable except in cases of processing errors. Donation receipts are generated automatically and are valid for Section 80G tax deduction subject to applicable laws. We reserve the right to allocate donations to the most relevant campaign if a specific campaign is closed.',
  },
  {
    title: 'User Conduct',
    body: 'Users must not misuse the platform, harass other users, upload false information, or attempt to contact matches directly without going through our counseling process. Any violation may result in account suspension without notice.',
  },
  {
    title: 'Intellectual Property',
    body: 'All content, branding, and materials on this platform are the property of Devkalp Foundation. You may not reproduce, distribute, or use our content without written permission.',
  },
  {
    title: 'Limitation of Liability',
    body: 'Devkalp Foundation provides matchmaking guidance and does not guarantee outcomes. We are not responsible for decisions made between parties after introductions are facilitated. Users engage in all post-introduction communication at their own discretion.',
  },
  {
    title: 'Governing Law',
    body: 'These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Surat, Gujarat.',
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />
      <div className="pt-28 pb-20 page-container max-w-3xl">
        <div className="mt-6 mb-10">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Legal</p>
          <h1 className="font-display text-4xl text-trust-900 mb-3">Terms of Use</h1>
          <p className="text-slate-500">Last updated: January 2024</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
          {SECTIONS.map((section, i) => (
            <div key={section.title} className={`p-7 ${i < SECTIONS.length - 1 ? 'border-b border-slate-100' : ''}`}>
              <h2 className="font-display text-xl text-trust-900 mb-3">{section.title}</h2>
              <p className="text-slate-600 leading-relaxed text-sm">{section.body}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-slate-400 mt-8">
          Questions? Write to us at <a href="mailto:legal@devkalpfoundation.org" className="text-trust-600 hover:underline">legal@devkalpfoundation.org</a>
        </p>
      </div>
      <Footer />
    </div>
  )
}
