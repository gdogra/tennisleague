import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactSidebar from "@/components/ContactSidebar";

interface TennisClub {
  name: string;
  location: string;
  phone?: string;
  website?: string;
}

const TennisClubsPage = () => {
  const tennisClubs: TennisClub[] = [
  // Left Column
  { name: "BALBOA TENNIS CLUB", location: "San Diego", phone: "619-295-4242" },
  { name: "BARNES TENNIS CENTER", location: "San Diego", phone: "619-221-9000" },
  { name: "BAYPOINT TENNIS", location: "Pacific Beach", phone: "619-992-0023" },
  { name: "BOBBY RIGGS TENNIS CLUB", location: "Encinitas", phone: "760-753-4705" },
  { name: "BONITA VALLEY TENNIS CLUB", location: "Bonita", phone: "619-475-3111" },
  { name: "CANYON HILL SWIM & RACKET", location: "Escondido", phone: "760-743-3601" },
  { name: "CHULA VISTA TENNIS CENTER", location: "Chula Vista", phone: "619-421-6622" },
  { name: "CORONADO ISLAND MARRIOTT", location: "Coronado", phone: "619-435-3000" },
  { name: "CORONADO SHORES", location: "Coronado", phone: "619-437-1335" },
  { name: "CORONADO TENNIS CENTER", location: "Coronado", phone: "619-522-2650" },
  { name: "DEL MAR COUNTRY CLUB", location: "", phone: "858-759-5512" },
  { name: "EAST COUNTY COMMUNITY TENNIS", location: "La Mesa", phone: "619-912-4934" },
  { name: "EL CAMINO RACQUET FITNESS", location: "Oceanside", phone: "760-757-9190" },
  { name: "FOLSOM TENNIS CLUB", location: "San Diego", phone: "619-280-7182" },
  { name: "HANDLERY SWIM & TENNIS CLUB", location: "San Diego", phone: "619-298-0511" },
  { name: "HELIX SOUTH TENNIS CLUB", location: "Spring Valley", phone: "619-465-0155" },
  { name: "LA CASA DEL ZORRO", location: "Borrego Springs", phone: "760-767-5323" },
  { name: "LA COSTA RACQUET CLUB", location: "Carlsbad", phone: "760-931-7501" },
  { name: "LAKE MURRAY TENNIS CLUB", location: "La Mesa", phone: "619-469-3232" },
  { name: "LA JOLLA TENNIS ACADEMY", location: "La Jolla", phone: "858-459-9125" },
  { name: "LOMAS SANTA FE COUNTRY CLUB", location: "Solana Beach", phone: "858-755-4090" },
  { name: "MORGAN RUN RESORT & CLUB", location: "Rancho Santa Fe", phone: "858-759-0994" },
  { name: "OLYMPIC RESORT & CLUB", location: "Carlsbad", phone: "760-438-8330" },
  { name: "PACIFIC BEACH TENNIS CLUB", location: "Pacific Beach", phone: "858-274-0912" },
  { name: "PALA MESA TENNIS CLUB", location: "Fallbrook", phone: "760-723-5571" },
  { name: "PARKWAY SPORTS CENTER", location: "El Cajon", phone: "619-442-9623" },
  { name: "PENINSULA ATHLETIC CLUB", location: "San Diego", phone: "619-224-4644" },

  // Right Column  
  { name: "PENINSULA TENNIS CLUB", location: "San Diego", phone: "619-226-3407" },
  { name: "RANCHO ARBOLITOS TENNIS", location: "Rancho Bernardo", phone: "619-486-3670" },
  { name: "RANCHO BERNARDO COMMUNITY", location: "Rancho Bernardo", phone: "619-487-9698" },
  { name: "RANCHO BERNARDO INN", location: "Rancho Bernardo", phone: "858-675-8474" },
  { name: "RANCHO BERNARDO TENNIS", location: "Rancho Bernardo", phone: "619-487-5084" },
  { name: "RANCHO PENASQUITOS TENNIS CENTER", location: "San Diego", phone: "858-484-0745" },
  { name: "RANCHO SANTA FE TENNIS CLUB", location: "Rancho Santa Fe", phone: "858-756-4459" },
  { name: "RANCHO VALENCIA RESORT", location: "Rancho Santa Fe", phone: "858-759-6224" },
  { name: "SINGING HILLS RESORT & CLUB", location: "El Cajon", phone: "619-442-3425" },
  { name: "SAN DIEGO SINGLES TENNIS CLUB", location: "San Diego", phone: "619-492-8939" },
  { name: "SAN DIEGO TENNIS LEAGUE", location: "San Diego County", phone: "619-846-1125" },
  { name: "SAN DIEGO TENNIS & RACQUET", location: "San Diego", phone: "619-275-3270" },
  { name: "SAN DIEGUITO TENNIS CLUB", location: "Encinitas", phone: "760-942-9725" },
  { name: "San Diego District Tennis", location: "", website: "www.tennissandiego.com" },
  { name: "SCRIPPS RANCH SWIM & RACQUET", location: "San Diego", phone: "858-271-4231" },
  { name: "SCRIPPS RANCH SWIM & RACQUET", location: "San Diego", phone: "858-271-6222" },
  { name: "SEABLUFF VILLAGE COMMUNITY", location: "Leucadia", phone: "760-436-2496" },
  { name: "SURF & TURF TENNIS CLUB", location: "Del Mar", phone: "858-755-5435" },
  { name: "TENNIS LA JOLLA", location: "La Jolla", phone: "858-459-0869" },
  { name: "TIERRASANTA TENNIS CLUB", location: "San Diego", phone: "619-278-3009" },
  { name: "UNIVERSITY CITY RACQUET CLUB", location: "San Diego", phone: "619-452-5683" },
  { name: "VALLEY CENTER TENNIS CLUB", location: "Valley Center", phone: "760-749-7616" },
  { name: "TENNIS CLUB OF VISTA", location: "Vista", phone: "760-726-4406" },
  { name: "YMCA OF SAN DIEGO COUNTY", location: "Encinitas", phone: "760-942-9622" },
  { name: "YMCA OF SAN DIEGO COUNTY", location: "San Diego", phone: "619-264-0144" },
  { name: "YMCA OF SAN DIEGO COUNTY", location: "La Jolla", phone: "858-453-3483" },
  { name: "YMCA OF SAN DIEGO COUNTY", location: "Mission Valley", phone: "619-298-3576" },
  { name: "TENNIS LEAGUE SAN DIEGO", location: "San Diego County", phone: "619-846-1125" }];


  const leftColumnClubs = tennisClubs.slice(0, Math.ceil(tennisClubs.length / 2));
  const rightColumnClubs = tennisClubs.slice(Math.ceil(tennisClubs.length / 2));

  const TennisClubCard = ({ club }: {club: TennisClub;}) =>
  <div className="mb-4">
      <p className="text-sm leading-relaxed">
        <strong className="font-bold text-black">{club.name}</strong>
        {club.location &&
      <>
            <br />
            {club.location}
            {club.phone && ` ${club.phone}`}
          </>
      }
        {club.website &&
      <>
            <br />
            <span className="text-blue-600">{club.website}</span>
          </>
      }
        {!club.location && club.phone &&
      <>
            <br />
            {club.phone}
          </>
      }
      </p>
    </div>;


  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="flex flex-col lg:flex-row">
        {/* Main Content */}
        <main className="flex-1 px-4 py-8 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-black mb-8">Tennis Clubs</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {/* Left Column */}
              <div className="space-y-2">
                {leftColumnClubs.map((club, index) =>
                <TennisClubCard key={`left-${index}`} club={club} />
                )}
              </div>
              
              {/* Right Column */}
              <div className="space-y-2">
                {rightColumnClubs.map((club, index) =>
                <TennisClubCard key={`right-${index}`} club={club} />
                )}
              </div>
            </div>
          </div>
        </main>
        
        {/* Sidebar */}
        <ContactSidebar />
      </div>
      
      <Footer />
    </div>);

};

export default TennisClubsPage;