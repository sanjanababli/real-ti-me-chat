import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, User, LogOut, Cog } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed w-full top-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-6 h-16">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-sm">
                <MessageSquare className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-text-primary tracking-tight">
                ChatVibe
              </h1>
              <p className="text-xs text-text-muted -mt-0.5">
                Professional Messaging
              </p>
            </div>
          </Link>

          {/* User Avatar & Hover Menu */}
          {authUser && (
            <div
              className="relative"
              onMouseEnter={() => setIsMenuOpen(true)}
              onMouseLeave={() => setIsMenuOpen(false)}
            >
              {/* Avatar (The Trigger) */}
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden cursor-pointer">
                {authUser.profilePic ? (
                  <img
                    src={authUser.profilePic}
                    alt={authUser.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-primary" />
                )}
              </div>

              {/* Dropdown Menu (Conditionally Visible) */}
              <div
                className={`absolute top-full right-0 mt-0 w-48 bg-muted rounded-lg shadow-lg p-2 z-20 transition-all duration-200 ease-in-out transform ${
                  isMenuOpen
                    ? "opacity-100 bg-primary/10 scale-100 visible"
                    : "opacity-0 scale-95 invisible"
                }`}
              >
                <div className="flex flex-col gap-1">
                  <Link
                    to="/profile"
                    className="flex hover:bg-secondary/80 items-center gap-3 w-full text-left px-3 py-2 rounded-md hover:bg-muted-foreground/10 transition-colors text-sm font-medium text-text-secondary hover:text-text-primary"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>

                  <Link
                    to="/settings"
                    className="flex hover:bg-secondary/80 items-center gap-3 w-full text-left px-3 py-2 rounded-md hover:bg-muted-foreground/10 transition-colors text-sm font-medium text-text-secondary hover:text-text-primary"
                  >
                    <Cog className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>

                  <button
                    className="flex items-center hover:bg-secondary/80 gap-3 w-full text-left px-3 py-2 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors text-sm font-medium text-text-secondary"
                    onClick={logout}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
