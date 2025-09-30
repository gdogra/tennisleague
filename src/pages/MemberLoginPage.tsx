import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import ContactSidebar from '@/components/ContactSidebar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import backend from '@/lib/backendClient';
import { useNavigate } from 'react-router-dom';

const MemberLoginPage = () => {
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
          description: "Please enter both email and password.",
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
        description: "Welcome back! Redirecting to your dashboard."
      });

      // Redirect to home page after successful login
      setTimeout(() => {
        navigate('/');
      }, 1500);

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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-1 flex">
        {/* Main content */}
        <main className="flex-1 py-16 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-6">
                Login to Secure Players Area
              </h1>
              
              <h3 className="text-lg text-gray-600 mb-6">
                Please enter the e-mail address you registered with:
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                    placeholder="Enter your email address"
                    required />
                  
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                    placeholder="Enter your password"
                    required />

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white">

                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </div>
              </form>
              
              <div className="mt-6">
                <a
                  href="/forgot-password"
                  className="text-blue-600 hover:text-blue-800 transition-colors text-sm">

                  Forgot password?<br />
                  Currently Registered, Activated Members Only
                </a>
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="hidden lg:block w-80">
          <ContactSidebar />
        </aside>
      </div>

      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <ContactSidebar />
      </div>

      <Footer />
    </div>);

};

export default MemberLoginPage;
