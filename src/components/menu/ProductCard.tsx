import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/types";
import TemperatureBadge from "./TemperatureBadge";

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  hover: {
    y: -5,
    shadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: "easeOut"
    }
  }
};

const textVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
      className="h-full"
    >
      <Card className="h-full flex flex-col !p-0 overflow-hidden">
        {/* Image with animation */}
        <motion.div 
          className="relative aspect-square w-full"
          variants={imageVariants}
        >
          {product.image_url ? (
            <motion.img
              src={product.image_url}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <div className="w-full h-full bg-muted/50 flex items-center justify-center rounded-t-lg">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}
        </motion.div>

        <CardContent className="p-3 flex-1 flex flex-col">
          {/* Name and Category row with staggered animation */}
          <motion.div 
            className="flex justify-between items-start gap-2"
            variants={textVariants}
          >
            <motion.h3 
              className="font-semibold text-lg line-clamp-2 flex-1"
              variants={itemVariants}
            >
              {product.name}
            </motion.h3>
            <motion.div variants={itemVariants}>
              <Badge variant="secondary" className="shrink-0">
                {product.category}
              </Badge>
            </motion.div>
          </motion.div>

          {/* Temperature badge with animation */}
          <motion.div 
            className="min-h-[1.5rem] mt-1"
            variants={itemVariants}
          >
            {product.temperature && product.temperature !== "none" ? (
              <TemperatureBadge temperature={product.temperature} />
            ) : (
              <div className="h-[1.5rem]"></div>
            )}
          </motion.div>

          {/* Description with animation */}
          <motion.p 
            className="text-muted-foreground text-sm line-clamp-2 mt-2 h-[2.5rem]"
            variants={itemVariants}
          >
            {product.description}
          </motion.p>

          {/* Price section with animation */}
          <motion.div 
            className="mt-auto pt-4"
            variants={itemVariants}
          >
            <p className="font-bold text-lg">₱{product.base_price.toFixed(2)}</p>
            {product.has_sizes && (
              <p className="text-xs text-muted-foreground mt-1">
                *Available in multiple sizes
              </p>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}