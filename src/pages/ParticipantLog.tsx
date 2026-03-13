import { useState, useEffect } from 'react';
import { Search, Filter, QrCode, ChevronDown, ChevronUp, MapPin, GraduationCap, Mail, Phone, Users, X, Trash2 } from 'lucide-react';
import { domains, type Domain, type Team, parseDomain } from '../data/mockData';
import { cn } from '../components/Sidebar';
import QRScanner from '../components/QRScanner';

export default function ParticipantLog() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDomain, setSelectedDomain] = useState<Domain | 'All'>('All');
    const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [teams, setTeams] = useState<Team[]>([]);

    useEffect(() => {
        fetch('https://smartevaluate-api.railway.internal/api/teams')
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    setTeams(data);
                } else {
                    import('../data/mockData').then(module => setTeams(module.mockTeams));
                }
            })
            .catch(err => {
                console.error('Error fetching teams:', err);
                import('../data/mockData').then(module => setTeams(module.mockTeams));
            });
    }, []);

    const processedTeams = teams.map(team => {
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
                domain: domainRaw,
                members,
                location: team.location || 'Not Specified',
                college: team.Department || team.college || 'Not Specified',
                leaderEmail: team.Email || team.leaderEmail || 'Not Specified',
                leaderPhone: team['Phone Number'] || team.leaderPhone || 'Not Specified'
            }
        };
    });

    const filteredTeams = processedTeams.filter((team) => {
        const matchesSearch = team.displayData.name.toLowerCase().includes(searchQuery.toLowerCase()) || team.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDomain = selectedDomain === 'All' || team.displayData.domain === selectedDomain;
        return matchesSearch && matchesDomain;
    });

    const toggleExpand = (id: string) => {
        setExpandedTeamId(expandedTeamId === id ? null : id);
    };

    const handleScanSuccess = async (decodedText: string) => {
        try {
            const rawData = JSON.parse(decodedText);

            const finalId = String(rawData.id || rawData['TeamID'] || rawData['Team ID']);
            if (!finalId || finalId === 'undefined') {
                throw new Error("QR Code missing required ID fields");
            }

            // Immediately set the search query to focus the scanned team visually
            setSearchQuery(finalId);

            const teamData = { ...rawData, id: finalId };
            if (!teamData.name) {
                teamData.name = teamData['Team Name'] || 'Unknown Team';
            }
            const res = await fetch('https://smartevaluate-api.railway.internal/api/teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(teamData)
            });

            if (res.ok) {
                const refreshed = await fetch('https://smartevaluate-api.railway.internal/api/teams');
                const newTeams = await refreshed.json();
                setTeams(newTeams);
            } else {
                console.error("Failed to register team with backend.");
            }
        } catch (e) {
            console.error("Failed to parse or save QR data:", e);
            setSearchQuery(decodedText);
        }
        setIsScannerOpen(false);
    };

    const handleDeleteTeam = async (e: React.MouseEvent, id: string, name: string) => {
        e.stopPropagation();

        if (window.confirm(`Are you sure you want to permanently delete team ${name} (${id})? This will remove them from the database.`)) {
            try {
                const res = await fetch(`https://smartevaluate-api.railway.internal/api/teams/${id}`, {
                    method: 'DELETE'
                });

                if (res.ok) {
                    setTeams(prev => prev.filter(t => t.id !== id));
                    if (expandedTeamId === id) setExpandedTeamId(null);
                } else {
                    console.error("Failed to delete team");
                    alert("Failed to delete team from database.");
                }
            } catch (err) {
                console.error("Error deleting team:", err);
                alert("An error occurred while deleting the team.");
            }
        }
    };

    return (
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 pb-12">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
                        Participant Log
                    </h2>
                    <p className="text-slate-400 mt-2 text-sm max-w-xl">
                        Browse and manage all hackathon teams and their participants. Filter by domain or use the QR scanner for quick check-ins.
                    </p>
                </div>

                <button
                    onClick={() => setIsScannerOpen(true)}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                >
                    <QrCode className="h-4 w-4" />
                    Scan QR Code
                </button>
            </header>

            {isScannerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsScannerOpen(false)}
                            className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <h3 className="text-xl font-semibold text-white mb-2">Scan Team QR Code</h3>
                        <p className="text-slate-400 text-sm mb-6">Position the QR code within the frame to automatically search for the team.</p>

                        <div className="rounded-xl overflow-hidden bg-black/50 border border-white/5">
                            <QRScanner
                                onScanSuccess={handleScanSuccess}
                                onScanFailure={(err) => console.log('QR Scan Error:', err)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search teams by ID or name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-500"
                    />
                </div>
                <div className="relative min-w-[200px]">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                    <select
                        value={selectedDomain}
                        onChange={(e) => setSelectedDomain(e.target.value as Domain | 'All')}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none text-slate-200"
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
                            <div
                                onClick={() => toggleExpand(team.id)}
                                className="w-full px-6 py-4 flex items-center justify-between cursor-pointer focus:outline-none"
                                role="button"
                                tabIndex={0}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold font-display">
                                        {team.id.split('-')[1]}
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-semibold text-white flex items-center gap-2 text-lg">
                                            {team.displayData.name}
                                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/5 ml-2">
                                                {team.displayData.domain}
                                            </span>
                                        </h3>
                                        <p className="text-sm text-slate-400 mt-1">
                                            {team.id} • {team.displayData.members.length} Members
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => handleDeleteTeam(e, team.id, team.displayData.name)}
                                        className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors p-2 rounded-full focus:outline-none"
                                        title="Delete Team"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                    <div className="text-slate-400 group-hover:text-blue-400 transition-colors bg-white/5 p-2 rounded-full">
                                        {expandedTeamId === team.id ? (
                                            <ChevronUp className="h-5 w-5" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Expansion Details */}
                            <div
                                className={cn(
                                    "grid transition-all duration-300 ease-in-out",
                                    expandedTeamId === team.id ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                )}
                            >
                                <div className="overflow-hidden">
                                    <div className="p-6 pt-0 border-t border-white/5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">

                                            {/* Members */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-4">
                                                    <Users className="h-4 w-4 text-blue-400" />
                                                    Team Members
                                                </div>
                                                <ul className="space-y-2">
                                                    {team.displayData.members.map((member, idx) => {
                                                        const isLeader = team['Team Leader Name'] ? member === team['Team Leader Name'] : idx === 0;
                                                        return (
                                                            <li key={idx} className={`flex items-center gap-2 text-sm ${isLeader ? 'text-blue-300 bg-blue-500/5 border-blue-500/20' : 'text-slate-400 bg-white/5 border-white/5'} px-3 py-2 rounded-lg border`}>
                                                                <div className={`w-1.5 h-1.5 rounded-full ${isLeader ? 'bg-blue-400' : 'bg-blue-500/50'}`} />
                                                                {member}
                                                                {isLeader && <span className="text-[10px] font-semibold tracking-wider uppercase text-blue-400/80 ml-auto">(Leader)</span>}
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>

                                            {/* Info Panel 1 */}
                                            <div className="space-y-4">
                                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-2">
                                                        <MapPin className="h-3 w-3" /> Location
                                                    </div>
                                                    <div className="text-sm font-medium text-slate-200">{team.displayData.location}</div>
                                                </div>
                                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-2">
                                                        <GraduationCap className="h-3 w-3" /> College
                                                    </div>
                                                    <div className="text-sm font-medium text-slate-200">{team.displayData.college}</div>
                                                </div>
                                            </div>

                                            {/* Info Panel 2 (Leader Info) */}
                                            <div className="space-y-4">
                                                <div className="bg-white/5 rounded-xl p-4 border border-white/5 border-l-2 border-l-blue-500/50">
                                                    <div className="text-xs text-blue-400 mb-2 font-medium">Team Leader Contact</div>
                                                    <div className="text-sm font-semibold text-white mb-3">
                                                        {team['Team Leader Name'] || team.displayData.members[0] || 'Unknown Leader'}
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-3 text-sm">
                                                            <Mail className="h-4 w-4 text-slate-500" />
                                                            <span className="text-slate-300">{team.displayData.leaderEmail}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-sm">
                                                            <Phone className="h-4 w-4 text-slate-500" />
                                                            <span className="text-slate-300">{team.displayData.leaderPhone}</span>
                                                        </div>
                                                    </div>
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
