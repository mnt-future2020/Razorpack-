import { TopBar } from "@/components/top-bar"
import { PageBanner } from "@/components/page-banner"
import { CtaBanner } from "@/components/cta-banner"
import Image from "next/image"

const teamMembers = [
  {
    name: "Sarah Mitchell",
    role: "Managing Director",
    image: "/professional-woman-manager-headshot-smiling.jpg",
    bio: "Sarah has over 15 years of experience in disability services and is passionate about creating inclusive communities.",
  },
  {
    name: "James Thompson",
    role: "Operations Manager",
    image: "/professional-man-headshot-smiling.jpg",
    bio: "James oversees our day-to-day operations, ensuring quality service delivery across all regions.",
  },
  {
    name: "Emily Chen",
    role: "Support Coordinator",
    image: "/professional-woman-coordinator-headshot.jpg",
    bio: "Emily works directly with participants to develop personalized support plans that meet their goals.",
  },
  {
    name: "Dr. Michael Roberts",
    role: "Clinical Director",
    image: "/professional-doctor-headshot.png",
    bio: "Dr. Roberts brings extensive clinical expertise to guide our behavior support services.",
  },
  {
    name: "Lisa Anderson",
    role: "Community Liaison",
    image: "/avatar-1.png",
    bio: "Lisa builds partnerships with community organizations to expand opportunities for participants.",
  },
  {
    name: "David Wilson",
    role: "Quality Assurance Manager",
    image: "/professional-man-quality-assurance-headshot.jpg",
    bio: "David ensures our services meet the highest standards of quality and compliance.",
  },
]

export default function TeamPage() {
  return (
    <main className="min-h-screen">
      <TopBar /><PageBanner
        title="OUR TEAM"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "About Us", href: "/about" },
          { label: "Our Team", href: "/about/team" },
        ]}
      />

      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              <span className="text-[#1E3A5F]">MEET </span>
              <span className="text-[#8CC63F]">OUR TEAM</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-justify">
              Our dedicated team of professionals is committed to providing exceptional support and making a positive
              difference in the lives of our participants.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="bg-[#F5F5F5] rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="relative h-64 sm:h-72 overflow-hidden">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-lg font-semibold text-[#8CC63F] mb-1">{member.name}</h3>
                  <p className="text-[#1E3A5F] font-medium text-sm mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner /></main>
  )
}
