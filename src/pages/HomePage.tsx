import Layout from "@/components/Layout/Layout";

export default function Home() {
  return (
    <Layout>
      <div className="text-center py-20">
        <h2 className="text-4xl font-bold mb-6">Welcome to Byte & Brew</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your favorite coffee and tech hub. Discover our delicious beverages and cozy atmosphere.
        </p>
      </div>
    </Layout>
  );
}