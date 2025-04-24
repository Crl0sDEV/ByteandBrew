import Layout from "@/components/Layout/Layout";

export default function Home() {
  return (
    <Layout>
      {/* Full-width banner with img tag */}
      <div className="w-full relative">
        <img
          src="/banner.jpg"
          alt="Byte & Brew Banner"
          className="w-full h-auto max-h-[500px] object-cover"
        />
        {/* Optional overlay text */}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to 9Bars Coffee</h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto">
              Your favorite coffee and tech hub
            </p>
          </div>
        </div>
      </div>

      {/* Rest of your content */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Discover Our Offerings</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our delicious beverages and cozy atmosphere perfect for tech enthusiasts.
          </p>
        </div>
      </div>
    </Layout>
  );
}