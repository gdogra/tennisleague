import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import backend from '@/lib/backendClient';
import { useNavigate } from 'react-router-dom';

const MemberLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email || !password) {
        toast({
          title: "Required Fields",
          description: "Please fill in all fields.",
          variant: "destructive"
        });
        return;
      }

      // Attempt login
      const loginResult = await backend.auth.login({
        email: email,
        password: password
      });

      if (loginResult.error) {
        throw new Error(loginResult.error);
      }

      toast({
        title: "Login Successful",
        description: "Welcome back!"
      });

      // Redirect to home page after successful login
      setTimeout(() => {
        navigate('/');
      }, 1000);

    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: typeof error === 'string' ? error : "Invalid email or password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-800">
                MEMBER LOGIN
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="sr-only">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                    required />

                </div>
                
                <div>
                  <Label htmlFor="password" className="sr-only">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                    required />

                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2"
                  disabled={isLoading}>

                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>

              <div className="text-center mt-6">
                <a
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors">

                  Forgot password?
                </a>
                <p className="text-xs text-gray-600 mt-2">
                  Currently Registered, Activated Members Only
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>);

};

export default MemberLogin;
