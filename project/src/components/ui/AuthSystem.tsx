import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './button';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const AuthSystem: React.FC = () => {
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google'
      });

      if (signInError) {
        throw signInError;
      }

      if (data) {
        navigate('/dashboard');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Authentication error:', error.message);
      } else {
        console.error('Unknown authentication error');
      }
    }
  };

  return (
    <Button onClick={handleSignIn} className="w-full">
      Sign in with Google
    </Button>
  );
};

export default AuthSystem;