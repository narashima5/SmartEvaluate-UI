import { useState, useEffect } from 'react';
import { Trophy, RefreshCw, AlertCircle, Medal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { domains } from '../types';
import type { Team, Domain } from '../types';

interface LeaderboardTeam extends Team {
    total_score: number;
}

export default function Leaderboard() {
    const { token, user } = useAuth();
    const [teams, setTeams] = useState<LeaderboardTeam[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDomain, setSelectedDomain] = useState<Domain | 'All'>('All');

    const fetchLeaderboard = async () => {
        if (!token) return;

        setIsLoading(true);
        setError(null);

        try {
            // For admin, append domain query param if not 'All'
            let url = `/api/leaderboard`;
            if (user?.role === 'admin' && selectedDomain !== 'All') {
                url += `?domain=${encodeURIComponent(selectedDomain)}`;
            }

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch leaderboard');
            }

            const data = await response.json();
            setTeams(data);
        } catch (err: any) {
            setError(err.message || 'An error occurred while fetching leaderboard data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
        // Set up polling every 30 seconds
        const intervalId = setInterval(fetchLeaderboard, 30000);
        return () => clearInterval(intervalId);
    }, [token, selectedDomain, user?.role]);

    // Role-based domain filtering is only available to admins
    const isAdmin = user?.role === 'admin';

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50 p-6 rounded-2xl border border-white/5 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-yellow-500" />
                        Leaderboard
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {isAdmin ? 'View rankings across all domains or filter by specific domain.' : `View rankings for ${user?.target_domain}.`}
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {isAdmin && (
                        <select
                            value={selectedDomain}
                            onChange={(e) => setSelectedDomain(e.target.value as Domain | 'All')}
                            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-colors"
                        >
                            <option value="All">All Domains</option>
                            {domains.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    )}
                    <button
                        onClick={fetchLeaderboard}
                        className="p-2.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-all active:scale-95 flex-shrink-0"
                        title="Refresh Data"
                        disabled={isLoading}
                    >
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
                    </button>
                </div>
            </header>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Leaderboard Content */}
            <div className="bg-slate-900/50 rounded-2xl border border-white/5 backdrop-blur-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-white/5">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold text-center w-24">Rank</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Team Details</th>
                                <th scope="col" className="px-6 py-4 font-semibold hidden md:table-cell">Domain</th>
                                <th scope="col" className="px-6 py-4 font-semibold text-right">Avg Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading && teams.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                            <span className="text-slate-400 font-medium">Loading leaderboard data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : teams.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <Trophy className="w-12 h-12 text-slate-600" />
                                            <span className="text-slate-400 font-medium">No teams found for the selected view.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                teams.map((team, index) => (
                                    <tr
                                        key={team.id}
                                        className={`transition-colors duration-200 group
                                            ${index === 0 ? 'bg-yellow-500/5 hover:bg-yellow-500/10' :
                                                index === 1 ? 'bg-slate-300/5 hover:bg-slate-300/10' :
                                                    index === 2 ? 'bg-orange-500/5 hover:bg-orange-500/10' :
                                                        'hover:bg-white/5'}`
                                        }
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center">
                                                {index === 0 && <Medal className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />}
                                                {index === 1 && <Medal className="w-7 h-7 text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.4)]" />}
                                                {index === 2 && <Medal className="w-6 h-6 text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.4)]" />}
                                                {index > 2 && (
                                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 border border-white/5">
                                                        {index + 1}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className={`font-bold text-base transition-colors
                                                    ${index === 0 ? 'text-yellow-400' :
                                                        index === 1 ? 'text-slate-200' :
                                                            index === 2 ? 'text-orange-300' :
                                                                'text-white group-hover:text-blue-400'}`}
                                                >
                                                    {team.name}
                                                </span>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                                    <span className="truncate max-w-[200px]" title={team.college}>
                                                        {team.college || 'N/A'}
                                                    </span>
                                                    {team.location && (
                                                        <>
                                                            <span className="w-1 h-1 rounded-full bg-slate-600" />
                                                            <span>{team.location}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Mobile Domain View */}
                                            <div className="md:hidden mt-2 inline-block px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-medium tracking-wide">
                                                {team.domain}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium tracking-wide">
                                                {team.domain}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className={`text-xl font-bold font-mono tracking-tight
                                                ${index === 0 ? 'text-yellow-400' :
                                                    index === 1 ? 'text-slate-200' :
                                                        index === 2 ? 'text-orange-300' :
                                                            'text-emerald-400'}`}
                                            >
                                                {Math.round((team.total_score || 0) / 3)}
                                            </div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">pts</div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
