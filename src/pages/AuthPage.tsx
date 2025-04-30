import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { toast } from "sonner";

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
      <div className="hidden md:flex items-center justify-center bg-gray-100 h-full">
        <img
          src="/auth-illustration.jpg"
          alt="Auth"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Side Form */}
      <div className="flex items-center justify-center p-8 h-full overflow-auto">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <h2 className="text-xl font-bold text-center">
              {isRegister ? "Create an Account" : "Login to your Account"}
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {isRegister && (
              <div className="space-y-2 text-sm">
                <p className="font-medium">Password Requirements:</p>
                <ul className="space-y-1">
                  <li className="flex items-center">
                    {passwordErrors.length ? (
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <X className="w-4 h-4 text-red-500 mr-2" />
                    )}
                    At least 8 characters
                  </li>
                  <li className="flex items-center">
                    {passwordErrors.uppercase ? (
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <X className="w-4 h-4 text-red-500 mr-2" />
                    )}
                    At least one uppercase letter
                  </li>
                  <li className="flex items-center">
                    {passwordErrors.lowercase ? (
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <X className="w-4 h-4 text-red-500 mr-2" />
                    )}
                    At least one lowercase letter
                  </li>
                  <li className="flex items-center">
                    {passwordErrors.number ? (
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <X className="w-4 h-4 text-red-500 mr-2" />
                    )}
                    At least one number
                  </li>
                  <li className="flex items-center">
                    {passwordErrors.specialChar ? (
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <X className="w-4 h-4 text-red-500 mr-2" />
                    )}
                    At least one special character
                  </li>
                </ul>
              </div>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button 
              onClick={handleAuth} 
              className="w-full"
              disabled={isRegister && !isPasswordValid()}
            >
              {isRegister ? "Register" : "Login"}
            </Button>

            <div className="flex items-center gap-2">
              <div className="flex-grow border-t border-gray-300" />
              <span className="text-xs text-gray-500">or</span>
              <div className="flex-grow border-t border-gray-300" />
            </div>

            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </Button>

            <p className="text-center text-sm">
              {isRegister ? "Already have an account?" : "No account yet?"}{" "}
              <span
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
                className="text-blue-500 cursor-pointer hover:underline"
              >
                {isRegister ? "Login" : "Register"}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}