import { TopBar } from "@/components/top-bar";
import { DynamicPageBanner } from "@/components/DynamicPageBanner";
import { CtaBanner } from "@/components/cta-banner";
import { Check, HelpCircle, FileText, Users } from "lucide-react";
import Link from "next/link";

export default function NdisPage() {
  const faqs = [
    {
      question: "What is the NDIS?",
      answer:
        "The National Disability Insurance Scheme (NDIS) is an Australian government initiative that provides funding for disability support services to eligible individuals.",
    },
    {
      question: "How do I know if I'm eligible?",
      answer:
        "To be eligible for the NDIS, you generally need to be under 65, be an Australian citizen or permanent resident, and have a permanent and significant disability that affects your daily life.",
    },
    {
      question: "How do I access NDIS funding?",
      answer:
        "You can apply for the NDIS by contacting the National Disability Insurance Agency (NDIA) directly or through a Local Area Coordinator (LAC).",
    },
    {
      question: "Can you help me with my NDIS plan?",
      answer:
        "Yes! Our team can help you understand your NDIS plan, connect you with services, and ensure you're getting the most out of your funding.",
    },
  ];

  return (
    <main className="min-h-screen">
      <TopBar /><DynamicPageBanner
        pageKey="ndis"
        title="NDIS INFORMATION"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "NDIS", href: "/ndis" },
        ]}
      />

      {/* What is NDIS Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              <span className="text-[#1E3A5F]">UNDERSTANDING </span>
              <span className="text-[#8CC63F]">THE NDIS</span>
            </h2>
            <p className="text-gray-600 leading-relaxed text-justify">
              The National Disability Insurance Scheme (NDIS) is a way of
              providing support for Australians with disability, their families
              and carers. As a premier facade solutions provider, Rayzor Industrial Packaging Pvt Ltd
              specializes in structural glazing, ACP cladding, and architectural
              aluminium systems. you navigate the scheme and access the services
              you need.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#F5F5F5] p-6 rounded-lg text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-[#8CC63F]/10 rounded-full">
                <Users className="w-8 h-8 text-[#8CC63F]" />
              </div>
              <h3 className="text-lg font-semibold text-[#1E3A5F] mb-2">
                Who We Support
              </h3>
              <p className="text-gray-600 text-sm text-justify">
                We support NDIS participants of all ages with a wide range of
                disabilities across South Australia.
              </p>
            </div>

            <div className="bg-[#F5F5F5] p-6 rounded-lg text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-[#8CC63F]/10 rounded-full">
                <FileText className="w-8 h-8 text-[#8CC63F]" />
              </div>
              <h3 className="text-lg font-semibold text-[#1E3A5F] mb-2">
                Registered Provider
              </h3>
              <p className="text-gray-600 text-sm text-justify">
                We are a registered NDIS provider, meaning we meet strict
                quality and safety standards.
              </p>
            </div>

            <div className="bg-[#F5F5F5] p-6 rounded-lg text-center sm:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-[#8CC63F]/10 rounded-full">
                <HelpCircle className="w-8 h-8 text-[#8CC63F]" />
              </div>
              <h3 className="text-lg font-semibold text-[#1E3A5F] mb-2">
                Plan Management
              </h3>
              <p className="text-gray-600 text-sm text-justify">
                Whether you're self-managed, plan-managed, or agency-managed, we
                can work with you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Get Started */}
      <section className="py-12 sm:py-16 md:py-20 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
            <span className="text-[#1E3A5F]">HOW TO </span>
            <span className="text-[#8CC63F]">GET STARTED</span>
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Contact Us",
                desc: "Reach out to discuss your needs and how we can help.",
              },
              {
                step: "02",
                title: "Assessment",
                desc: "We'll review your NDIS plan and discuss your goals.",
              },
              {
                step: "03",
                title: "Service Agreement",
                desc: "We'll create a service agreement tailored to your needs.",
              },
              {
                step: "04",
                title: "Start Services",
                desc: "Begin receiving the support you need to achieve your goals.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-white p-6 rounded-lg text-center h-full">
                  <div className="text-4xl font-bold text-[#8CC63F] mb-3">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-[#1E3A5F] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm text-justify">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
            <span className="text-[#1E3A5F]">FREQUENTLY ASKED </span>
            <span className="text-[#8CC63F]">QUESTIONS</span>
          </h2>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="bg-[#F5F5F5] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#1E3A5F] mb-2 flex items-start gap-2">
                  <div className="mt-0.5 p-1 bg-[#8CC63F] rounded-full flex-shrink-0">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  {faq.question}
                </h3>
                <p className="text-gray-600 ml-7 text-justify">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/contact"
              className="inline-block bg-[#8CC63F] text-white font-medium px-8 py-3 rounded hover:bg-[#7AB82F] transition-colors"
            >
              Contact Us For More Information
            </Link>
          </div>
        </div>
      </section>

      <CtaBanner /></main>
  );
}
