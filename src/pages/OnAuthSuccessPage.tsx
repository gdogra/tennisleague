import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckCircle } from 'lucide-react';

const OnAuthSuccessPage = () => {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/members/memberlogin');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Registration Verified!
            </h1>
            
            <p className="text-gray-600 mb-6">
              Your email has been successfully verified and your account is now active.
            </p>
            
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <p className="text-green-800 text-sm">
                Redirecting to login page in <span className="font-bold">{countdown}</span> seconds...
              </p>
            </div>
            
            <button
              onClick={() => navigate('/members/memberlogin')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors">

              Go to Login Now
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>);

};

export default OnAuthSuccessPage;