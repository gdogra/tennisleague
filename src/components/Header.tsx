import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, User, ShoppingCart, LogOut, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { maybeNotify } from '@/lib/notify';
import backend from '@/lib/backendClient';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [memberInfo, setMemberInfo] = useState<any>(null);
  const [challengeCount, setChallengeCount] = useState(0);
  const prevChallengeCount = useRef(0);
  const { toast } = useToast();

  const mainNavItems = [
  { label: 'Home', href: '/' },
  { label: 'Seasons', href: '/seasons' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'League Rules', href: '/league-rules' },
  { label: 'Skill Level', href: '/skill-level' },
  { label: 'Tennis Clubs', href: '/tennis-clubs' },
  { label: 'Courts', href: '/courts' },
  { label: 'Courts Map', href: '/courts/map' },
  { label: 'Interest List', href: '/interest-list' },
  { label: 'Contact Us', href: '/contact-us' },
  { label: 'View Previous Seasons', href: '/previous-seasons' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Players', href: '/players' },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'Challenges', href: '/challenges' }];


  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const userResult = await backend.auth.getUserInfo();
      if (!userResult.error && userResult.data) {
        setUser(userResult.data);
        await loadMemberInfo(userResult.data);
      }
    } catch (error) {


      // User not logged in, this is expected
    } finally {setIsLoading(false);}
  };

  const loadMemberInfo = async (userData: any) => {
    try {
      const { data: member, error: memberError } = await backend.members.getByUserId(userData.ID);

      if (!memberError && member) {
        setMemberInfo(member);
        await loadCartItemCount(member.id);
      }
    } catch (error) {
      console.error('Error loading member info:', error);
    }
  };

  const loadCartItemCount = async (memberId: number) => {
    try {
      const { data: cartData, error: cartError } = await backend.cart.list(memberId);

      if (!cartError && cartData) {
        const totalItems = cartData.reduce((sum: number, item: any) => sum + item.quantity, 0);
        setCartItemCount(totalItems);
      }
    } catch (error) {
      console.error('Error loading cart count:', error);
    }
  };

  const loadChallengeCount = async (memberId: number) => {
    try {
      const { data, error } = await backend.challenges.listForMember(memberId);
      if (!error && data) {
        const pending = (data.incoming || []).filter((c: any) => c.status === 'Pending').length;
        if (pending > prevChallengeCount.current) {
          toast({
            title: 'New Challenge',
            description: `You have ${pending} pending challenge${pending === 1 ? '' : 's'}.`
          });
          maybeNotify('New Challenge', `You have ${pending} pending challenge${pending === 1 ? '' : 's'}.`);
        }
        prevChallengeCount.current = pending;
        setChallengeCount(pending);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    if (memberInfo?.id) {
      loadChallengeCount(memberInfo.id);
      const id = setInterval(() => loadChallengeCount(memberInfo.id), 30000);
      return () => clearInterval(id);
    }
  }, [memberInfo]);

  const handleLogout = async () => {
    try {
      const result = await backend.auth.logout();
      if (result.error) {
        throw new Error(result.error);
      }

      setUser(null);
      setMemberInfo(null);
      setCartItemCount(0);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
      });

      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "An error occurred during logout.",
        variant: "destructive"
      });
    }
  };


  return (
    <header className="bg-gray-800 text-white">
      {/* Top Bar */}
      <div className="bg-gray-900">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-end space-x-6 text-sm">
            {!isLoading &&
            <>
                {user ?
              <>
                    <span className="flex items-center text-green-400">
                      <User className="w-4 h-4 mr-1" />
                      Welcome, {user.Name}
                    </span>
                    <a href="/profile" className="hover:text-green-400 transition-colors">
                      Profile
                    </a>
                    <a href="/order-history" className="hover:text-green-400 transition-colors flex items-center">
                      <Package className="w-4 h-4 mr-1" />
                      Orders
                    </a>
                    <a href="/outbox" className="hover:text-green-400 transition-colors">
                      Notifications
                    </a>
                    <a href="/admin/challenges" className="hover:text-green-400 transition-colors">
                      Admin
                    </a>
                    <button
                  onClick={handleLogout}
                  className="hover:text-green-400 transition-colors flex items-center">
                      <LogOut className="w-4 h-4 mr-1" />
                      Logout
                    </button>
                  </> :

              <>
                    <a href="/members/memberlogin" className="hover:text-green-400 transition-colors flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      Login
                    </a>
                    <a href="/registration" className="hover:text-green-400 transition-colors">
                      Register
                    </a>
                  </>
              }
                <a href="/cart" className="hover:text-green-400 transition-colors flex items-center relative">
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Cart
                </a>
              </>
            }
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              <a href="/" className="hover:text-green-400 transition-colors">
                Tennis League San Diego
              </a>
            </h1>
            <p className="text-sm text-gray-300 mt-1">A California Original Since 1990</p>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-6">
            {mainNavItems.map((item) => {
              const isChallenges = item.label === 'Challenges';
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-white hover:text-green-400 transition-colors py-2 px-3 rounded flex items-center">
                  <span>{item.label}</span>
                  {isChallenges && challengeCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 px-2 flex items-center justify-center">
                      {challengeCount > 99 ? '99+' : challengeCount}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:text-green-400">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  {/* User-specific links */}
                  {user &&
                  <div className="border-b pb-4 mb-4">
                      <a
                      href="/cart"
                      className="text-lg font-medium hover:text-green-600 transition-colors py-2 flex items-center"
                      onClick={() => setIsOpen(false)}>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Cart
                        {cartItemCount > 0 &&
                      <span className="ml-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {cartItemCount > 99 ? '99+' : cartItemCount}
                          </span>
                      }
                      </a>
                      <a
                      href="/order-history"
                      className="text-lg font-medium hover:text-green-600 transition-colors py-2 flex items-center"
                      onClick={() => setIsOpen(false)}>
                        <Package className="w-5 h-5 mr-2" />
                        Order History
                      </a>
                    </div>
                  }
                  
                  {/* Main navigation items */}
                  {mainNavItems.map((item) => {
                    const isChallenges = item.label === 'Challenges';
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        className="text-lg font-medium hover:text-green-600 transition-colors py-2 flex items-center"
                        onClick={() => setIsOpen(false)}>
                        <span>{item.label}</span>
                        {isChallenges && challengeCount > 0 && (
                          <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 px-2 flex items-center justify-center">
                            {challengeCount > 99 ? '99+' : challengeCount}
                          </span>
                        )}
                      </a>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>);

};

export default Header;
