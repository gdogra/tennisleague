import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import backend from '@/lib/backend';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      toast({
        title: "Invalid Link",
        description: "Reset password link is invalid or expired.",
        variant: "destructive"
      });
      navigate('/members/memberlogin');
    }
  }, [searchParams, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!password || password.length < 8) {
        toast({
          title: "Password Required",
          description: "Password must be at least 8 characters long.",
          variant: "destructive"
        });
        return;
      }

      if (password !== confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match.",
          variant: "destructive"
        });
        return;
      }

      const result = await backend.auth.resetPassword({
        token: token,
        password: password
      });

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated. Redirecting to login page."
      });

      setTimeout(() => {
        navigate('/members/memberlogin');
      }, 2000);

    } catch (error) {
      console.error('Reset password error:', error);
      toast({
        title: "Reset Failed",
        description: typeof error === 'string' ? error : "Failed to reset password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-800">
                Reset Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="password"
                    placeholder="New Password (min 8 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                    required />

                </div>
                
                <div>
                  <Input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full"
                    required />

                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2"
                  disabled={isLoading}>

                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>

              <div className="text-center mt-6">
                <a
                  href="/members/memberlogin"
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors">

                  Back to Login
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>);

};

export default ResetPasswordPage;
