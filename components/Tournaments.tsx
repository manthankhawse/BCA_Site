import { connectDB } from '@/lib/mongodb';
import { Tournament } from '@/models/Tournament';
import { Calendar, MapPin, Trophy, ExternalLink, Globe } from 'lucide-react';
import Link from 'next/link';

export default async function Tournaments() {
  await connectDB();
  
  // Fetch up to 3 upcoming tournaments
  const upcomingTournaments = await Tournament.find({ status: 'upcoming' })
    .sort({ startDate: 1 })
    .limit(3)
    .lean();

  return (
    <section className="py-20 px-6 max-w-6xl mx-auto" id="tournaments">
      <div className="flex flex-col items-center gap-4 mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          BCA&apos;s Upcoming Tournaments
        </h2>
        <div className="h-[3px] w-16 bg-amber-500 rounded-full" />
        <p className="text-gray-400 max-w-2xl mt-4">
          Test your skills and compete against players of all levels in our upcoming tournaments. Register now and join the battle!
        </p>
      </div>

      {upcomingTournaments.length === 0 ? (
        <div className="text-center py-16 bg-[#1a1a1a] rounded-2xl border border-white/5">
          <Trophy size={48} className="mx-auto text-gray-600 mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-gray-300">No Upcoming Tournaments</h3>
          <p className="text-gray-500 mt-2">Check back later for new events!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingTournaments.map((tournament: any) => (
            <div key={tournament._id.toString()} className="bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all group flex flex-col h-full">
              {tournament.thumbnail ? (
                <div className="h-48 w-full overflow-hidden bg-black/50">
                  <img src={tournament.thumbnail} alt={tournament.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ) : (
                <div className="h-48 w-full bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center border-b border-white/5">
                  <Trophy size={48} className="text-amber-500/20" />
                </div>
              )}
              
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 capitalize border border-amber-500/20">
                    {tournament.format}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 capitalize border border-blue-500/20">
                    {tournament.type.replace('_', ' ')}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-amber-400 transition-colors">
                  {tournament.name}
                </h3>
                
                {tournament.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {tournament.description}
                  </p>
                )}
                
                <div className="mt-auto space-y-2.5 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Calendar size={16} className="text-gray-500" />
                    <span>{new Date(tournament.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    {tournament.locationType === 'online' ? (
                      <Globe size={16} className="text-gray-500" />
                    ) : (
                      <MapPin size={16} className="text-gray-500" />
                    )}
                    <span className="capitalize">{tournament.locationType} {tournament.venue ? `- ${tournament.venue}` : tournament.platform ? `- ${tournament.platform}` : ''}</span>
                  </div>
                  
                  {tournament.entryFee && (
                    <div className="flex items-center gap-3 text-sm font-medium text-amber-400">
                      <span>🎟️</span>
                      <span>Fee: {tournament.entryFee}</span>
                    </div>
                  )}
                </div>
                
                {tournament.registrationLink ? (
                  <a href={tournament.registrationLink} target="_blank" rel="noopener noreferrer" className="mt-auto block w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-xl text-center transition-colors flex items-center justify-center gap-2">
                    Register Now <ExternalLink size={16} />
                  </a>
                ) : (
                  <div className="mt-auto block w-full bg-white/5 text-gray-400 font-medium py-3 rounded-xl text-center border border-white/5 cursor-not-allowed">
                    Registration Closed
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Divider Line */}
      <div className="h-[1px] w-full max-w-4xl mx-auto my-24 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}
