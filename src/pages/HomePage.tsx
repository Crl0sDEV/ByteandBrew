import Layout from "@/components/Layout/Layout";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.4,
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
      ease: "easeOut",
    },
  },
};

export default function Home() {
  const featuredProducts = [
    {
      name: "Byte Blend",
      description: "Rich espresso with chocolate notes",
      price: "₱150",
      image: "/byte-blend.jpg"
    },
    {
      name: "Code Caramel",
      description: "Caramel macchiato with extra kick",
      price: "₱180",
      image: "/code-caramel.jpg"
    },
    {
      name: "Debug Decaf",
      description: "Smooth decaf for late nights",
      price: "₱160",
      image: "/debug-decaf.jpg"
    },
    {
      name: "Java Jolt",
      description: "Extra strong black coffee",
      price: "₱170",
      image: "/java-jolt.jpg"
    },
    {
      name: "Python Punch",
      description: "Fruity iced tea with citrus",
      price: "₱165",
      image: "/python-punch.jpg"
    }
  ];

  return (
    <Layout>
      {/* Full-width banner with animations (special case) */}
      <div className="w-full relative overflow-hidden">
        <motion.img
          src="/banner.jpg"
          alt="9Bars Coffee Banner"
          className="w-full h-auto max-h-[600px] object-cover"
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
              Welcome to Byte & Brew
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

      {/* Container-width content section (white background) */}
      <motion.section
        className="py-16 md:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <div className="container mx-auto px-4 text-center">
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
      </motion.section>

      {/* Full-width background section (gray) */}
      <div className="w-full bg-gray-50">
        <motion.section 
          className="py-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4">
            <motion.h2 
              className="text-3xl font-bold text-center mb-12 text-gray-900"
              variants={itemVariants}
            >
              Our Signature Brews
            </motion.h2>
            
            <motion.div variants={fadeInVariants}>
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {featuredProducts.map((product, index) => (
                    <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                      <motion.div 
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full"
                        variants={itemVariants}
                        whileHover={{ y: -5 }}
                      >
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-6">
                          <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                          <p className="text-gray-600 mb-4">{product.description}</p>
                          <p className="text-primary font-bold">{product.price}</p>
                        </div>
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
              </Carousel>
            </motion.div>
          </div>
        </motion.section>
      </div>

      {/* Container-width content section (light primary background) */}
      <div className="w-full bg-primary/5">
        <motion.section 
          className="py-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4">
            <motion.h2 
              className="text-3xl font-bold text-center mb-12 text-gray-900"
              variants={itemVariants}
            >
              What Our Customers Say
            </motion.h2>
            
            <motion.div 
              className="max-w-4xl mx-auto"
              variants={fadeInVariants}
            >
              <div className="bg-white p-8 rounded-xl shadow-md">
                <p className="text-lg italic mb-6">
                  "The best coffee shop for remote workers - fast WiFi, great ambiance, and amazing coffee!"
                </p>
                <div className="flex items-center">
                  <img 
                    src="/customer-1.jpg" 
                    alt="Customer" 
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <p className="font-semibold">Sarah Johnson</p>
                    <p className="text-gray-600 text-sm">Freelance Developer</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>

      {/* Full-width background section (white) */}
      <div className="w-full bg-white">
        <motion.section 
          className="py-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4">
            <motion.h2 
              className="text-3xl font-bold text-center mb-12 text-gray-900"
              variants={itemVariants}
            >
              Follow Us @ByteAndBrew
            </motion.h2>
            
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              variants={fadeInVariants}
            >
              {[1,2,3,4].map((item) => (
                <motion.div 
                  key={item}
                  whileHover={{ scale: 1.03 }}
                  className="aspect-square overflow-hidden rounded-lg"
                >
                  <img 
                    src={`/instagram-${item}.jpg`} 
                    alt="Instagram post"
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>
      </div>

      {/* Full-width colored section (primary) */}
      <div className="w-full bg-primary">
        <motion.section 
          className="py-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4 text-center">
            <motion.h2 
              className="text-3xl font-bold mb-6"
              variants={itemVariants}
            >
              Ready to Experience Byte & Brew?
            </motion.h2>
            <motion.p 
              className="text-xl mb-8 max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Visit us today and enjoy the perfect blend of coffee and drinks.
            </motion.p>
            <motion.div variants={itemVariants}>
              <button className="bg-white text-primary px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                Get Directions
              </button>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </Layout>
  );
}