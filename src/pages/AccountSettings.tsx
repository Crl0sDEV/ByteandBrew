import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { toast } from "sonner";

export default function AccountSettings() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setEmail(user.email ?? "");
    };
    loadUser();
  }, []);

  const handleSave = async () => {
    const { error } = await supabase.auth.updateUser({ email });
    if (error) {
      toast.error("Failed to update email.");
    } else {
      toast.success("Email updated successfully.");
    }
  };

  return (
    <div className="p-8">
         <Header />
      <h2 className="text-2xl font-bold mb-4">Account Settings</h2>
      <label className="text-sm font-medium">Email</label>
      <Input value={email} onChange={(e) => setEmail(e.target.value)} className="mb-4" />
      <Button onClick={handleSave}>Save</Button>
    </div>
  );
}