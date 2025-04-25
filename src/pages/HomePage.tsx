import Layout from "@/components/Layout/Layout";
import { motion } from "framer-motion";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 1.5,
      ease: "easeInOut",
    },
  },
};

export default function Home() {
  return (
    <Layout>
      {/* Full-width banner with animations */}
      <div className="w-full relative overflow-hidden">
        <motion.img
          src="/banner.jpg"
          alt="9Bars Coffee Banner"
          className="w-full h-auto max-h-[500px] object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        
        {/* Animated overlay text */}
        <motion.div
          className="absolute inset-0 bg-black/20 flex items-center justify-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="text-center px-4">
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-4 text-white font-serif tracking-tight"
              variants={itemVariants}
            >
              Welcome to 9Bars Coffee
            </motion.h1>
            <motion.p
              className="text-lg md:text-2xl max-w-2xl mx-auto text-white/90 font-light"
              variants={itemVariants}
            >
              Your favorite coffee and tech hub
            </motion.p>
          </div>
        </motion.div>
      </div>

      {/* Animated content section */}
      <motion.div
        className="container mx-auto px-4 py-16 md:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <div className="text-center">
          <motion.h2
            className="text-3xl md:text-5xl font-bold mb-6 text-gray-900"
            variants={itemVariants}
          >
            Discover Our Offerings
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl max-w-2xl mx-auto text-gray-600"
            variants={fadeInVariants}
          >
            Explore our delicious beverages and cozy atmosphere perfect for tech enthusiasts.
          </motion.p>
        </div>
      </motion.div>
    </Layout>
  );
}