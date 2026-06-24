"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Target, Eye, Award, Users, Building2, Clock } from "lucide-react"

const values = [
  {
    icon: Award,
    title: "Quality Excellence",
    description: "We never compromise on quality, using only premium materials and strict quality control processes.",
  },
  {
    icon: Users,
    title: "Client Partnership",
    description: "We work closely with architects, developers, and contractors to deliver tailored solutions.",
  },
  {
    icon: Building2,
    title: "Innovation",
    description: "We continuously adopt advanced technology and innovative approaches in facade engineering.",
  },
  {
    icon: Clock,
    title: "Timely Delivery",
    description: "We understand deadlines and ensure on-time project completion without compromising quality.",
  },
]

const stats = [
  { value: "500+", label: "Projects Completed" },
  { value: "15+", label: "Years Experience" },
  { value: "200+", label: "Happy Clients" },
  { value: "3", label: "Branch Locations" },
]

export function AboutContent() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-20">
          {/* Left - Story */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1 rounded-full bg-[#f58420]/10 text-[#f58420] text-sm font-medium mb-4">
              Our Story
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#014a74] mb-6">
              Innovating Iconic Facades
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed text-justify">
              <p>
                At Rayzor Industrial Packaging Pvt Ltd, we specialize in delivering innovative, high-quality facade solutions 
                that redefine the visual identity and performance of modern buildings. With a strong 
                commitment to design excellence, engineering precision, and timely execution, we help 
                transform architectural visions into iconic realities.
              </p>
              <p>
                Backed by a team of experienced professionals, Rayzor Industrial Packaging Pvt Ltd offers end-to-end facade 
                services—from concept and design coordination to fabrication, installation, and 
                project management. Our expertise spans a wide range of facade systems, including 
                glass facades, aluminium cladding, curtain wall systems, louvers, glazing solutions, 
                and customized architectural exteriors.
              </p>
              <p>
                We believe that a building&apos;s facade is more than just an outer skin—it is a statement 
                of identity, efficiency, and durability. By combining advanced technology, premium 
                materials, and strict quality control, we ensure every project meets the highest 
                standards of safety, sustainability, and aesthetics.
              </p>
            </div>
          </motion.div>

          {/* Right - Mission & Vision */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Mission */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#fefaf6] to-white border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#014a74] flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#014a74]">Our Mission</h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-justify">
                To deliver exceptional facade solutions that combine innovation, quality, and 
                sustainability, while exceeding client expectations through collaborative partnerships 
                and unwavering commitment to excellence.
              </p>
            </div>

            {/* Vision */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#014a74] to-[#012d47] text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-[#f58420]" />
                </div>
                <h3 className="text-xl font-semibold">Our Vision</h3>
              </div>
              <p className="text-white/80 leading-relaxed text-justify">
                To be the most trusted and innovative facade solutions provider in India, known for 
                transforming skylines and setting new benchmarks in architectural excellence.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-gray-200 mb-20"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#014a74] mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-[#014a74]/10 text-[#014a74] text-sm font-medium mb-4">
            Our Values
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#014a74]">
            What Drives Us
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-[#fefaf6] to-white border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#014a74] to-[#0369a1] flex items-center justify-center mb-4">
                <value.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#014a74] mb-2">{value.title}</h3>
              <p className="text-gray-600 text-sm text-justify">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
