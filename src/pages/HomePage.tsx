
import { Trophy, Users, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import MemberLogin from '@/components/MemberLogin';
import ContactSidebar from '@/components/ContactSidebar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import backend from '@/lib/backendClient';

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await backend.categories.list();
        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
        } else if (categoriesData) {
          const categoriesMap: Record<number, string> = {};
          categoriesData.forEach((category: any) => {
            categoriesMap[category.id] = category.name;
          });
          setCategories(categoriesMap);
        }

        // Fetch products (limit to 6 for home)
        const { data: productsData, error: productsError } = await backend.products.list();
        if (productsError) {
          console.error('Error fetching products:', productsError);
          toast.error('Failed to load products');
        } else {
          setProducts((productsData || []).slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Main Content Area */}
      <main role="main" className="flex-1">
        {/* Hero/Welcome Section - keeping it minimal like the original */}
        <section className="bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Welcome to Tennis League San Diego
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Join San Diego's premier tennis league community. Connect with players, 
                improve your game, and compete in organized league play since 1990.
              </p>
            </div>
          </div>
        </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Tennis League San Diego?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Competitive Play</h3>
              <p className="text-gray-600">Join skilled players in exciting league matches throughout San Diego.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community</h3>
              <p className="text-gray-600">Connect with tennis enthusiasts and build lasting friendships.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Prime Locations</h3>
              <p className="text-gray-600">Play at the best tennis clubs across San Diego County.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            League Merchandise
          </h2>
          {loading ?
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) =>
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="aspect-square bg-gray-200 animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 animate-pulse rounded" />
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
                    <div className="h-8 bg-gray-200 animate-pulse rounded" />
                  </div>
                </div>
              )}
            </div> :
            products.length > 0 ?
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {products.map((product: any) =>
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image_url || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
                  category: categories[product.category_id] || 'General',
                  description: product.description
                }} />

              )}
            </div> :

            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No products available at the moment.</p>
              <p className="text-sm text-gray-500">Please check back later!</p>
            </div>
            }
        </div>
      </section>

        {/* Member Login Section */}
        <MemberLogin />
        
        {/* Contact Information */}
        <ContactSidebar />
      </main>
      
      <Footer />
    </div>);

};

export default HomePage;
