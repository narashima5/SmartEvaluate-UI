import { useEffect, useState } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Users, CheckCircle, Lock } from 'lucide-react';
import { domains, type Team, type Domain, EVALUATION_CRITERIA, parseDomain } from '../data/mockData';
import { cn } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function Evaluate() {
    const { token } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDomain, setSelectedDomain] = useState<Domain | 'All'>('All');
    const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
    const [teamsState, setTeamsState] = useState<Team[]>([]);

    useEffect(() => {
        if (!token) return;

        fetch('/api/teams', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setTeamsState(data);
                } else {
                    console.error('API returned non-array data:', data);
                    setTeamsState([]);
                }
            })
            .catch(err => console.error('Error fetching teams:', err));
    }, [token]);

    const processedTeamsState = teamsState.map(team => {
        const name = team['Team Name'] || team.name || 'Unknown Team';
        let domainRaw = parseDomain(team.Domain || team.domain);

        const extractedMembers: string[] = [];
        for (let i = 1; i <= 6; i++) {
            const m = team[`Team Member ${i} Name` as keyof Team];
            if (m) extractedMembers.push(m as string);
        }
        const members = extractedMembers.length > 0 ? extractedMembers : (team.members || []);

        return {
            ...team,
            displayData: {
                name,
                domain: domainRaw as Domain,
                members
            }
        };
    });

    const filteredTeams = processedTeamsState.filter((team) => {
        const matchesSearch = team.displayData.name.toLowerCase().includes(searchQuery.toLowerCase()) || team.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDomain = selectedDomain === 'All' || team.displayData.domain === selectedDomain;
        return matchesSearch && matchesDomain;
    });

    const toggleExpand = (id: string) => {
        setExpandedTeamId(expandedTeamId === id ? null : id);
    };

    const handleInputChange = (id: string, field: keyof Team, value: string | number) => {
        setTeamsState(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const lockEvaluation = async (id: string, field: 'isProblemStatementLocked' | 'isRound1Locked' | 'isRound2Locked' | 'isRound3Locked') => {
        const teamToUpdate = teamsState.find(t => t.id === id);
        if (!teamToUpdate) return;

        const updatedTeam = { ...teamToUpdate, [field]: true };

        // Optimistically update UI
        setTeamsState(prev => prev.map(t => t.id === id ? updatedTeam : t));

        try {
            const res = await fetch('/api/teams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedTeam)
            });
            if (!res.ok) {
                console.error("Failed to save evaluation to backend");
                // Optional: Revert UI state on failure
            }
        } catch (e) {
            console.error("Error communicating with backend:", e);
        }
    };

    return (
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 pb-12">
            <header className="mb-8 p-1">
                <h2 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
                    Evaluate Teams
                </h2>
                <p className="text-slate-400 mt-2 text-sm max-w-xl">
                    Enter evaluation marks and problem statements for teams across all rounds. Once submitted, marks cannot be altered.
                </p>
            </header>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search teams by ID or name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-500"
                    />
                </div>
                <div className="relative min-w-[200px]">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                    <select
                        value={selectedDomain}
                        onChange={(e) => setSelectedDomain(e.target.value as Domain | 'All')}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none text-slate-200"
                    >
                        <option value="All">All Domains</option>
                        {domains.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown className="h-4 w-4" />
                    </div>
                </div>
            </div>

            {/* Team List */}
            <div className="space-y-3">
                {filteredTeams.length === 0 ? (
                    <div className="text-center py-12 bg-slate-900/40 rounded-xl border border-white/5 backdrop-blur-sm">
                        <p className="text-slate-400">No teams found matching your criteria.</p>
                    </div>
                ) : (
                    filteredTeams.map((team) => (
                        <div
                            key={team.id}
                            className="group rounded-xl border border-white/5 bg-slate-900/40 backdrop-blur-md overflow-hidden transition-all hover:bg-slate-900/60 hover:border-white/10"
                        >
                            <button
                                onClick={() => toggleExpand(team.id)}
                                className="w-full px-6 py-4 flex items-center justify-between focus:outline-none"
                            >
                                <div className="flex items-center gap-4 text-left">
                                    <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold font-display">
                                        {team.id.split('-')[1]}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white flex items-center gap-2 text-lg">
                                            {team.displayData.name}
                                            {team.isRound1Locked && team.isRound2Locked && team.isRound3Locked && team.isProblemStatementLocked && (
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 ml-2">
                                                    <CheckCircle className="h-3 w-3" /> Fully Evaluated
                                                </span>
                                            )}
                                        </h3>
                                        <p className="text-sm text-slate-400 mt-1">
                                            {team.id} • {team.displayData.domain}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-slate-400 group-hover:text-indigo-400 transition-colors bg-white/5 p-2 rounded-full">
                                    {expandedTeamId === team.id ? (
                                        <ChevronUp className="h-5 w-5" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5" />
                                    )}
                                </div>
                            </button>

                            {/* Expansion Details */}
                            <div
                                className={cn(
                                    "grid transition-all duration-300 ease-in-out",
                                    expandedTeamId === team.id ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                )}
                            >
                                <div className="overflow-hidden">
                                    <div className="p-6 pt-0 border-t border-white/5">

                                        <div className="mb-6 bg-white/5 p-4 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                                <Users className="h-4 w-4 text-indigo-400" />
                                                Team Members
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {team.displayData.members.map((member, idx) => {
                                                    // Check if this member is the leader based on 'Team Leader Name' or default to first member (idx === 0)
                                                    const isLeader = team['Team Leader Name'] ? member === team['Team Leader Name'] : idx === 0;
                                                    return (
                                                        <span key={idx} className={`text-xs ${isLeader ? 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30' : 'text-slate-300 bg-slate-800 border-white/5'} px-2.5 py-1 rounded-md border flex items-center gap-1.5`}>
                                                            {member}
                                                            {isLeader && <span className="text-[10px] font-semibold tracking-wider uppercase text-indigo-400 opacity-80">(Leader)</span>}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">

                                            {/* Left: Problem Statement */}
                                            <div className="space-y-3">
                                                {team.isProblemStatementLocked ? (
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-300 ml-1">Problem Statement</label>
                                                        <div className="w-full bg-slate-900/50 border border-white/5 rounded-xl p-4 text-sm text-slate-300 min-h-[160px] leading-relaxed whitespace-pre-wrap uppercase">
                                                            {team.problemStatement || <span className="text-slate-500 italic lowercase flex">No problem statement provided.</span>}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-slate-300 ml-1">Problem Statement</label>
                                                            <textarea
                                                                placeholder="Describe the problem the team is solving..."
                                                                value={team.problemStatement || ''}
                                                                onChange={(e) => handleInputChange(team.id, 'problemStatement', e.target.value)}
                                                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 min-h-[160px] resize-none text-slate-200"
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => lockEvaluation(team.id, 'isProblemStatementLocked')}
                                                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 h-10 transition-all shadow-[0_0_15px_rgba(79,70,229,0.2)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                            Submit Statement
                                                        </button>
                                                    </>
                                                )}
                                            </div>

                                            {/* Right: Marks */}
                                            <div className="space-y-6">
                                                {/* Round 1 */}
                                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="text-sm font-semibold text-indigo-400">Round 1 (Max 100)</h4>
                                                        {!team.isRound1Locked ? (
                                                            <button
                                                                onClick={() => lockEvaluation(team.id, 'isRound1Locked')}
                                                                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs font-medium shadow-sm"
                                                            >
                                                                <CheckCircle className="h-3.5 w-3.5" /> Submit R1
                                                            </button>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5 rounded-lg bg-white/5 text-slate-400 border border-white/5 px-3 py-1.5 text-xs font-medium">
                                                                <Lock className="h-3.5 w-3.5" /> Locked
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {EVALUATION_CRITERIA[team.displayData.domain] && EVALUATION_CRITERIA[team.displayData.domain].r1.map((criterion: string, idx: number) => (
                                                            <div key={`r1-${idx}`} className="space-y-1.5">
                                                                <label className="text-xs font-medium text-slate-300 leading-tight block h-8">{criterion}</label>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="25"
                                                                    value={team[`r1_${idx + 1}` as keyof Team] as number || ''}
                                                                    onChange={(e) => handleInputChange(team.id, `r1_${idx + 1}` as keyof Team, parseInt(e.target.value))}
                                                                    disabled={team.isRound1Locked}
                                                                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-center outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-slate-600 text-sm"
                                                                    placeholder="/ 25"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Round 2 */}
                                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="text-sm font-semibold text-indigo-400">Round 2 (Max 100)</h4>
                                                        {!team.isRound2Locked ? (
                                                            <button
                                                                onClick={() => lockEvaluation(team.id, 'isRound2Locked')}
                                                                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs font-medium shadow-sm"
                                                            >
                                                                <CheckCircle className="h-3.5 w-3.5" /> Submit R2
                                                            </button>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5 rounded-lg bg-white/5 text-slate-400 border border-white/5 px-3 py-1.5 text-xs font-medium">
                                                                <Lock className="h-3.5 w-3.5" /> Locked
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {EVALUATION_CRITERIA[team.displayData.domain] && EVALUATION_CRITERIA[team.displayData.domain].r2.map((criterion: string, idx: number) => (
                                                            <div key={`r2-${idx}`} className="space-y-1.5">
                                                                <label className="text-xs font-medium text-slate-300 leading-tight block h-8">{criterion}</label>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="25"
                                                                    value={team[`r2_${idx + 1}` as keyof Team] as number || ''}
                                                                    onChange={(e) => handleInputChange(team.id, `r2_${idx + 1}` as keyof Team, parseInt(e.target.value))}
                                                                    disabled={team.isRound2Locked}
                                                                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-center outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-slate-600 text-sm"
                                                                    placeholder="/ 25"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Round 3 */}
                                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="text-sm font-semibold text-indigo-400">Round 3 (Max 100)</h4>
                                                        {!team.isRound3Locked ? (
                                                            <button
                                                                onClick={() => lockEvaluation(team.id, 'isRound3Locked')}
                                                                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs font-medium shadow-sm"
                                                            >
                                                                <CheckCircle className="h-3.5 w-3.5" /> Submit R3
                                                            </button>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5 rounded-lg bg-white/5 text-slate-400 border border-white/5 px-3 py-1.5 text-xs font-medium">
                                                                <Lock className="h-3.5 w-3.5" /> Locked
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {EVALUATION_CRITERIA[team.displayData.domain] && EVALUATION_CRITERIA[team.displayData.domain].r3.map((criterion: string, idx: number) => (
                                                            <div key={`r3-${idx}`} className="space-y-1.5">
                                                                <label className="text-xs font-medium text-slate-300 leading-tight block h-8">{criterion}</label>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="25"
                                                                    value={team[`r3_${idx + 1}` as keyof Team] as number || ''}
                                                                    onChange={(e) => handleInputChange(team.id, `r3_${idx + 1}` as keyof Team, parseInt(e.target.value))}
                                                                    disabled={team.isRound3Locked}
                                                                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-center outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-slate-600 text-sm"
                                                                    placeholder="/ 25"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="bg-indigo-500/10 rounded-xl p-5 border border-indigo-500/20 flex items-center justify-between">
                                                    <div>
                                                        <span className="text-sm font-medium text-indigo-300 block">Average Total Score</span>
                                                        <span className="text-xs text-slate-400 mt-1 block">Average of all three rounds</span>
                                                    </div>
                                                    <span className="text-3xl font-bold text-indigo-400 font-display flex items-baseline">
                                                        {(() => {
                                                            let r1Total = 0, r2Total = 0, r3Total = 0;
                                                            for (let i = 1; i <= 4; i++) {
                                                                r1Total += (team[`r1_${i}` as keyof Team] as number || 0);
                                                                r2Total += (team[`r2_${i}` as keyof Team] as number || 0);
                                                                r3Total += (team[`r3_${i}` as keyof Team] as number || 0);
                                                            }
                                                            const avg = Math.round((r1Total + r2Total + r3Total) / 3);
                                                            return avg;
                                                        })()}
                                                        <span className="text-sm text-indigo-500/50 ml-1.5 font-medium">/ 100</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
