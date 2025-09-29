import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactSidebar from '@/components/ContactSidebar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ChampionsPage = () => {
  const [selectedSeason, setSelectedSeason] = useState('Summer');
  const [selectedYear, setSelectedYear] = useState('2025');

  const seasons = ['Winter', 'Spring', 'Summer', 'Fall'];
  const years = Array.from({ length: 20 }, (_, i) => (2025 - i).toString());

  const semiFinals = [
  { player1: 'Sam Hodges', player2: 'Edward Lei', winner: '' },
  { player1: 'Steve Firestone', player2: 'Abel Bituin', winner: 'Steve Firestone' }];


  const quarterFinals = [
  { player1: 'Steve Firestone', player2: 'Brandon Yaras', winner: 'Steve Firestone' },
  { player1: 'Justin Mitchell', player2: 'Abel Bituin', winner: 'Abel Bituin' },
  { player1: 'Michael Savvas', player2: 'Edward Lei', winner: 'Edward Lei' },
  { player1: 'Steven Orbuch', player2: 'Sam Hodges', winner: 'Sam Hodges' }];


  const divisions = [
  { name: '5.0', value: '5.0' },
  { name: '4.5', value: '4.5' },
  { name: '4.0', value: '4.0' },
  { name: '3.6', value: '3.6' },
  { name: '3.5', value: '3.5' }];


  const handleRefresh = () => {
    // In a real app, this would fetch new data based on selected season/year
    console.log(`Refreshing data for ${selectedSeason} ${selectedYear}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex flex-col lg:flex-row container mx-auto px-4 py-8 gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Season Selector */}
          <div className="bg-yellow-100 p-4 mb-6 rounded border">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-bold text-gray-800">Select Prior Season:</span>
              
              <div className="flex gap-2">
                <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map((season) =>
                    <SelectItem key={season} value={season}>
                        {season}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>

                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) =>
                    <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>

                <Button onClick={handleRefresh} variant="outline" size="sm">
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Tournament Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              4.5 Mens {selectedSeason} {selectedYear}
            </h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Playoffs / Current Standings / Scores
            </h2>
            <p className="text-gray-600 mb-6">Season incomplete. Please try other divisions.</p>
          </div>

          {/* Semi-Finals */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Semi-Finals ends on 09/28/2025
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-3 text-left font-semibold w-[30%]">Player</th>
                    <th className="border border-gray-300 p-3 text-center font-semibold w-[10%]">vs</th>
                    <th className="border border-gray-300 p-3 text-left font-semibold w-[30%]">Player</th>
                    <th className="border border-gray-300 p-3 text-left font-semibold w-[30%]">Winner</th>
                  </tr>
                </thead>
                <tbody>
                  {semiFinals.map((match, index) =>
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 p-3">
                        <span className="text-blue-600 hover:underline cursor-pointer">
                          {match.player1}
                        </span>
                      </td>
                      <td className="border border-gray-300 p-3 text-center">vs</td>
                      <td className="border border-gray-300 p-3">
                        <span className="text-blue-600 hover:underline cursor-pointer">
                          {match.player2}
                        </span>
                      </td>
                      <td className="border border-gray-300 p-3">
                        {match.winner &&
                      <span className="text-blue-600 hover:underline cursor-pointer">
                            {match.winner}
                          </span>
                      }
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quarter-Finals */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Quarter-Finals ends on 09/21/2025
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-3 text-left font-semibold w-[30%]">Player</th>
                    <th className="border border-gray-300 p-3 text-center font-semibold w-[10%]">vs</th>
                    <th className="border border-gray-300 p-3 text-left font-semibold w-[30%]">Player</th>
                    <th className="border border-gray-300 p-3 text-left font-semibold w-[30%]">Winner</th>
                  </tr>
                </thead>
                <tbody>
                  {quarterFinals.map((match, index) =>
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 p-3">
                        <span className="text-blue-600 hover:underline cursor-pointer">
                          {match.player1}
                        </span>
                      </td>
                      <td className="border border-gray-300 p-3 text-center">vs</td>
                      <td className="border border-gray-300 p-3">
                        <span className="text-blue-600 hover:underline cursor-pointer">
                          {match.player2}
                        </span>
                      </td>
                      <td className="border border-gray-300 p-3">
                        <span className="text-blue-600 hover:underline cursor-pointer">
                          {match.winner}
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Division Links */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              View Other Division Results
            </h3>
            <div className="flex flex-wrap gap-2">
              {divisions.map((division, index) =>
              <span key={division.value}>
                  <a
                  href={`/champions?division=${division.value}&gender=m&season=${selectedSeason}&year=${selectedYear}`}
                  className="text-blue-600 hover:underline">

                    {division.name}
                  </a>
                  {index < divisions.length - 1 && <span className="mx-2">-</span>}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-80">
          <ContactSidebar />
        </div>
      </div>

      <Footer />
    </div>);

};

export default ChampionsPage;