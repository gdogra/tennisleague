import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
        <p>Have questions? Email us at <a className="text-blue-600 underline" href="mailto:info@tennisleague.com">info@tennisleague.com</a> or call 619-846-1125.</p>
      </main>
      <Footer />
    </div>
  );
}

