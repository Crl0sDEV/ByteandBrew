import { LogOut, Settings, LayoutDashboard, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    setIsMobileMenuOpen(false);
  };

  const handleAccountSettings = () => {
    navigate("/account-settings-customer");
    setIsMobileMenuOpen(false);
  };

  // More precise active route checking
  const isDashboardActive = ['/dashboard', '/admin', '/customer'].includes(location.pathname);
  const isSettingsActive = location.pathname === '/account-settings-customer';

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 py-4 bg-white shadow flex justify-between items-center">
      {/* Left: Logo & Name */}
      <div className="flex items-center space-x-2">
        <img
          src="/logo.png"
          alt="Logo"
          className="w-8 h-8 rounded-full object-contain"
        />
        <span className="text-lg font-bold text-custom">BYTE & BREW</span>
      </div>

      {/* Desktop Navigation (hidden on mobile) */}
      <div className="hidden md:flex items-center space-x-4">
        <Button 
          variant="ghost" 
          className={`flex items-center gap-2 rounded-none ${isDashboardActive ? 'border-b-2 border-primary' : ''}`}
          onClick={handleNavigateToDashboard}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className={`flex items-center gap-2 rounded-none ${isSettingsActive ? 'border-b-2 border-primary' : ''}`}
          onClick={handleAccountSettings}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 text-red-500 hover:text-red-600 rounded-none"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </div>

      {/* Mobile Menu Button (visible only on mobile) */}
      <div className="md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="w-4 h-4" />
        </Button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 right-4 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <button
            onClick={handleNavigateToDashboard}
            className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${isDashboardActive ? 'bg-gray-100 text-primary' : 'text-gray-700'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          
          <button
            onClick={handleAccountSettings}
            className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${isSettingsActive ? 'bg-gray-100 text-primary' : 'text-gray-700'}`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-red-500 hover:bg-gray-100"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </header>
  );
}