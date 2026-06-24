import { Link } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function EightyGPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />
      <div className="pt-28 pb-20 page-container max-w-3xl">
        <div className="mt-6 mb-10">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Tax Benefits</p>
          <h1 className="font-display text-4xl text-trust-900 mb-3">80G Tax Exemption</h1>
          <p className="text-slate-500">Donations to Devkalp Foundation are eligible for tax deduction.</p>
        </div>

        <div className="space-y-5">
          <div className="bg-saffron-50 border border-saffron-200 rounded-2xl p-6">
            <h2 className="font-display text-xl text-trust-900 mb-2">What is Section 80G?</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Section 80G of the Income Tax Act, 1961 allows donors to claim deductions on donations made to registered charitable organisations. Devkalp Foundation is registered under this provision, meaning your donations qualify for tax deduction.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
            {[
              { title: 'Deduction Amount', body: 'Donations to Devkalp Foundation qualify for 50% deduction of the donated amount, subject to the qualifying limit of 10% of Adjusted Gross Total Income.' },
              { title: 'How to Claim', body: 'After your donation is completed, an official receipt is automatically generated and sent to your email. This receipt contains our registration details and PAN. Mention the donation amount and our PAN in your ITR filing under Section 80G.' },
              { title: 'PAN Requirement', body: 'To generate a valid 80G receipt, donors must provide their PAN number at the time of donation. You can add your PAN in the donation form or update it in your donor profile.' },
              { title: 'Our Registration', body: 'Devkalp Foundation is a registered charitable organisation under the Societies Registration Act. Our FCRA and 80G registration certificates are available for verification upon request.' },
            ].map((item, i, arr) => (
              <div key={item.title} className={`p-7 ${i < arr.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <h3 className="font-display text-lg text-trust-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="bg-trust-50 border border-trust-100 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="flex-1">
              <p className="font-semibold text-trust-800 mb-1">Need your donation receipt?</p>
              <p className="text-sm text-slate-600">Receipts are sent automatically to your email after each donation. If you haven't received it, check your spam folder or contact us.</p>
            </div>
            <Link to="/contact"
              className="shrink-0 px-6 py-3 bg-trust-800 text-white text-sm font-medium rounded-xl hover:bg-trust-700 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
