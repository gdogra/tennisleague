
import { Mail, Phone, User, Facebook } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ContactSidebar = () => {
  return (
    <div className="bg-gray-100 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Contact Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800">
                Tennis League San Diego
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-700">
                <User className="w-5 h-5 text-green-600" />
                <span>Director: Steve de la Torre</span>
              </div>
              
              <div className="flex items-center space-x-3 text-gray-700">
                <Mail className="w-5 h-5 text-green-600" />
                <a
                  href="mailto:Play@TennisLeague.com"
                  className="text-blue-600 hover:text-blue-800 transition-colors">

                  Play@TennisLeague.com
                </a>
              </div>
              
              <div className="flex items-center space-x-3 text-gray-700">
                <Phone className="w-5 h-5 text-green-600" />
                <a
                  href="tel:619-846-1125"
                  className="text-blue-600 hover:text-blue-800 transition-colors">

                  619-846-1125
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Follow Us */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800">
                Follow Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <a
                  href="https://www.facebook.com/Tennis-League-San-Diego-1561321747460447"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors p-2 bg-blue-50 rounded-full hover:bg-blue-100">

                  <Facebook className="w-6 h-6" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>);

};

export default ContactSidebar;