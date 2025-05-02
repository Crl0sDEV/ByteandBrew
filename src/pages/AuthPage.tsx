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

  // Password validation states
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

  const handleAuth = async () => {
    setError("");

    if (isRegister && !isPasswordValid()) {
      setError("Password does not meet requirements");
      toast.error("Password does not meet requirements");
      return;
    }

    if (isRegister) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role: "customer" },
        },
      });

      if (data.user) {
        await supabase
          .from("profiles")
          .insert([{ id: data.user.id, email, role: "customer" }]);

        toast.success("Registration successful! Please check your email.");
      }

      if (error) {
        setError(error.message);
        toast.error(error.message);
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        toast.error(error.message);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        setError("Failed to fetch user profile.");
        toast.error("Failed to fetch user profile.");
        return;
      }

      toast.success("Login successful!");

      if (profile?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/customer");
      }
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) {
      setError(error.message);
      toast.error(error.message);
    } else {
      toast.success("Redirecting to Google login...");
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
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#4b8e3f]"
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
                <div className="space-y-2 text-sm bg-white/80 p-4 rounded-lg">
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
                        At least one uppercase letter
                      </span>
                    </li>
                    <li className="flex items-center">
                      {passwordErrors.lowercase ? (
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <X className="w-4 h-4 text-red-500 mr-2" />
                      )}
                      <span className={passwordErrors.lowercase ? "text-gray-700" : "text-gray-500"}>
                        At least one lowercase letter
                      </span>
                    </li>
                    <li className="flex items-center">
                      {passwordErrors.number ? (
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <X className="w-4 h-4 text-red-500 mr-2" />
                      )}
                      <span className={passwordErrors.number ? "text-gray-700" : "text-gray-500"}>
                        At least one number
                      </span>
                    </li>
                    <li className="flex items-center">
                      {passwordErrors.specialChar ? (
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <X className="w-4 h-4 text-red-500 mr-2" />
                      )}
                      <span className={passwordErrors.specialChar ? "text-gray-700" : "text-gray-500"}>
                        At least one special character
                      </span>
                    </li>
                  </ul>
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
                disabled={isRegister && !isPasswordValid()}
              >
                {isRegister ? "Create Account" : "Sign In"}
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