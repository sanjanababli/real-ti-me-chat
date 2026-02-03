import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search, MessageSquare } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-6">
      <div className="glass rounded-3xl p-8 max-w-md w-full text-center fade-scale-in">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-primary rounded-2xl mx-auto mb-6 flex items-center justify-center pulse-glow">
            <Search className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-gradient-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            to="/"
            className="btn-glow w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>

          <Link
            to="/home"
            className="glass hover:bg-white/20 w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all border border-white/20"
          >
            <MessageSquare className="w-5 h-5" />
            Go to Chat
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
