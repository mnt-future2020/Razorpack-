"use client";

import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">{/* Hero Section */}
      <section
        className="relative h-96 md:h-[500px] bg-cover bg-center"
        style={{
          backgroundImage: "url(/images/policy//privacy-policy-hero.jpg)",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-center">
          <nav className="flex items-center gap-2 text-sm mb-8 text-white">
            <Link href="/" className="hover:text-[#FF8C42]">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#FF8C42]">Privacy Policy</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            <span>Privacy </span>
            <span className="text-[#FF8C42]">Policy</span>
          </h1>
        </div>
      </section>

      {/* Content Section */}
      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <div className="prose prose-lg max-w-none">
          <p className="text-[#666] text-base mb-8">
            At Rayzor Industrial Packaging Pvt Ltd, we value your privacy and are committed to protecting
            the personal information you share with us through our website.
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#1a2332] mb-6">
              Information We Collect
            </h2>
            <p className="text-[#666] mb-4">
              We may collect personal information such as:
            </p>
            <ul className="list-disc list-inside text-[#666] space-y-2 mb-6">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Company name</li>
              <li>
                Any details submitted through contact forms, inquiries, or
                emails
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#1a2332] mb-6">
              How We Use Your Information
            </h2>
            <p className="text-[#666] mb-4">
              The information collected is used to:
            </p>
            <ul className="list-disc list-inside text-[#666] space-y-2 mb-6">
              <li>Respond to your inquiries or requests</li>
              <li>Provide information about our services</li>
              <li>Improve our website and customer experience</li>
              <li>
                Communicate updates, offers, or project-related information (if
                opted in)
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#1a2332] mb-6">
              Data Protection
            </h2>
            <p className="text-[#666] mb-6">
              We implement appropriate security measures to protect your
              personal data from unauthorized access, misuse, or disclosure.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#1a2332] mb-6">
              Third-Party Sharing
            </h2>
            <p className="text-[#666] mb-6">
              Rayzor Industrial Packaging Pvt Ltd does not sell, trade, or rent your personal information
              to third parties. Information may only be shared if required by
              law or for essential business operations.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#1a2332] mb-6">Cookies</h2>
            <p className="text-[#666] mb-6">
              Our website may use cookies to enhance user experience and analyze
              website traffic. You may choose to disable cookies through your
              browser settings.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#1a2332] mb-6">
              Your Consent
            </h2>
            <p className="text-[#666] mb-4">
              By using our website, you consent to our Privacy Policy.
            </p>
            <p className="text-[#666] mb-6">
              Rayzor Industrial Packaging Pvt Ltd reserves the right to update this policy at any time.
              Changes will be reflected on this page.
            </p>
          </section>

          <section className="bg-[#F5F5F5] border-l-4 border-[#FF8C42] p-6 rounded">
            <p className="text-[#1a2332] text-sm">
              <strong>Last Updated:</strong> January 2026
            </p>
          </section>
        </div>
      </main></div>
  );
}
