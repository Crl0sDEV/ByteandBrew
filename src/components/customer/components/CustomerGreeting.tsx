import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface CustomerGreetingProps {
  name: string;
  hasCard: boolean;
}

export function CustomerGreeting({ name, hasCard }: CustomerGreetingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-gradient-to-br from-primary/5 to-background border-0 shadow-lg rounded-lg p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-primary">Welcome, {name}!</h1>
          <p className="text-muted-foreground">
            {hasCard ? "Your loyalty card details and activity" : "Get started with your loyalty card"}
          </p>
        </div>
        
        {!hasCard && (
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md"
          >
            <p className="text-yellow-800">
              You don't have a loyalty card yet. Please visit our store to get one.
            </p>
            <Button className="mt-2" variant="default">
              Get Your Card
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}