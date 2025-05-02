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
import { Star, Instagram, MapPin, Coffee, Wifi, Users } from "lucide-react";
// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.6,
    },
  },
};

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 1,
      ease: "easeOut",
    },
  },
};

export default function Home() {
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      nextButtonRef.current?.click();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const featuredProducts = [
    {
      name: "Berry Bliss",
      description: "Refreshing iced tea with mixed berries",
      price: "₱115",
      image: "/Berry Bliss.jpg",
      rating: 4.8
    },
    {
      name: "Flat White",
      description: "Smooth espresso with velvety microfoam",
      price: "₱79",
      image: "/Flat White.jpg",
      rating: 4.5
    },
    {
      name: "Presca Matcha",
      description: "Premium matcha with delicate flavors",
      price: "₱99",
      image: "/Presa Matcha.jpg",
      rating: 4.7
    },
    {
      name: "Cookies in Cream",
      description: "Creamy blend with cookie crumbles",
      price: "₱119",
      image: "/Cookies on cream.jpg",
      rating: 4.9
    },
    {
      name: "White Mocha",
      description: "Rich white chocolate mocha delight",
      price: "₱109",
      image: "/White Mocha.jpg",
      rating: 4.6
    }
  ];

  const testimonials = [
    {
      quote: "The perfect spot for remote work - amazing coffee, fast WiFi, and a welcoming atmosphere.",
      author: "Sarah Johnson",
      role: "Freelance Developer",
      image: "/customer-1.jpg",
      rating: 5
    },
    {
      quote: "I come here every morning before work. Their Flat White is the best in town!",
      author: "Michael Chen",
      role: "Software Engineer",
      image: "/customer-2.jpg",
      rating: 5
    },
    {
      quote: "Love the tech-friendly environment and the delicious Berry Bliss drink.",
      author: "Emma Rodriguez",
      role: "UI/UX Designer",
      image: "/customer-3.jpg",
      rating: 4
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative w-full h-[90vh] max-h-[800px] overflow-hidden rounded-b-3xl">
        <motion.img
          src="/banner.jpg"
          alt="Byte & Brew Banner"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1] }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/30" />
        
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-center px-4"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="max-w-4xl">
            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white font-serif leading-tight"
              variants={itemVariants}
            >
              Where <span className="text-[#a2c569]">Tech</span> Meets <span className="text-[#a2c569]">Taste</span>
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-white/90 font-light mb-8 max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Your favorite coffee and tech hub in the heart of the city
            </motion.p>
            <motion.div variants={itemVariants} className="flex gap-4 justify-center">
              <Link 
                to="/menu" 
                className="bg-[#4b8e3f] hover:bg-[#3a6d32] text-white px-8 py-3 rounded-full font-medium transition-all hover:shadow-lg"
              >
                Explore Menu
              </Link>
              <Link 
                to="/about" 
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-medium transition-all hover:bg-white/10"
              >
                Our Story
              </Link>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Scrolling indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </motion.div>
      </section>

      {/* Featured Products Section */}
      <motion.section
        className="py-16 md:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4 text-white"
              variants={itemVariants}
            >
              Our <span className="text-[#a2c569]">Best Sellers</span>
            </motion.h2>
            <motion.p
              className="text-lg text-white/90 max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Discover customer favorites that keep them coming back for more
            </motion.p>
          </div>

          <motion.div variants={fadeInVariants}>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full relative"
            >
              <CarouselContent className="-ml-4">
                {featuredProducts.map((product, index) => (
                  <CarouselItem key={index} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <motion.div
                      className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all h-full flex flex-col border border-gray-100"
                      variants={itemVariants}
                      whileHover={{ y: -8 }}
                    >
                      <div className="relative pt-[100%] overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="absolute top-0 left-0 w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                          <span className="text-[#4b8e3f] font-bold">{product.price}</span>
                        </div>
                        <p className="text-gray-600 mb-4 flex-1">{product.description}</p>
                        <div className="flex items-center">
                          <div className="flex mr-2">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={16} 
                                fill={i < Math.floor(product.rating) ? "#FFD700" : "none"} 
                                stroke={i < Math.floor(product.rating) ? "#FFD700" : "#D1D5DB"} 
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">{product.rating}</span>
                        </div>
                      </div>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="absolute -top-16 right-0 flex gap-2">
                <CarouselPrevious className="static translate-y-0 bg-white/95 backdrop-blur-sm border-gray-200 text-gray-700 hover:bg-white hover:text-[#4b8e3f]" />
                <CarouselNext ref={nextButtonRef} className="static translate-y-0 bg-white/95 backdrop-blur-sm border-gray-200 text-gray-700 hover:bg-white hover:text-[#4b8e3f]" />
              </div>
            </Carousel>
          </motion.div>
        </div>
      </motion.section>

      {/* Value Proposition Section */}
      <motion.section
        className="py-16 md:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4 text-white"
              variants={itemVariants}
            >
              Why Choose <span className="text-[#a2c569]">Byte & Brew</span>?
            </motion.h2>
            <motion.p
              className="text-lg text-white/90 max-w-2xl mx-auto"
              variants={itemVariants}
            >
              We combine premium quality with a tech-friendly environment
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Coffee size={32} className="text-[#4b8e3f]" />,
                title: "Premium Ingredients",
                description: "We source only the finest coffee beans and ingredients for exceptional flavor."
              },
              {
                icon: <Wifi size={32} className="text-[#4b8e3f]" />,
                title: "Tech-Friendly Space",
                description: "High-speed WiFi, ample power outlets, and comfortable workspaces."
              },
              {
                icon: <Users size={32} className="text-[#4b8e3f]" />,
                title: "Vibrant Community",
                description: "Join our regular tech meetups and coffee tasting events."
              }
            ].map((item, index) => (
              <motion.div 
                key={index} 
                className="bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center border border-gray-100"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 rounded-full bg-[#4b8e3f]/10 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        className="py-16 md:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4 text-white"
              variants={itemVariants}
            >
              What Our <span className="text-[#a2c569]">Customers</span> Say
            </motion.h2>
            <motion.p
              className="text-lg text-white/90 max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Don't just take our word for it - hear from our community
            </motion.p>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={fadeInVariants}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col border border-gray-100"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={18} 
                      fill={i < testimonial.rating ? "#FFD700" : "none"} 
                      stroke={i < testimonial.rating ? "#FFD700" : "#D1D5DB"} 
                    />
                  ))}
                </div>
                <p className="text-lg italic mb-6 flex-1 text-gray-700">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{testimonial.author}</p>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Instagram Gallery Section */}
      <motion.section
        className="py-16 md:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4 text-white"
              variants={itemVariants}
            >
              Follow Us <span className="text-[#a2c569]">@ByteAndBrew</span>
            </motion.h2>
            <motion.p
              className="text-lg text-white/90 max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Join our community and tag us in your posts
            </motion.p>
          </div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            variants={fadeInVariants}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <motion.div
                key={item}
                className="relative group overflow-hidden rounded-xl aspect-square bg-white/5 backdrop-blur-sm border border-white/10"
                whileHover={{ scale: 1.02 }}
              >
                <img
                  src={`/instagram-${item}.jpg`}
                  alt="Instagram post"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Instagram size={32} className="text-white" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-16 md:py-24 bg-gradient-to-r from-[#a2c569] to-[#4b8e3f]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-6 text-white"
            variants={itemVariants}
          >
            Ready to Experience <span className="text-white">Byte & Brew</span>?
          </motion.h2>
          <motion.p
            className="text-xl mb-8 max-w-2xl mx-auto text-white/90"
            variants={itemVariants}
          >
            Visit us today and enjoy the perfect blend of coffee, tech, and community.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={itemVariants}
          >
            <Link 
              to="/contact" 
              className="bg-white text-[#4b8e3f] px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
            >
              <MapPin size={20} />
              Get Directions
            </Link>
            <Link 
              to="/menu" 
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-all"
            >
              View Full Menu
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </Layout>
  );
}