import Layout from "@/components/Layout/Layout";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter } from "lucide-react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/utils/motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Contact() {
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Visit us or reach out - we're always happy to connect with our community
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Contact Information */}
          <div className="space-y-6">
            {/* Contact Information Card */}
            <motion.div
              variants={fadeIn('right', 'tween', 0.2, 1)}
              className="bg-white/95 p-6 rounded-xl shadow-lg backdrop-blur-sm"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Contact Information</h2>
              
              <div className="space-y-6">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="bg-[#4b8e3f]/20 p-3 rounded-full mt-1">
                    <MapPin className="w-5 h-5 text-[#4b8e3f]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">Our Location</h3>
                    <address className="text-gray-600 not-italic">
                      56-B F.C. Cruz St., Pateros, Philippines, 1620
                    </address>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="px-0 mt-2 text-[#4b8e3f] hover:text-[#3a6d32]"
                    >
                      Get Directions
                    </Button>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="flex items-start gap-4">
                  <div className="bg-[#4b8e3f]/20 p-3 rounded-full mt-1">
                    <Phone className="w-5 h-5 text-[#4b8e3f]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">Contact</h3>
                    <div className="text-gray-600 space-y-2">
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#4b8e3f]" />
                        <a 
                          href="tel:09391288505" 
                          className="hover:text-[#4b8e3f] transition-colors"
                        >
                          0939 128 8505
                        </a>
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#4b8e3f]" />
                        <a 
                          href="mailto:info@byteandbrew.com" 
                          className="hover:text-[#4b8e3f] transition-colors"
                        >
                          info@byteandbrew.com
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="flex items-start gap-4">
                  <div className="bg-[#4b8e3f]/20 p-3 rounded-full mt-1">
                    <Clock className="w-5 h-5 text-[#4b8e3f]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">Opening Hours</h3>
                    <div className="text-gray-600 space-y-1">
                      <p className="flex justify-between max-w-xs">
                        <span className="font-medium">Mon-Fri:</span>
                        <span>8:00 AM - 8:00 PM</span>
                      </p>
                      <p className="flex justify-between max-w-xs">
                        <span className="font-medium">Sat:</span>
                        <span>9:00 AM - 7:00 PM</span>
                      </p>
                      <p className="flex justify-between max-w-xs">
                        <span className="font-medium">Sun:</span>
                        <span>9:00 AM - 9:00 PM</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Social Media Card */}
            <motion.div
              variants={fadeIn('right', 'tween', 0.3, 1)}
              className="bg-white/95 p-6 rounded-xl shadow-lg backdrop-blur-sm"
            >
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Follow Us</h3>
              <p className="text-gray-600 mb-4">
                Stay updated with our latest news and offers
              </p>
              <div className="flex gap-4">
                {[
                  { icon: <Facebook className="w-5 h-5" />, label: "Facebook" },
                  { icon: <Instagram className="w-5 h-5" />, label: "Instagram" },
                  { icon: <Twitter className="w-5 h-5" />, label: "Twitter" }
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href="#"
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-[#4b8e3f]/20 p-3 rounded-full hover:bg-[#4b8e3f]/30 transition-colors"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Map */}
          <motion.div
            variants={fadeIn('left', 'tween', 0.4, 1)}
            className="h-full"
          >
            <Card className="h-full overflow-hidden border-0 shadow-lg">
              <div className="p-6 bg-white/95 backdrop-blur-sm">
                <h2 className="text-2xl font-bold mb-2 text-gray-800">Find Us</h2>
                <p className="text-gray-600 mb-2">
                  Visit our cozy café in the heart of Pateros
                </p>
              </div>
              <div className="aspect-[4/3] w-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.758193027134!2d121.0673773153028!3d14.545170781997126!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c8f3fa299c6f%3A0x654a8f3d0b2447a3!2s56-B%20F.C.%20Cruz%20St%2C%20Pateros%2C%201620%20Metro%20Manila!5e0!3m2!1sen!2sph!4v1712345678901!5m2!1sen!2sph"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="p-4 bg-white/95 backdrop-blur-sm">
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
}