import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const SECTIONS = [
  {
    title: 'Information We Collect',
    body: `We collect information you provide directly when you register, create a profile, make a donation, or contact us. This includes your name, email, phone number, and any profile details you choose to share. For matrimony users, we collect additional personal and family information to facilitate our counseling-led matchmaking service.`,
  },
  {
    title: 'How We Use Your Information',
    body: `Your information is used solely to provide and improve our services — matching matrimony profiles, processing donations, scheduling campaign sessions, and managing job applications. We do not sell, rent, or share your personal information with third parties for commercial purposes.`,
  },
  {
    title: 'Data Security',
    body: `We implement industry-standard security measures including encrypted data storage, secure API communications (HTTPS), and role-based access controls. Sensitive documents such as ID proofs are stored on secure cloud infrastructure with access limited to authorised administrators only.`,
  },
  {
    title: 'Matrimony Profile Privacy',
    body: `Matrimony profiles are strictly private. They are never publicly searchable or visible to other members. Profiles are reviewed only by our admin team and assigned counselors. Match suggestions are made manually by our team — no automated matching or public browsing is permitted.`,
  },
  {
    title: 'Cookies',
    body: `We use minimal cookies to maintain your login session. We do not use tracking or advertising cookies. You may disable cookies in your browser settings, though this may affect platform functionality.`,
  },
  {
    title: 'Your Rights',
    body: `You have the right to access, correct, or delete your personal data at any time. To exercise these rights, contact us at privacy@devkalpfoundation.org. We will respond within 7 working days.`,
  },
  {
    title: 'Contact',
    body: `For any privacy-related queries, write to us at privacy@devkalpfoundation.org or call +91 98765 43210.`,
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />
      <div className="pt-28 pb-20 page-container max-w-3xl">
        <div className="mt-6 mb-10">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Legal</p>
          <h1 className="font-display text-4xl text-trust-900 mb-3">Privacy Policy</h1>
          <p className="text-slate-500">Last updated: January 2024</p>
        </div>

        <div className="bg-trust-50 border border-trust-100 rounded-2xl p-5 mb-8">
          <p className="text-sm text-trust-800 leading-relaxed">
            At Devkalp Foundation, your privacy is not a compliance checkbox — it is a core value. We handle your personal information with the same care and discretion we bring to every aspect of our work.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
          {SECTIONS.map((section, i) => (
            <div key={section.title} className={`p-7 ${i < SECTIONS.length - 1 ? 'border-b border-slate-100' : ''}`}>
              <h2 className="font-display text-xl text-trust-900 mb-3">{section.title}</h2>
              <p className="text-slate-600 leading-relaxed text-sm">{section.body}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
