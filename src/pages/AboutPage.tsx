import Layout from "@/components/Layout/Layout";
import { Coffee, Wifi, Users, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/utils/motion";
import { Card } from "@/components/ui/card";

export default function About() {
  return (
    <Layout>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={staggerContainer(0.1, 0.2)}
        className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8"
      >
        {/* Page Header */}
        <motion.div
          variants={fadeIn('up', 'tween', 0.1, 1)}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Story</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Where tech meets taste - the perfect blend of coffee and community
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - About Text */}
          <div className="space-y-6">
            {/* About Card */}
            <motion.div
              variants={fadeIn('right', 'tween', 0.2, 1)}
              className="bg-white/95 p-6 rounded-xl shadow-lg backdrop-blur-sm"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-800">About Byte & Brew</h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  Founded in 2025, Byte & Brew was born from a simple idea: create a space where technology 
                  enthusiasts and coffee lovers could come together. What started as a small café has grown 
                  into a thriving community hub in the heart of Pateros.
                </p>
                
                <div className="my-6 p-4 bg-[#4b8e3f]/10 rounded-lg border border-[#4b8e3f]/20">
                <h3 className="text-lg font-semibold mb-2 text-[#4b8e3f]">Our Beverages</h3>
                <p className="italic text-gray-700">
                  "Delectable iced coffees, to iced tea and fizzy drinks paired with your favourite croffles! 
                  We drink good coffee. We are 9BARs coffee."
                </p>
              </div>
              
                {/* Wide image (image1) */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="rounded-lg overflow-hidden my-6"
                >
                  <img
                    src="/image1.jpg"  // image1 - wide
                    alt="Our spacious workspace"
                    className="w-full h-auto max-h-64 object-cover"
                  />
                </motion.div>
                
                <p>
                  We pride ourselves on serving premium specialty coffee alongside state-of-the-art tech amenities, 
                  creating the perfect environment for work, study, or relaxation.
                </p>
                
                {/* Vertical images side-by-side (image2 and image3) */}
                <div className="grid grid-cols-2 gap-4 my-6">
                  <motion.div 
                    whileHover={{ scale: 1.03 }}
                    className="rounded-lg overflow-hidden"
                  >
                    <img
                      src="/image2.jpg"  // image2 - tall
                      alt="Our coffee station"
                      className="w-full h-64 object-cover"
                    />
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.03 }}
                    className="rounded-lg overflow-hidden"
                  >
                    <img
                      src="/image3.jpg"  // image3 - tall
                      alt="Tech working area"
                      className="w-full h-64 object-cover"
                    />
                  </motion.div>
                </div>
                
                <p>
                  Our partnership with <span className="font-semibold text-[#4b8e3f]">9BARs coffee</span> ensures 
                  we serve only the highest quality beans, ethically sourced and expertly roasted.
                </p>
              </div>
            </motion.div>

            {/* Values Card */}
            <motion.div
              variants={fadeIn('right', 'tween', 0.3, 1)}
              className="bg-white/95 p-6 rounded-xl shadow-lg backdrop-blur-sm"
            >
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Our Values</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    icon: <Coffee className="w-6 h-6 text-[#4b8e3f]" />,
                    title: "Quality Coffee",
                    description: "We source only the finest specialty coffee beans"
                  },
                  {
                    icon: <Wifi className="w-6 h-6 text-[#4b8e3f]" />,
                    title: "Tech-Friendly",
                    description: "High-speed internet and ample workspaces"
                  },
                  {
                    icon: <Users className="w-6 h-6 text-[#4b8e3f]" />,
                    title: "Community",
                    description: "A welcoming space for all to connect and create"
                  },
                  {
                    icon: <Heart className="w-6 h-6 text-[#4b8e3f]" />,
                    title: "Sustainability",
                    description: "Eco-friendly practices in everything we do"
                  }
                ].map((value, index) => (
                  <motion.div 
                    key={index}
                    whileHover={{ y: -3 }}
                    className="p-4 rounded-lg bg-[#4b8e3f]/10 hover:bg-[#4b8e3f]/20 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-full bg-white">
                        {value.icon}
                      </div>
                      <h4 className="font-semibold text-gray-800">{value.title}</h4>
                    </div>
                    <p className="text-gray-600 text-sm">{value.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Image Gallery */}
          <motion.div
            variants={fadeIn('left', 'tween', 0.4, 1)}
            className="space-y-6"
          >
            {/* Large rectangular image (image4) */}
            <Card className="bg-white/95 p-6 rounded-xl shadow-lg backdrop-blur-sm border-0">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Our Workspace</h3>
              <p className="text-gray-600 mb-4">
                Designed for both productivity and comfort
              </p>
              <div className="w-full rounded-lg overflow-hidden">
                <motion.img
                  src="/image4.jpg"  // image4 - rectangular
                  alt="Workspace overview"
                  className="w-full h-auto max-h-96 object-cover hover:scale-105 transition-transform duration-500"
                  whileHover={{ scale: 1.02 }}
                />
              </div>
            </Card>

            {/* Tall image (image5) */}
            <Card className="bg-white/95 p-6 rounded-xl shadow-lg backdrop-blur-sm border-0">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Coffee Bar</h3>
              <p className="text-gray-600 mb-4">
                Where our baristas craft your perfect cup
              </p>
              <div className="w-full rounded-lg overflow-hidden">
                <motion.img
                  src="/image5.jpg"  // image5 - tall
                  alt="Coffee bar area"
                  className="w-full h-96 object-cover hover:scale-105 transition-transform duration-500"
                  whileHover={{ scale: 1.02 }}
                />
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
}