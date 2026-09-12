import React, { useState } from 'react';
import { Activity02Icon as Activity, Search01Icon as Search, FilterIcon as Filter, Calendar01Icon as Calendar, Clock01Icon as Clock, Location01Icon as MapPin, Award01Icon as Trophy, Tick01Icon as CheckCircle2, RadioIcon as Radio, FireIcon as Flame, ArrowRight01Icon as ArrowRight, UserGroupIcon as Users } from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { GlassCard, GlassBadge, GlassButton } from '../ui/GlassCard';
import { SportsMatch, ArtsProgram } from '../../types/festival';
import { ActiveTab } from '../layout/Sidebar';
import { TeamLogo } from '../ui/TeamLogo';

interface SportsHubProps {
  onOpenSportsDetail: (match: SportsMatch) => void;
  onOpenArtsDetail?: (program: ArtsProgram) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const SportsHub: React.FC<SportsHubProps> = ({
  onOpenSportsDetail,
  onOpenArtsDetail,
  setActiveTab,
}) => {
  const { sportsMatches, teams, artsPrograms } = useFestival();
  const [activeView, setActiveView] = useState<'all' | 'matches' | 'events'>('all');
  const [statusFilter, setStatusFilter] = useState<'All' | 'LIVE' | 'COMPLETED' | 'UPCOMING'>('All');
  const [search, setSearch] = useState('');

  // Sports programs (e.g. Athletics, 100m, Relay, Shot Put scored by points/places)
  const sportsEvents = artsPrograms.filter((p) => p.disciplineType === 'Sports');

  const filteredMatches = sportsMatches.filter((m) => {
    const q = (search || '').toLowerCase();
    const matchesSearch =
      !q ||
      (m.title || '').toLowerCase().includes(q) ||
      (m.sport || '').toLowerCase().includes(q) ||
      (m.venue || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredEvents = sportsEvents.filter((p) => {
    const q = (search || '').toLowerCase();
    const matchesSearch =
      !q ||
      (p.name || '').toLowerCase().includes(q) ||
      (p.stage || '').toLowerCase().includes(q) ||
      (p.venue || '').toLowerCase().includes(q) ||
      (p.code || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const liveMatches = sportsMatches.filter((m) => m.status === 'LIVE');
  const completedMatches = sportsMatches.filter((m) => m.status === 'COMPLETED');
  const liveEvents = sportsEvents.filter((e) => e.status === 'LIVE');
  const completedEvents = sportsEvents.filter((e) => e.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      {/* Sports Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-sky-950/40 via-[#111318] to-[#0A0C10] border border-sky-500/20 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <GlassBadge variant="sports" size="sm">
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                ATHLETICS & SPORTS ARENA
              </GlassBadge>
              <span className="text-xs text-sky-300/80 font-mono">Live Score Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
              Sports Arena & Tournament Scoreboards
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
              &ldquo;House glory on the turf.&rdquo; Follow live tournament matches, athletic track events, cricket showdowns, and house standings in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/8 text-center">
              <div className="text-xl font-bold font-mono text-sky-400">
                {sportsMatches.length + sportsEvents.length}
              </div>
              <div className="text-[10px] text-gray-400 uppercase">Total Items</div>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/8 text-center">
              <div className="text-xl font-bold font-mono text-red-400">
                {liveMatches.length + liveEvents.length}
              </div>
              <div className="text-[10px] text-gray-400 uppercase">Live Now</div>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/8 text-center">
              <div className="text-xl font-bold font-mono text-emerald-400">
                {completedMatches.length + completedEvents.length}
              </div>
              <div className="text-[10px] text-gray-400 uppercase">Finished</div>
            </div>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-white/10">
          <button
            onClick={() => setActiveView('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeView === 'all'
                ? 'bg-sky-500 text-gray-950 shadow-lg shadow-sky-500/20'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>All Sports ({sportsMatches.length + sportsEvents.length})</span>
          </button>
          <button
            onClick={() => setActiveView('matches')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeView === 'matches'
                ? 'bg-sky-500 text-gray-950 shadow-lg shadow-sky-500/20'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Tournament Matches ({sportsMatches.length})</span>
          </button>
          <button
            onClick={() => setActiveView('events')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeView === 'events'
                ? 'bg-sky-500 text-gray-950 shadow-lg shadow-sky-500/20'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Athletics & Scored Events ({sportsEvents.length})</span>
          </button>
        </div>
      </div>

      {/* Filter Bar without extra pills div */}
      <div className="p-4 rounded-2xl bg-[#111318]/90 border border-white/8 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search sports, event code, match round, venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-sky-500/50"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/8 text-xs self-start md:self-auto">
            {(['All', 'LIVE', 'COMPLETED', 'UPCOMING'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-sky-500 text-gray-950 font-bold shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TOURNAMENT MATCHES SECTION */}
      {(activeView === 'all' || activeView === 'matches') && (
        <div className="space-y-4">
          {activeView === 'all' && (
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <h2 className="text-base sm:text-lg font-bold font-display text-white">
                  Tournament Matches & Arena Battles
                </h2>
              </div>
              <span className="text-xs text-gray-400 font-mono">
                {filteredMatches.length} Matches
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMatches.map((match, idx) => {
              const teamA = teams.find((t) => t.id === match.teamAId);
              const teamB = teams.find((t) => t.id === match.teamBId);
              const winnerTeam = match.winnerId ? teams.find((t) => t.id === match.winnerId) : null;
              const isLive = match.status === 'LIVE';
              const isCompleted = match.status === 'COMPLETED';

              return (
                <div
                  key={match.id ? `sh-match-${match.id}-${idx}` : `sh-match-${idx}`}
                  onClick={() => onOpenSportsDetail(match)}
                  className={`p-5 rounded-2xl bg-[#111318]/90 border backdrop-blur-xl hover:border-sky-500/40 transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4 ${
                    isLive ? 'border-sky-500/40 shadow-xl shadow-sky-950/30' : 'border-white/8'
                  }`}
                >
                  <div>
                    {/* Match Header */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <GlassBadge variant="sports" size="xs">
                          {match.sport}
                        </GlassBadge>
                        <span className="text-xs font-bold text-gray-300">{match.round}</span>
                      </div>

                      {isLive && (
                        <GlassBadge variant="live" size="xs" pulse>
                          LIVE SCORE
                        </GlassBadge>
                      )}
                      {isCompleted && (
                        <GlassBadge variant="success" size="xs">
                          Final Verdict
                        </GlassBadge>
                      )}
                      {!isLive && !isCompleted && (
                        <GlassBadge variant="neutral" size="xs">
                          Upcoming
                        </GlassBadge>
                      )}
                    </div>

                    <h3 className="text-base font-bold font-display text-white group-hover:text-sky-300 transition-colors">
                      {match.title}
                    </h3>

                    {/* Scoreboard Box */}
                    <div className="my-3 p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                      {/* Team A */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <TeamLogo logo={teamA?.logo} name={teamA?.name} color={teamA?.color} size="xl" fallbackEmoji="🛡️" />
                        <div className="truncate">
                          <div className="text-sm font-bold text-white truncate">
                            {teamA?.name || 'Team A'}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            {teamA?.shortCode} • {match.scoreA}
                          </div>
                        </div>
                      </div>

                      {/* Scoreboard Center */}
                      <div className="px-4 text-center shrink-0">
                        <div className="text-2xl sm:text-3xl font-black font-display font-mono text-white tracking-widest">
                          {match.scoreA} : {match.scoreB}
                        </div>
                        {isLive && match.matchTimer && (
                          <span className="text-[10px] font-mono text-red-400 font-bold block animate-pulse">
                            {match.matchTimer.minute}&apos;
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                            FT
                          </span>
                        )}
                      </div>

                      {/* Team B */}
                      <div className="flex items-center gap-3 flex-1 min-w-0 justify-end text-right">
                        <div className="truncate">
                          <div className="text-sm font-bold text-white truncate">
                            {teamB?.name || 'Team B'}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            {teamB?.shortCode} • {match.scoreB}
                          </div>
                        </div>
                        <TeamLogo logo={teamB?.logo} name={teamB?.name} color={teamB?.color} size="xl" fallbackEmoji="⚔️" />
                      </div>
                    </div>

                    {/* Venue & Time metadata */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-sky-400" />
                        {match.venue}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-sky-400" />
                        {match.time}
                      </span>
                    </div>

                    {/* Winner Notice if completed */}
                    {isCompleted && winnerTeam && (
                      <div className="mt-3 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          <span>Winner: {winnerTeam.name}</span>
                        </div>
                        <span className="font-mono font-bold">+{match.pointsToWinner ?? (match.pointsAwardedA || 15)} House Points</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] text-gray-500">
                      Referees: {match.referees && match.referees.length > 0 ? match.referees.join(', ') : 'Official Panel'}
                    </span>
                    <GlassButton variant={isLive ? 'sports' : 'secondary'} size="sm">
                      {isLive ? 'Live Match Center' : 'Match Details'}
                    </GlassButton>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMatches.length === 0 && activeView === 'matches' && (
            <div className="py-16 text-center text-gray-400 bg-white/[0.01] rounded-3xl border border-white/5">
              <Activity className="w-10 h-10 text-sky-400/40 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white">No Sports Matches Found</h3>
              <p className="text-xs text-gray-500 mt-1">Try selecting &ldquo;All&rdquo; or clearing the search query.</p>
            </div>
          )}
        </div>
      )}

      {/* ATHLETICS & SCORED EVENTS SECTION */}
      {(activeView === 'all' || activeView === 'events') && (sportsEvents.length > 0 || activeView === 'events') && (
        <div className="space-y-4 pt-2">
          {activeView === 'all' && (
            <div className="flex items-center justify-between pb-1 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h2 className="text-base sm:text-lg font-bold font-display text-white">
                  Athletics, Track & Field Programs
                </h2>
              </div>
              <span className="text-xs text-gray-400 font-mono">
                {filteredEvents.length} Events
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((prog, idx) => {
              const isLive = prog.status === 'LIVE';
              const isCompleted = prog.status === 'COMPLETED';
              const isPublished = prog.publishStatus === 'Published';
              const firstPlace = (prog.results || []).find((r) => r.position === '1st' || r.position === '1');

              return (
                <div
                  key={prog.id ? `sh-event-${prog.id}-${idx}` : `sh-event-${idx}`}
                  onClick={() => onOpenArtsDetail?.(prog)}
                  className={`p-5 rounded-2xl bg-[#111318]/90 border backdrop-blur-xl hover:border-sky-500/40 transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4 ${
                    isLive ? 'border-sky-500/40 shadow-xl shadow-sky-950/30' : 'border-white/8'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <GlassBadge variant="sports" size="xs">
                          {prog.code}
                        </GlassBadge>
                        <span className="text-xs font-semibold text-gray-400">{prog.category}</span>
                      </div>
                      {isLive && (
                        <GlassBadge variant="live" size="xs" pulse>
                          LIVE TRACK
                        </GlassBadge>
                      )}
                      {isCompleted && (
                        <GlassBadge variant={isPublished ? 'success' : 'neutral'} size="xs">
                          {isPublished ? 'Published' : 'Results Pending'}
                        </GlassBadge>
                      )}
                      {!isLive && !isCompleted && (
                        <GlassBadge variant="neutral" size="xs">
                          Upcoming
                        </GlassBadge>
                      )}
                    </div>

                    <h3 className="text-base font-bold font-display text-white group-hover:text-sky-300 transition-colors">
                      {prog.name}
                    </h3>

                    <div className="space-y-1.5 text-xs text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-sky-400" />
                        <span>{prog.stage || prog.venue || 'Ground Arena'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-mono">
                          <Clock className="w-3.5 h-3.5 text-sky-400" />
                          {prog.date} {prog.time}
                        </span>
                        <span className="text-gray-500">{prog.section}</span>
                      </div>
                    </div>

                    {isPublished && firstPlace && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold truncate">
                          <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">1st: {firstPlace.participantName} ({firstPlace.chestNo})</span>
                        </div>
                        <span className="font-mono font-bold text-amber-400 shrink-0">+{firstPlace.points || 10} pts</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] text-gray-500 font-mono">
                      {prog.results?.length || 0} participants recorded
                    </span>
                    <GlassButton variant={isLive ? 'sports' : 'secondary'} size="sm">
                      View Event
                    </GlassButton>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredEvents.length === 0 && activeView === 'events' && (
            <div className="py-16 text-center text-gray-400 bg-white/[0.01] rounded-3xl border border-white/5">
              <Trophy className="w-10 h-10 text-sky-400/40 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white">No Athletics Events Found</h3>
              <p className="text-xs text-gray-500 mt-1">Try clearing filters or check back later.</p>
            </div>
          )}
        </div>
      )}

      {/* When All is empty */}
      {activeView === 'all' && filteredMatches.length === 0 && filteredEvents.length === 0 && (
        <div className="py-16 text-center text-gray-400 bg-white/[0.01] rounded-3xl border border-white/5">
          <Activity className="w-10 h-10 text-sky-400/40 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white">No Sports Items Found</h3>
          <p className="text-xs text-gray-500 mt-1">Try clearing the search query or status filter.</p>
        </div>
      )}
    </div>
  );
};
