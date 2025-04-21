import { LogOut, UserCircle2, Settings, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function Header() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        setUserEmail(userData.user.email ?? null);
      }
    };
    
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleNavigateToDashboard = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Session expired, please login again");
      navigate("/");
      return;
    }

    const role = user.user_metadata?.role || 
                 (await supabase.from('profiles').select('role').eq('id', user.id).single())?.data?.role;

    if (role === 'admin') {
      navigate("/admin");
    } else {
      navigate("/customer");
    }
  };

  const handleAccountSettings = () => {
    navigate("/account-settings");
  };

  return (
    <header className=" sticky top-0 z-50 w-full px-6 py-4 bg-white shadow flex justify-between items-center">
      {/* Left: Logo & Name */}
      <div className="flex items-center space-x-2">
        <img
          src="/logo.png"
          alt="Logo"
          className="w-8 h-8 rounded-full object-contain"
        />
        <span className="text-lg font-bold text-custom">BYTE & BREW</span>
      </div>

      {/* Right: User Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <UserCircle2 className="w-5 h-5" />
            Profile
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto">
          {/* User email as first item */}
          {userEmail && (
            <div className="px-2 py-1.5 text-sm font-medium text-gray-700">
              {userEmail}
            </div>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleNavigateToDashboard}>
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAccountSettings}>
            <Settings className="w-4 h-4 mr-2" />
            Account Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}