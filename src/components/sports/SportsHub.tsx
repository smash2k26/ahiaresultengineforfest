import React, { useState } from 'react';
import {
  Activity02Icon as Activity,
  Search01Icon as Search,
  FilterIcon as Filter,
  Calendar01Icon as Calendar,
  Clock01Icon as Clock,
  Location01Icon as MapPin,
  Award01Icon as Trophy,
  Tick01Icon as CheckCircle2,
  RadioIcon as Radio,
  FireIcon as Flame,
  ArrowRight01Icon as ArrowRight,
  UserGroupIcon as Users,
} from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { GlassCard, GlassBadge, GlassButton } from '../ui/GlassCard';
import { SportsMatch, ArtsProgram } from '../../types/festival';
import { ActiveTab } from '../layout/Sidebar';
import { TeamLogo } from '../ui/TeamLogo';
import { isSportsProgram } from '../../utils/programHelpers';

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
  const sportsEvents = artsPrograms.filter((p) => isSportsProgram(p));

  const filteredMatches = sportsMatches.filter((m) => {
    const q = (search || '').toLowerCase();
    const matchesSearch =
      !q ||
      String(m.title || '').toLowerCase().includes(q) ||
      String(m.sport || '').toLowerCase().includes(q) ||
      String(m.venue || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredEvents = sportsEvents.filter((p) => {
    const q = (search || '').toLowerCase();
    const matchesSearch =
      !q ||
      String(p.name || '').toLowerCase().includes(q) ||
      String(p.stage || '').toLowerCase().includes(q) ||
      String(p.venue || '').toLowerCase().includes(q) ||
      String(p.code || '').toLowerCase().includes(q) ||
      String(p.category || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const liveMatches = sportsMatches.filter((m) => m.status === 'LIVE');
  const completedMatches = sportsMatches.filter((m) => m.status === 'COMPLETED');
  const liveEvents = sportsEvents.filter((e) => e.status === 'LIVE');
  const completedEvents = sportsEvents.filter((e) => e.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      {/* Sports Header Banner (White Card) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md shadow-slate-200/50 relative overflow-hidden text-slate-900">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200">
                <Activity className="w-3.5 h-3.5 text-sky-600" />
                ATHLETICS & SPORTS ARENA
              </span>
              <span className="text-xs text-sky-700 font-mono font-semibold">Live Score Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
              Sports Arena & Tournament Scoreboards
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
              &ldquo;House glory on the turf.&rdquo; Follow live tournament matches, athletic track events, cricket showdowns, and house standings in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center min-w-[84px]">
              <div className="text-xl font-bold font-mono text-sky-600">
                {sportsMatches.length + sportsEvents.length}
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Items</div>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center min-w-[84px]">
              <div className="text-xl font-bold font-mono text-red-600">
                {liveMatches.length + liveEvents.length}
              </div>
              <div className="text-[10px] text-red-700 uppercase font-bold">Live Now</div>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center min-w-[84px]">
              <div className="text-xl font-bold font-mono text-emerald-600">
                {completedMatches.length + completedEvents.length}
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Finished</div>
            </div>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-slate-100">
          <button
            onClick={() => setActiveView('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm ${
              activeView === 'all'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>All Sports ({sportsMatches.length + sportsEvents.length})</span>
          </button>
          <button
            onClick={() => setActiveView('matches')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm ${
              activeView === 'matches'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Tournament Matches ({sportsMatches.length})</span>
          </button>
          <button
            onClick={() => setActiveView('events')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm ${
              activeView === 'events'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Athletics & Scored Events ({sportsEvents.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar (White Card) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search sports, event code, match round, venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs self-start md:self-auto">
            {(['All', 'LIVE', 'COMPLETED', 'UPCOMING'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
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
                <Activity className="w-4 h-4 text-sky-600" />
                <h2 className="text-base sm:text-lg font-bold font-display text-slate-900">
                  Tournament Matches & Arena Battles
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-mono font-semibold">
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
                  className={`p-5 rounded-2xl bg-white border transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${
                    isLive ? 'border-sky-500/60 bg-sky-50/30 shadow-sky-500/10' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Match Header */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200">
                          {match.sport}
                        </span>
                        <span className="text-xs font-bold text-slate-600">{match.round}</span>
                      </div>

                      {isLive && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 animate-pulse">
                          LIVE SCORE
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Final Verdict
                        </span>
                      )}
                      {!isLive && !isCompleted && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          Upcoming
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold font-display text-slate-900 group-hover:text-sky-600 transition-colors">
                      {match.title}
                    </h3>

                    {/* Scoreboard Box */}
                    <div className="my-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      {/* Team A */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <TeamLogo logo={teamA?.logo} name={teamA?.name} color={teamA?.color} size="xl" fallbackEmoji="🛡️" />
                        <div className="truncate">
                          <div className="text-sm font-bold text-slate-900 truncate">
                            {teamA?.name || 'Team A'}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono font-medium">
                            {teamA?.shortCode} • {match.scoreA}
                          </div>
                        </div>
                      </div>

                      {/* Scoreboard Center */}
                      <div className="px-4 text-center shrink-0">
                        <div className="text-2xl sm:text-3xl font-black font-display font-mono text-slate-900 tracking-widest">
                          {match.scoreA} : {match.scoreB}
                        </div>
                        {isLive && match.matchTimer && (
                          <span className="text-[10px] font-mono text-red-600 font-bold block animate-pulse">
                            {match.matchTimer.minute}&apos;
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[10px] font-mono text-emerald-700 font-bold block">
                            FT
                          </span>
                        )}
                      </div>

                      {/* Team B */}
                      <div className="flex items-center gap-3 flex-1 min-w-0 justify-end text-right">
                        <div className="truncate">
                          <div className="text-sm font-bold text-slate-900 truncate">
                            {teamB?.name || 'Team B'}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono font-medium">
                            {teamB?.shortCode} • {match.scoreB}
                          </div>
                        </div>
                        <TeamLogo logo={teamB?.logo} name={teamB?.name} color={teamB?.color} size="xl" fallbackEmoji="⚔️" />
                      </div>
                    </div>

                    {/* Venue & Time metadata */}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-sky-500" />
                        {match.venue}
                      </span>
                      <span className="flex items-center gap-1 font-mono font-medium">
                        <Clock className="w-3.5 h-3.5 text-sky-500" />
                        {match.time}
                      </span>
                    </div>

                    {/* Winner Notice if completed */}
                    {isCompleted && winnerTeam && (
                      <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Trophy className="w-3.5 h-3.5 text-amber-600" />
                          <span>Winner: {winnerTeam.name}</span>
                        </div>
                        <span className="font-mono font-bold text-amber-800">+{match.pointsToWinner ?? (match.pointsAwardedA || 15)} House Points</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Referees: {match.referees && match.referees.length > 0 ? match.referees.join(', ') : 'Official Panel'}
                    </span>
                    <button
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        isLive
                          ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {isLive ? 'Live Match Center' : 'Match Details'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMatches.length === 0 && activeView === 'matches' && (
            <div className="py-16 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <Activity className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-900">No Sports Matches Found</h3>
              <p className="text-xs text-slate-500 mt-1">Try selecting &ldquo;All&rdquo; or clearing the search query.</p>
            </div>
          )}
        </div>
      )}

      {/* ATHLETICS & SCORED EVENTS SECTION */}
      {(activeView === 'all' || activeView === 'events') && (sportsEvents.length > 0 || activeView === 'events') && (
        <div className="space-y-4 pt-2">
          {activeView === 'all' && (
            <div className="flex items-center justify-between pb-1 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h2 className="text-base sm:text-lg font-bold font-display text-slate-900">
                  Athletics, Track & Field Programs
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-mono font-semibold">
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
                  className={`p-5 rounded-2xl bg-white border transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${
                    isLive ? 'border-sky-500/60 bg-sky-50/30 shadow-sky-500/10' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200">
                          {prog.code}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">{prog.category}</span>
                      </div>
                      {isLive && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 animate-pulse">
                          LIVE TRACK
                        </span>
                      )}
                      {isCompleted && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isPublished
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {isPublished ? 'Published' : 'Results Pending'}
                        </span>
                      )}
                      {!isLive && !isCompleted && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          Upcoming
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold font-display text-slate-900 group-hover:text-sky-600 transition-colors">
                      {prog.name}
                    </h3>

                    <div className="space-y-1.5 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-sky-500" />
                        <span>{prog.stage || prog.venue || 'Ground Arena'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-mono">
                          <Clock className="w-3.5 h-3.5 text-sky-500" />
                          {prog.date} {prog.time}
                        </span>
                        <span className="text-slate-500 font-medium">{prog.section}</span>
                      </div>
                    </div>

                    {isPublished && firstPlace && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold truncate">
                          <Trophy className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">1st: {firstPlace.participantName} ({firstPlace.chestNo})</span>
                        </div>
                        <span className="font-mono font-bold text-amber-700 shrink-0">+{firstPlace.points || 10} pts</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-mono">
                      {prog.results?.length || 0} participants recorded
                    </span>
                    <button className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer">
                      View Event
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredEvents.length === 0 && activeView === 'events' && (
            <div className="py-16 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <Trophy className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-900">No Athletics Events Found</h3>
              <p className="text-xs text-slate-500 mt-1">Try clearing filters or check back later.</p>
            </div>
          )}
        </div>
      )}

      {/* When All is empty */}
      {activeView === 'all' && filteredMatches.length === 0 && filteredEvents.length === 0 && (
        <div className="py-16 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <Activity className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900">No Sports Items Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing the search query or status filter.</p>
        </div>
      )}
    </div>
  );
};
