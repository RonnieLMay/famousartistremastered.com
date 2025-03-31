import React, { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface AuthError {
  message: string;
}

const AuthSystem: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

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
        throw error;
      }

      setMessage('Check your email for the confirmation link.');
    } catch (error) {
      const authError = error as AuthError;
      setMessage(authError.message || 'An error occurred during sign up.');
    } finally {
      setLoading(false);
    }
  };

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
        throw error;
      }

      navigate('/dashboard');
    } catch (error) {
      const authError = error as AuthError;
      setMessage(authError.message || 'An error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          disabled={loading}
        />
      </div>
      <div className="space-y-4">
        <Button
          onClick={handleSignIn}
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Sign In'}
        </Button>
        <Button
          onClick={handleSignUp}
          variant="outline"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Sign Up'}
        </Button>
      </div>
      {message && (
        <p className="text-sm text-red-500">{message}</p>
      )}
    </div>
  );
};

export default AuthSystem;