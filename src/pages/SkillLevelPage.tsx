import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactSidebar from '@/components/ContactSidebar';

const SkillLevelPage = () => {
  const skillLevels = [
  {
    level: "1.0 BEGINNER:",
    description: "This player is just starting to play tennis."
  },
  {
    level: "1.5 BEGINNER:",
    description: "This player has limited playing experience and is still working primarily on getting the ball over the net and has some knowledge of scoring, but is not familiar with basic positions and procedures for singles and doubles play."
  },
  {
    level: "2.0 INTERMEDIATE BEGINNER:",
    description: "This player may have had some lessons, but needs on-court experience; has obvious stroke weaknesses, but is beginning to feel comfortable with singles and doubles play."
  },
  {
    level: "2.5 INTERMEDIATE BEGINNER:",
    description: "This player has more dependable strokes and is learning to judge where the ball is going; has weak court coverage or is often caught out of position, but is starting to keep the ball in play with other players of the same ability."
  },
  {
    level: "3.0 ADVANCED BEGINNER:",
    description: "This player can place shots with moderate success; can sustain a rally of slow pace, but is not comfortable with all strokes; lacks control when trying for power."
  },
  {
    level: "3.5 (= TLSD 3.6 Level) INTERMEDIATE D:",
    description: "This player has achieved stroke dependability and direction on shots within reach, including forehand and backhand volleys, but still lacks depth and variety; seldom double faults and occasionally forces errors on the serve."
  },
  {
    level: "4.0 CLASS C:",
    description: "This player has dependable strokes on both forehand and backhand sides; has the ability to use a variety of shots including lobs, overheads, approach shots and volleys; can place the first serve and force some errors; is seldom out of position in a doubles game."
  },
  {
    level: "4.5 CLASS B:",
    description: "This player has begun to master the use of power and spins; has found footwork; can control depth of shots and is able to rush the net with some success on serve in singles as well as doubles."
  },
  {
    level: "5.0 CLASS A:",
    description: "This player has good anticipation; frequently has an outstanding shot or exceptional consistency around which a game may be structured; can regularly hit winners or force errors off of short balls; can successfully execute lobs, drop shots, half volleys and overhead smashes; has good depth and spin on most second serves."
  },
  {
    level: "5.5 CLASS OPEN:",
    description: "This player can execute all strokes offensively and defensively; can hit dependable shots under pressure; is able to analyze opponents' styles and can employ patterns of play to assure the greatest possibility of winning points; can hit winners or force errors with both first and second serves. Return of serve can be an offensive weapon."
  },
  {
    level: "6.0 CLASS TOURNAMENT:",
    description: "Regional or national tournament ranking required."
  }];


  const sidebarLinks = [
  { label: "Home", href: "/" },
  { label: "League Rules", href: "/league-rules" },
  { label: "Skill Level", href: "/skill-level", active: true },
  { label: "Tennis Clubs", href: "/tennis-clubs" },
  { label: "Interest List", href: "/interest-list" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Use", href: "/terms-of-use" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "Sitemap", href: "/sitemap" }];


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-8">
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                  Skill Level Guide – National Tennis Rating Program (NTRP) & UTR Correlations
                </h1>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    <strong>Tennis League San Diego offers 4 NTRP Divisions. Note the approximate Universal Tennis Ratings (UTR) correlations):</strong>{" "}
                    3.6 (= UTR 2 – 3.5), 4.0 (= UTR 3.5 – 4.75), 4.5 (= UTR 4.75 – 6) & 5.0 (= UTR +6)
                  </h2>
                  <p className="text-gray-700">
                    All Divisions are co-ed and primarily adult. Advanced Junior players, aged 14 and over, may also compete in levels 4.0 and up.
                  </p>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">What Is Your Skill Level?</h2>
                </div>

                <div className="space-y-4">
                  {skillLevels.map((skill, index) =>
                  <div key={index} className="border-l-4 border-green-500 bg-gray-50 p-4 rounded-r-lg">
                      <p className="text-gray-800 leading-relaxed">
                        <strong className="text-gray-900">{skill.level}</strong>
                        <br />
                        {skill.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Sidebar */}
            <div className="lg:col-span-1">
              <ContactSidebar />
            </div>

            {/* Navigation Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <nav>
                  <ul className="space-y-3">
                    {sidebarLinks.map((link, index) =>
                    <li key={index}>
                        <a
                        href={link.href}
                        className={`block py-2 px-3 rounded-md transition-colors duration-200 ${
                        link.active ?
                        'bg-green-100 text-green-800 font-medium border-l-4 border-green-500' :
                        'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`
                        }>

                          {link.label}
                        </a>
                      </li>
                    )}
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>);

};

export default SkillLevelPage;