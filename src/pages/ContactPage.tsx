import Layout from "@/components/Layout/Layout";

export default function About() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold mb-8">About Byte & Brew</h2>
        
        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-3">Our Story</h3>
            <p className="text-muted-foreground">
              Founded in 2023, Byte & Brew combines two passions: great coffee and technology. 
              We wanted to create a space where people can enjoy quality beverages while working 
              or relaxing in a tech-friendly environment.
            </p>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold mb-3">Our Mission</h3>
            <p className="text-muted-foreground">
              To provide exceptional coffee and a welcoming space that fosters creativity 
              and community among tech enthusiasts and coffee lovers alike.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}