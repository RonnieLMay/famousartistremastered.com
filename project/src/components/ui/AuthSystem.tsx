import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface AuthState {
  email: string;
  password: string;
  isSignUp: boolean;
  error: string;
  loading: boolean;
  showDialog: boolean;
}

const AuthSystem: React.FC = () => {
  const [state, setState] = useState<AuthState>({
    email: "",
    password: "",
    isSignUp: true,
    error: "",
    loading: false,
    showDialog: false,
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, loading: true, error: "" }));

    try {
      if (state.isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: state.email,
          password: state.password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: state.email,
          password: state.password,
        });
        if (error) throw error;
      }

      setState(prev => ({ ...prev, showDialog: false }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <>
      <Button
        onClick={() => setState(prev => ({ ...prev, showDialog: true }))}
        className="absolute top-4 left-4 bg-blue-600 hover:bg-blue-500"
      >
        Sign In
      </Button>

      <Dialog open={state.showDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showDialog: open }))}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{state.isSignUp ? "Create Account" : "Sign In"}</DialogTitle>
          </DialogHeader>

          <motion.form
            onSubmit={handleAuth}
            className="space-y-4 mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={state.email}
                onChange={(e) => setState(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={state.password}
                onChange={(e) => setState(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>

            {state.error && (
              <p className="text-sm text-red-500">{state.error}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={state.loading}
            >
              {state.loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Loading...
                </div>
              ) : state.isSignUp ? "Sign Up" : "Sign In"}
            </Button>

            <p className="text-sm text-center">
              {state.isSignUp ? "Already have an account?" : "Need an account?"}{" "}
              <button
                type="button"
                onClick={() => setState(prev => ({ ...prev, isSignUp: !prev.isSignUp }))}
                className="text-blue-500 hover:text-blue-400"
              >
                {state.isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </motion.form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AuthSystem;