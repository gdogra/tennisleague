import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backend from '@/lib/backend';

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const { data: user } = await backend.auth.getUserInfo();
      if (!user) { navigate('/members/memberlogin'); return; }
      const { data: isAdmin } = await backend.auth.isAdmin();
      if (!isAdmin) { navigate('/'); return; }
      setOk(true);
    };
    check();
  }, [navigate]);

  if (!ok) return null;
  return <>{children}</>;
}

