
const Footer = () => {
  const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'League Rules', href: '/league-rules' },
  { label: 'Skill Level', href: '/skill-level' },
  { label: 'Tennis Clubs', href: '/tennis-clubs' },
  { label: 'Interest List', href: '/interest-list' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Use', href: '/terms-of-use' },
  { label: 'Contact Us', href: '/contact-us' },
  { label: 'Sitemap', href: '/sitemap' }];


  return (
    <footer className="bg-green-600 text-white">
      {/* Links Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center gap-6">
          {footerLinks.map((link, index) =>
          <a
            key={link.label}
            href={link.href}
            className="text-white hover:text-green-200 transition-colors text-sm">

              {link.label}
            </a>
          )}
        </div>
      </div>

      {/* Copyright Section */}
      <div className="bg-gray-800 py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-300">
            Copyright © 2025{' '}
            <a
              href="https://tennisleague.com"
              className="text-white hover:text-green-400 transition-colors">

              TennisLeague.com
            </a>
            . All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>);

};

export default Footer;