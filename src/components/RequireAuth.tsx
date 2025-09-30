import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backend from '@/lib/backend';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const { data } = await backend.auth.getUserInfo();
      if (!data) {
        navigate('/members/memberlogin');
        return;
      }
      setChecking(false);
    };
    check();
  }, [navigate]);

  if (checking) return null;
  return <>{children}</>;
}

