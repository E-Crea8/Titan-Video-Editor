import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/auth', { replace: true });
          return;
        }

        // Successfully authenticated
        navigate('/editor', { replace: true });
      } catch (err) {
        console.error('Auth callback error:', err);
        navigate('/auth', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return <LoadingScreen message="Completing sign in..." />;
}

