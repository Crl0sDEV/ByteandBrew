import Layout from "@/components/Layout/Layout";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
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
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      nextButtonRef.current?.click();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const featuredProducts = [
    {
      name: "Berry Bliss",
      description: "Iced Tea",
      price: "₱115",
      image: "/Berry Bliss.jpg"
    },
    {
      name: "Flat White",
      description: "Caramel macchiato with extra kick",
      price: "₱79",
      image: "/Flat White.jpg"
    },
    {
      name: "Presca Matcha",
      description: "Smooth decaf for late nights",
      price: "₱99",
      image: "/Presa Matcha.jpg"
    },
    {
      name: "Cookies in Cream",
      description: "Extra strong black coffee",
      price: "₱119",
      image: "/Cookies on cream.jpg"
    },
    {
      name: "White Mocha",
      description: "Smooth vanilla latte",
      price: "₱109",
      image: "/White Mocha.jpg"
    }
  ];

  return (
    <Layout>
      {/* Full-width banner with animations */}
      <div className="w-full relative overflow-hidden rounded-2xl">
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
          className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-2xl"
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

      {/* Frosted glass Best Sellers section */}
      <motion.section
        className="py-16 backdrop-blur-md bg-white/20 rounded-3xl mx-4 my-8"
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
            Best Sellers
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
                      className="bg-white/30 backdrop-blur-md rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full"
                      variants={itemVariants}
                      whileHover={{ y: -5 }}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-80 object-cover"
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
              <CarouselPrevious className="hidden" />
              <CarouselNext ref={nextButtonRef} className="hidden" />
            </Carousel>
          </motion.div>
        </div>
      </motion.section>


      <motion.section
  className="py-8 md:py-12 backdrop-blur-md bg-white/20 rounded-3xl mx-4 my-8"
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
    {/* Button */}
    <motion.div variants={fadeInVariants} className="mt-8">
      <Link to="/menu">
        <button
          className="bg-white text-primary px-6 py-3 rounded-full font-semibold hover:bg-primary-dark transition-colors"
        >
          Explore Our Products
        </button>
      </Link>
    </motion.div>
  </div>
</motion.section>

      {/* Frosted glass Testimonials section */}
      <motion.section
        className="py-16 backdrop-blur-md bg-white/20 rounded-3xl mx-4 my-8"
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
            <div className="bg-white/30 backdrop-blur-md p-8 rounded-xl shadow-md">
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

      {/* Frosted glass Instagram Gallery */}
      <motion.section
        className="py-16 backdrop-blur-md bg-white/20 rounded-3xl mx-4 my-8"
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
            {[1, 2, 3, 4].map((item) => (
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

      {/* Frosted glass Final Call to Action */}
      <motion.section
        className="py-16 backdrop-blur-md bg-white/20 rounded-3xl mx-4 my-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={containerVariants}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            className="text-3xl font-bold mb-6 text-gray-900"
            variants={itemVariants}
          >
            Ready to Experience Byte & Brew?
          </motion.h2>
          <motion.p
            className="text-xl mb-8 max-w-2xl mx-auto text-gray-700"
            variants={itemVariants}
          >
            Visit us today and enjoy the perfect blend of coffee and drinks.
          </motion.p>
          <motion.div variants={itemVariants}>
            <button className="bg-white text-primary px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
            <Link to="/contact">
              Get Directions
              </Link>
            </button>
          </motion.div>
        </div>
      </motion.section>
    </Layout>
  );
}
