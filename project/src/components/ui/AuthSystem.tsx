import React, { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface AuthSystemProps {
  onSignIn: () => void;
}

const AuthSystem: React.FC<AuthSystemProps> = ({ onSignIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      onSignIn();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage('Success! Please check your email for verification.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <form className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {message && (
          <p className={`text-sm ${message.includes('Success') ? 'text-green-500' : 'text-red-500'}`}>
            {message}
          </p>
        )}
        <div className="flex gap-4">
          <Button
            type="submit"
            onClick={handleSignIn}
            disabled={loading}
            className="flex-1"
          >
            Sign In
          </Button>
          <Button
            type="button"
            onClick={handleSignUp}
            disabled={loading}
            variant="outline"
            className="flex-1"
          >
            Sign Up
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AuthSystem;