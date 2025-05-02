import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/types";
import TemperatureBadge from "./TemperatureBadge";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hover: { y: -5, transition: { duration: 0.3 } }
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7 } }
};

const textVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function ProductCard({ product }: { product: Product;  className: string; }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
      className="h-full w-full"
    >
      <Card className="h-full w-full flex flex-col !p-0 overflow-hidden">
        {/* Image container with fixed aspect ratio */}
        <motion.div 
          className="relative w-full aspect-square bg-muted/50 overflow-hidden"
          variants={imageVariants}
        >
          {product.image_url ? (
            <motion.img
              src={product.image_url}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}
        </motion.div>

        {/* Content area with fixed structure */}
        <CardContent className="p-4 flex-1 flex flex-col gap-2">
          {/* Header row */}
          <motion.div 
            className="flex justify-between items-start"
            variants={textVariants}
          >
            <motion.h3 
              className="font-semibold text-lg line-clamp-2 flex-1"
              variants={itemVariants}
            >
              {product.name}
            </motion.h3>
            <Badge variant="secondary" className="shrink-0">
              {product.category}
            </Badge>
          </motion.div>

          {/* Temperature badge (always takes space) */}
          <motion.div 
            className="h-6"
            variants={itemVariants}
          >
            {product.temperature && product.temperature !== "none" ? (
              <TemperatureBadge temperature={product.temperature} />
            ) : <div className="h-full" />}
          </motion.div>

          {/* Description with fixed height */}
          <motion.p 
            className="text-muted-foreground text-sm line-clamp-2 h-[3.5rem]"
            variants={itemVariants}
          >
            {product.description}
          </motion.p>

          {/* Price section with consistent bottom spacing */}
          <div className="mt-auto pt-2">
            <motion.div variants={itemVariants}>
              <p className="font-bold text-lg">₱{product.base_price.toFixed(2)}</p>
            </motion.div>
            <motion.div 
              className="h-5"
              variants={itemVariants}
            >
              {product.has_sizes ? (
                <p className="text-xs text-muted-foreground">
                  *Available in multiple sizes
                </p>
              ) : <div className="h-full" />}
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}