import { Button } from "@/components/ui/button";

interface CustomerGreetingProps {
  name: string;
  hasCard: boolean;
}

export function CustomerGreeting({ name, hasCard }: CustomerGreetingProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome, {name}!</h1>
      <p className="text-muted-foreground">
        {hasCard ? "Your loyalty card details and activity" : "Get started with your loyalty card"}
      </p>
      
      {!hasCard && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800">
            You don't have a loyalty card yet. Please visit our store to get one.
          </p>
          <Button className="mt-2">Get Your Card</Button>
        </div>
      )}
    </div>
  );
}