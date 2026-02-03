import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, Settings, User } from "lucide-react";
import { Link } from "react-router-dom";

const Profile = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState<string | ArrayBuffer | null>(
    null
  );

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image: string | ArrayBuffer | null = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="glass rounded-3xl p-8 space-y-8 fade-scale-in">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gradient-primary mb-2">
              Profile
            </h1>
            <p className="text-muted-foreground">
              Manage your account information
            </p>
          </div>

          {/* Avatar upload section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-white/20 shadow-elegant"
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-gradient-primary hover:scale-110
                  p-3 rounded-full cursor-pointer 
                  transition-all duration-200 shadow-elegant
                  ${
                    isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                  }
                `}
              >
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-muted-foreground">
              {isUpdatingProfile
                ? "Uploading..."
                : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <div className="px-4 py-3 rounded-xl border border-white/20">
                {authUser?.fullName}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <div className="px-4 py-3 rounded-xl border border-white/20">
                {authUser?.email}
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold text-gradient-primary mb-4">
              Account Information
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between py-2  border-white/10">
                <span className="text-muted-foreground">Member Since</span>
                <span className="font-medium">
                  {authUser.createdAt?.split("T")[0]}
                </span>
              </div>
              {/* <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Account Status</span>
                <span className="text-emerald-400 font-medium">Active</span>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
