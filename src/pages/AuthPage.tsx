import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  
  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const validatePassword = (pass: string) => {
    setPasswordErrors({
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (isRegister) {
      validatePassword(newPassword);
    }
  };

  const isPasswordValid = () => {
    return (
      passwordErrors.length &&
      passwordErrors.uppercase &&
      passwordErrors.lowercase &&
      passwordErrors.number &&
      passwordErrors.specialChar
    );
  };

  
  const handleUserProfile = async (userId: string, userEmail: string) => {
    
    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) throw profileError;

    
    if (!existingProfile) {
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          email: userEmail,
          role: "customer",
          full_name: 'anonymous',
          created_at: new Date().toISOString()
        });

      if (upsertError) throw upsertError;
      return "customer";
    }

    return existingProfile.role;
  };

  const handleAuth = async () => {
    setError("");
    setIsLoading(true);

    try {
      if (isRegister && !isPasswordValid()) {
        throw new Error("Password does not meet requirements");
      }

      if (isRegister) {
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role: "customer" },
          },
        });

        if (error) throw error;

        if (data.user) {
          await handleUserProfile(data.user.id, email);
          toast.success("Registration successful! Please check your email.");
        }
      } else {
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        const userRole = await handleUserProfile(data.user.id, data.user.email!);
        toast.success("Login successful!");
        navigate(userRole === "admin" ? "/admin" : "/customer");
      }
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/auth/callback",
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) throw error;
      toast.success("Redirecting to Google...");
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden layout-background">
      {/* Left Side Image */}
      <div className="hidden md:flex items-center justify-center h-full relative overflow-hidden">
        <motion.img
          src="/auth-illustration.jpg"
          alt="Auth"
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white text-center"
          >
            <h1 className="text-4xl font-bold mb-4">Welcome to Byte & Brew</h1>
            <p className="text-xl">
              {isRegister 
                ? "Join our community of coffee and tech enthusiasts"
                : "Sign in to access your favorite brews and workspace"}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side Form */}
      <div className="flex items-center justify-center p-4 sm:p-8 h-full overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-md"
        >
          <Card className="w-full shadow-lg bg-white/95 backdrop-blur-sm border-0">
            <CardHeader>
              <h2 className="text-2xl font-bold text-center text-gray-800">
                {isRegister ? "Create an Account" : "Welcome Back"}
              </h2>
              <p className="text-center text-gray-600">
                {isRegister ? "Join our community today" : "Sign in to continue"}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/80 focus-visible:ring-2 focus-visible:ring-[#4b8e3f]"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={handlePasswordChange}
                    className="bg-white/80 focus-visible:ring-2 focus-visible:ring-[#4b8e3f] pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#4b8e3f]"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {isRegister && (
  <div className="grid grid-cols-2 gap-4 text-sm bg-white/80 p-4 rounded-lg">
    <div className="space-y-2">
      <p className="font-medium text-gray-700">Password Requirements:</p>
      <ul className="space-y-1">
        <li className="flex items-center">
          {passwordErrors.length ? (
            <Check className="w-4 h-4 text-green-500 mr-2" />
          ) : (
            <X className="w-4 h-4 text-red-500 mr-2" />
          )}
          <span className={passwordErrors.length ? "text-gray-700" : "text-gray-500"}>
            At least 8 characters
          </span>
        </li>
        <li className="flex items-center">
          {passwordErrors.uppercase ? (
            <Check className="w-4 h-4 text-green-500 mr-2" />
          ) : (
            <X className="w-4 h-4 text-red-500 mr-2" />
          )}
          <span className={passwordErrors.uppercase ? "text-gray-700" : "text-gray-500"}>
            One uppercase letter
          </span>
        </li>
        <li className="flex items-center">
          {passwordErrors.lowercase ? (
            <Check className="w-4 h-4 text-green-500 mr-2" />
          ) : (
            <X className="w-4 h-4 text-red-500 mr-2" />
          )}
          <span className={passwordErrors.lowercase ? "text-gray-700" : "text-gray-500"}>
            One lowercase letter
          </span>
        </li>
      </ul>
    </div>
    <div className="space-y-2">
      <p className="font-medium text-gray-700 opacity-0">Requirements</p>
      <ul className="space-y-1">
        <li className="flex items-center">
          {passwordErrors.number ? (
            <Check className="w-4 h-4 text-green-500 mr-2" />
          ) : (
            <X className="w-4 h-4 text-red-500 mr-2" />
          )}
          <span className={passwordErrors.number ? "text-gray-700" : "text-gray-500"}>
            One number
          </span>
        </li>
        <li className="flex items-center">
          {passwordErrors.specialChar ? (
            <Check className="w-4 h-4 text-green-500 mr-2" />
          ) : (
            <X className="w-4 h-4 text-red-500 mr-2" />
          )}
          <span className={passwordErrors.specialChar ? "text-gray-700" : "text-gray-500"}>
            One special character
          </span>
        </li>
      </ul>
    </div>
  </div>
)}

              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-2 rounded-md">
                  {error}
                </div>
              )}

              <Button 
                onClick={handleAuth} 
                className="w-full bg-[#4b8e3f] hover:bg-[#3a6d32]"
                disabled={(isRegister && !isPasswordValid()) || isLoading}
              >
                {isLoading ? "Processing..." : isRegister ? "Create Account" : "Sign In"}
              </Button>

              <div className="flex items-center gap-2">
                <div className="flex-grow border-t border-gray-300" />
                <span className="text-xs text-gray-500">or</span>
                <div className="flex-grow border-t border-gray-300" />
              </div>

              <Button
                onClick={handleGoogleLogin}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 border-gray-300 hover:border-[#4b8e3f]"
                disabled={isLoading}
              >
                <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
                Continue with Google
              </Button>

              <p className="text-center text-sm text-gray-600">
                {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setPasswordErrors({
                      length: false,
                      uppercase: false,
                      lowercase: false,
                      number: false,
                      specialChar: false,
                    });
                  }}
                  className="text-[#4b8e3f] font-medium hover:underline"
                  disabled={isLoading}
                >
                  {isRegister ? "Sign In" : "Sign Up"}
                </button>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}