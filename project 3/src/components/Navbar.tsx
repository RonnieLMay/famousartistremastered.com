import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Music4 } from "lucide-react";
import { useAuth } from "@/components/ui/AuthSystem";
import { Button } from "@/components/ui/button";

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <motion.nav
      className="fixed w-full z-40 top-0 left-0"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-[#050816]/40 backdrop-blur-sm border-b border-blue-500/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold hover-3d neon-text flex items-center gap-2">
            <Music4 className="h-8 w-8" />
            <span>FAR</span>
          </Link>
          
          <div className="flex items-center space-x-8">
            <Link 
              to="/" 
              className="hover-3d inline-block text-gray-300 hover:text-blue-400 transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/upload" 
              className="hover-3d inline-block text-gray-300 hover:text-blue-400 transition-colors"
            >
              Upload
            </Link>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-300">{user.email}</span>
                <Button 
                  variant="outline" 
                  onClick={() => signOut()}
                  className="hover-3d border-blue-500/30 hover:border-blue-500/50"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link to="/upload">
                <Button 
                  variant="outline"
                  className="hover-3d border-blue-500/30 hover:border-blue-500/50"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;