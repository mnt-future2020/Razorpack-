"use client";

import Link from "next/link";

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-white">{/* Hero Section */}
      <section
        className="relative h-96 md:h-[500px] bg-cover bg-center"
        style={{
          backgroundImage: "url(/images/policy/terms-conditions-hero.jpg)",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-center">
          <nav className="flex items-center gap-2 text-sm mb-8 text-white">
            <Link href="/" className="hover:text-[#FF8C42]">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#FF8C42]">Terms & Conditions</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            <span>Terms & </span>
            <span className="text-[#FF8C42]">Conditions</span>
          </h1>
        </div>
      </section>

      {/* Content Section */}
      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <div className="prose prose-lg max-w-none">
          <p className="text-[#666] text-base mb-8">
            Welcome to Rayzor Industrial Packaging Pvt Ltd. By accessing or using our website, you agree
            to comply with the following terms and conditions.
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#1a2332] mb-6">
              Use of Website
            </h2>
            <ul className="list-disc list-inside text-[#666] space-y-2 mb-6">
              <li>
                The content on this website is for general information purposes
                only.
              </li>
              <li>
                Unauthorized use of this website may give rise to a claim for
                damages and/or be a criminal offense.
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#1a2332] mb-6">
              Intellectual Property
            </h2>
            <p className="text-[#666] mb-6">
              All content, including text, images, logos, designs, and graphics,
              are the property of Rayzor Industrial Packaging Pvt Ltd and are protected by applicable
              copyright and trademark laws. Reproduction or distribution without
              written permission is prohibited.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#1a2332] mb-6">
              Accuracy of Information
            </h2>
            <p className="text-[#666] mb-6">
              While we strive to keep information accurate and up to date,
              Rayzor Industrial Packaging Pvt Ltd makes no warranties regarding the completeness or
              reliability of website content.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#1a2332] mb-6">
              Limitation of Liability
            </h2>
            <p className="text-[#666] mb-6">
              Rayzor Industrial Packaging Pvt Ltd shall not be liable for any direct, indirect, or
              consequential damages arising from the use or inability to use
              this website.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#1a2332] mb-6">
              External Links
            </h2>
            <p className="text-[#666] mb-6">
              Our website may contain links to external websites. Rayzor Industrial Packaging Pvt Ltd has
              no control over the content or practices of these sites and is not
              responsible for them.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#1a2332] mb-6">
              Governing Law
            </h2>
            <p className="text-[#666] mb-6">
              These terms shall be governed by and interpreted in accordance
              with the laws of India.
            </p>
            <p className="text-[#666] mb-6">
              Rayzor Industrial Packaging Pvt Ltd reserves the right to modify these Terms & Conditions at
              any time without prior notice.
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
