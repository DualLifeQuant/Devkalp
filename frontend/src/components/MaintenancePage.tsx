export default function MaintenancePage({ message }: { message?: string | null }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf8] px-6">
      <div className="max-w-md text-center">
        <img
          src="/devkalp-logo-removebg-preview.png"
          alt="Devkalp Foundation"
          className="w-16 h-16 mx-auto mb-6 animate-float-gentle"
        />
        <h1 className="font-display text-3xl text-trust-900 mb-3">We'll be right back</h1>
        <p className="font-body text-gray-600 leading-relaxed">
          {message || "We're performing some scheduled maintenance. Please check back shortly."}
        </p>
      </div>
    </div>
  );
}
