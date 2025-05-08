import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react";

export default function AccountSettings() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Password validation states
  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
    match: false,
  });

  const validatePassword = (pass: string) => {
    setPasswordErrors({
      ...passwordErrors,
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
      match: pass === confirmPassword && pass.length > 0,
    });
  };

  const validateConfirmPassword = (confirmPass: string) => {
    setPasswordErrors({
      ...passwordErrors,
      match: confirmPass === newPassword && confirmPass.length > 0,
    });
  };

  const isPasswordValid = () => {
    return (
      passwordErrors.length &&
      passwordErrors.uppercase &&
      passwordErrors.lowercase &&
      passwordErrors.number &&
      passwordErrors.specialChar &&
      passwordErrors.match
    );
  };

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUser(user); // Set the user state
          setEmail(user.email ?? "");

          const { data: profile, error } = await supabase
            .from("profiles")
            .select("full_name, role")
            .eq("id", user.id)
            .single();

          if (!error && profile) {
            setFullName(profile.full_name || "");
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error("Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error(authError?.message || "User not authenticated");
      }

      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email });
        if (emailError) throw new Error(emailError.message);
      }

      const { data: currentProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (fetchError) throw new Error(fetchError.message);

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: fullName,
        role: currentProfile?.role || "customer",
        updated_at: new Date().toISOString(),
      });

      if (profileError) throw new Error(profileError.message);

      toast.success("Account settings updated successfully");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!isPasswordValid()) {
      toast.error("Password does not meet all requirements");
      return;
    }

    setIsPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
        data: { currentPassword },
      });

      if (error) throw error;

      toast.success("Password changed successfully");
      setOpenPasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setPasswordErrors({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        specialChar: false,
        match: false,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to change password");
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Account Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t px-6 py-4">
              <Button
                onClick={handleSave}
                disabled={isLoading || (!email && !fullName)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column - Account Security */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                {user?.app_metadata?.provider === "google"
                  ? "Google account security settings"
                  : "Change your password and security settings"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user?.app_metadata?.provider === "google" ? (
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      You signed in with Google. Password management is handled
                      by your Google account. To change your password, please
                      update it through your Google account settings.
                    </p>
                  </div>
                ) : (
                  <AlertDialog
                    open={openPasswordDialog}
                    onOpenChange={(open) => {
                      if (!open) {
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setPasswordErrors({
                          length: false,
                          uppercase: false,
                          lowercase: false,
                          number: false,
                          specialChar: false,
                          match: false,
                        });
                      }
                      setOpenPasswordDialog(open);
                    }}
                  >
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        Change Password
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Change Password</AlertDialogTitle>
                        <AlertDialogDescription>
                          Enter your current password and set a new one.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">
                            Current Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type={showCurrentPassword ? "text" : "password"}
                              value={currentPassword}
                              onChange={(e) =>
                                setCurrentPassword(e.target.value)
                              }
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              className="absolute right-2 top-2.5 text-muted-foreground hover:text-primary"
                              onClick={() =>
                                setShowCurrentPassword(!showCurrentPassword)
                              }
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={showNewPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => {
                                setNewPassword(e.target.value);
                                validatePassword(e.target.value);
                              }}
                              placeholder="Enter new password"
                            />
                            <button
                              type="button"
                              className="absolute right-2 top-2.5 text-muted-foreground hover:text-primary"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">
                            Confirm New Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                validateConfirmPassword(e.target.value);
                              }}
                              placeholder="Confirm new password"
                            />
                            <button
                              type="button"
                              className="absolute right-2 top-2.5 text-muted-foreground hover:text-primary"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Password Requirements */}
                        <div className="space-y-2 text-sm">
                          <p className="font-medium">Password Requirements:</p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            {/* Left Column */}
                            <div className="space-y-1">
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
                            </div>

                            {/* Right Column */}
                            <div className="space-y-1">
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
                              <li className="flex items-center">
                                {passwordErrors.match ? (
                                  <Check className="w-4 h-4 text-green-500 mr-2" />
                                ) : (
                                  <X className="w-4 h-4 text-red-500 mr-2" />
                                )}
                                Passwords match
                              </li>
                            </div>
                          </div>
                        </div>
                      </div>

                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPasswordLoading}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handlePasswordChange}
                          disabled={
                            isPasswordLoading ||
                            !currentPassword ||
                            !newPassword ||
                            !confirmPassword ||
                            !isPasswordValid()
                          }
                        >
                          {isPasswordLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            "Change Password"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
