import Layout from "@/components/Layout/Layout";
import { MapPin, Phone, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/utils/motion";

export default function Contact() {
  return (
    <Layout>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={staggerContainer(0.1, 0.2)}
        className="max-w-6xl mx-auto py-12 px-2 sm:px-4 lg:px-6"
      >
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Contact Information */}
          <div className="space-y-6">
            {/* Address */}
            <motion.div
              variants={fadeIn('right', 'tween', 0.2, 1)}
              className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-md flex items-start gap-4 hover:shadow-lg transition-shadow"
            >
              <div className="bg-primary/10 p-3 rounded-full">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Our Location</h3>
                <address className="text-muted-foreground not-italic">
                  56-B F.C. Cruz St., Pateros, Philippines, 1620
                </address>
              </div>
            </motion.div>

            {/* Contact Details */}
            <motion.div
              variants={fadeIn('right', 'tween', 0.3, 1)}
              className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-md flex items-start gap-4 hover:shadow-lg transition-shadow"
            >
              <div className="bg-primary/10 p-3 rounded-full">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Contact</h3>
                <div className="text-muted-foreground space-y-1">
                  <p>Phone: 0939 128 8505</p>
                  <p>Email: info@byteandbrew.com</p>
                </div>
              </div>
            </motion.div>

            {/* Opening Hours */}
            <motion.div
              variants={fadeIn('right', 'tween', 0.4, 1)}
              className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-md flex items-start gap-4 hover:shadow-lg transition-shadow"
            >
              <div className="bg-primary/10 p-3 rounded-full">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Opening Hours</h3>
                <div className="text-muted-foreground space-y-1">
                  <p><span className="font-medium">Mon-Fri:</span> 8:00 AM - 8:00 PM</p>
                  <p><span className="font-medium">Sat:</span> 9:00 AM - 7:00 PM</p>
                  <p><span className="font-medium">Sun:</span> 9:00 AM - 9:00 PM</p>
                </div>
              </div>
            </motion.div>

            {/* Social Media */}
            <motion.div
              variants={fadeIn('right', 'tween', 0.5, 1)}
              className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-md flex flex-col items-center hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
              <div className="flex justify-center space-x-6">
                <motion.a 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  href="#" 
                  className="bg-primary/10 p-3 rounded-full hover:bg-primary/20 transition-colors"
                >
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </motion.a>
                <motion.a 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  href="#" 
                  className="bg-primary/10 p-3 rounded-full hover:bg-primary/20 transition-colors"
                >
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06-4.123v-.08c0-2.643-.012-2.987-.06-4.043-.049-1.064-.218-1.791-.465-2.427a4.902 4.902 0 01-1.153-1.772 4.902 4.902 0 01-1.772-1.153c-.636-.247-1.363-.416-2.427-.465-1.024-.047-1.379-.06-3.808-.06-2.43 0-2.784.013-3.808.06-1.064.049-1.791.218-2.427.465a4.902 4.902 0 01-1.772 1.153 4.902 4.902 0 01-1.153 1.772c-.247.636-.416 1.363-.465 2.427-.047 1.024-.06 1.379-.06 3.808 0 2.43.013 2.784.06 3.808.049 1.064.218 1.791.465 2.427a4.902 4.902 0 011.153 1.772 4.902 4.902 0 011.772 1.153c.636.247 1.363.416 2.427.465 1.067.048 1.407.06 4.123.06h.08c2.643 0 2.987-.012 4.043-.06 1.064-.049 1.791-.218 2.427-.465a4.902 4.902 0 011.772-1.153 4.902 4.902 0 011.153-1.772c.247-.636.416-1.363.465-2.427.048-1.067.06-1.407.06-4.123.06-4.123v-.08c0-2.643.012-2.987.06-4.043.049-1.064.218-1.791.465-2.427a4.902 4.902 0 01-1.153-1.772 4.902 4.902 0 01-1.772-1.153c-.636-.247-1.363-.416-2.427-.465-1.024-.047-1.379-.06-3.808-.06zm-6.616 3.75a2.625 2.625 0 115.25 0 2.625 2.625 0 01-5.25 0zm6.317 8.375a6.75 6.75 0 11-13.5 0 6.75 6.75 0 0113.5 0z" clipRule="evenodd" />
                  </svg>
                </motion.a>
                <motion.a 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  href="#" 
                  className="bg-primary/10 p-3 rounded-full hover:bg-primary/20 transition-colors"
                >
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </motion.a>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Map */}
          <motion.div
            variants={fadeIn('left', 'tween', 0.4, 1)}
            className="bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-lg h-full min-h-[500px] hover:shadow-xl transition-shadow"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.758193027134!2d121.0673773153028!3d14.545170781997126!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c8f3fa299c6f%3A0x654a8f3d0b2447a3!2s56-B%20F.C.%20Cruz%20St%2C%20Pateros%2C%201620%20Metro%20Manila!5e0!3m2!1sen!2sph!4v1712345678901!5m2!1sen!2sph"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-lg"
            ></iframe>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
}