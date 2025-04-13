import Header from "@/components/Header";

export default function AdminDashboard() {
    return (
      <div className="p-8">
         <Header />
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p>Welcome, Admin! You can manage users and settings here.</p>
      </div>
    );
  }
  