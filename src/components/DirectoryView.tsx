import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Users,
  IdCard,
  Download,
  Trash2,
  CheckCircle,
  ExternalLink,
  MapPin,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';
import { Member } from '../types';
import { updateMemberStatus, deleteMember } from '../lib/firestoreService';

interface DirectoryViewProps {
  members: Member[];
  onSelectMember: (member: Member) => void;
  currentUserEmail?: string | null;
}

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  members,
  onSelectMember,
  currentUserEmail,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const isAdmin = currentUserEmail === 'cosplaysehat@gmail.com';

  // Extract unique cities & roles for filter dropdowns
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    members.forEach((m) => {
      if (m.city) set.add(m.city);
    });
    return Array.from(set).sort();
  }, [members]);

  const availableRoles = useMemo(() => {
    const set = new Set<string>();
    members.forEach((m) => {
      if (m.primaryRole) set.add(m.primaryRole);
    });
    return Array.from(set).sort();
  }, [members]);

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        (m.fullName && m.fullName.toLowerCase().includes(q)) ||
        m.cosplayName.toLowerCase().includes(q) ||
        (m.userId16 && m.userId16.includes(q)) ||
        (m.email && m.email.toLowerCase().includes(q)) ||
        (m.phone && m.phone.includes(q)) ||
        (m.fandom && m.fandom.toLowerCase().includes(q)) ||
        (m.city && m.city.toLowerCase().includes(q));

      const matchRole = selectedRole === 'ALL' || m.primaryRole === selectedRole;
      const matchCity = selectedCity === 'ALL' || m.city === selectedCity;
      const matchSource = selectedSource === 'ALL' || m.source === selectedSource;

      return matchQuery && matchRole && matchCity && matchSource;
    });
  }, [members, searchQuery, selectedRole, selectedCity, selectedSource]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredMembers.length === 0) return;

    const headers = [
      'KCC ID (16 Digit)',
      'Nama Lengkap',
      'Cosname',
      'Email',
      'WhatsApp',
      'Domisili',
      'Peran',
      'Fandom',
      'Pengalaman',
      'Media Sosial',
      'Sumber Pendaftaran',
      'Status',
      'Tanggal Bergabung',
    ];

    const rows = filteredMembers.map((m) => [
      `"${m.userId16 || ''}"`,
      `"${(m.fullName || m.cosplayName || '').replace(/"/g, '""')}"`,
      `"${m.cosplayName.replace(/"/g, '""')}"`,
      `"${m.email || ''}"`,
      `"${m.phone || ''}"`,
      `"${m.city || ''}"`,
      `"${m.primaryRole || ''}"`,
      `"${(m.fandom || '').replace(/"/g, '""')}"`,
      `"${m.experience || ''}"`,
      `"${(m.socialMedia || '').replace(/"/g, '""')}"`,
      `"${m.source || ''}"`,
      `"${m.status || ''}"`,
      `"${m.createdAt || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kawancosplay_members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Hapus data member "${name}" dari database?`)) {
      try {
        await deleteMember(id);
      } catch (e) {
        alert('Gagal menghapus member');
      }
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await updateMemberStatus(id, 'verified');
    } catch (e) {
      alert('Gagal memperbarui status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
              Live Firestore Database
            </span>
            <span className="text-xs text-slate-400">
              {members.length} Total Anggota Terdaftar
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Direktori Anggota KawanCosplay
          </h1>
          <p className="text-slate-400 text-sm">
            Daftar resmi seluruh anggota yang mendaftar via web form maupun hasil sinkronisasi Google Form
          </p>
        </div>

        {/* View mode & Export */}
        <div className="flex items-center space-x-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center space-x-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
                viewMode === 'grid' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
                viewMode === 'table' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Tabel</span>
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-6 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama, cosname, ID KTA, fandom, atau kota..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          {/* Role Filter */}
          <div className="w-full sm:w-48">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">Semua Peran</option>
              {availableRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div className="w-full sm:w-44">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">Semua Domisili</option>
              {availableCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Source Filter */}
          <div className="w-full sm:w-44">
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">Semua Sumber</option>
              <option value="web_form">Web Form Baru</option>
              <option value="google_form_sync">Google Form (Live Sync)</option>
              <option value="spreadsheet_import">Spreadsheet Import</option>
            </select>
          </div>
        </div>

        {/* Filter count feedback */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
          <span>
            Menampilkan <span className="font-bold text-white">{filteredMembers.length}</span> dari{' '}
            {members.length} anggota
          </span>
          {(searchQuery || selectedRole !== 'ALL' || selectedCity !== 'ALL' || selectedSource !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRole('ALL');
                setSelectedCity('ALL');
                setSelectedSource('ALL');
              }}
              className="text-rose-400 hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Tidak ada member ditemukan</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mb-4">
            Coba ubah kata kunci pencarian atau reset filter untuk melihat data lainnya.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="group bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-5 shadow-lg hover:shadow-2xl hover:shadow-rose-950/20 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header card */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-950 border border-rose-500/30 shrink-0">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.cosplayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-rose-900 to-slate-900 text-rose-300 font-bold text-base">
                          {member.cosplayName[0]?.toUpperCase() || 'KC'}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-base truncate group-hover:text-rose-300 transition-colors">
                        {member.cosplayName}
                      </h3>
                      <p className="text-xs text-slate-400 truncate">{member.fullName}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 block">
                      KCC ID
                    </span>
                    {member.userId16 && (
                      <span className="text-[9px] font-mono text-slate-300 block mt-0.5">
                        {member.userId16.slice(0, 4)}...{member.userId16.slice(-4)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Badges & Meta */}
                <div className="space-y-2 mb-4 text-xs">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                      {member.primaryRole}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800/60 text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      <span>{member.city}</span>
                    </span>
                  </div>

                  <p className="text-slate-300 line-clamp-1">
                    <span className="text-slate-500 font-medium">Fandom: </span>
                    {member.fandom}
                  </p>

                  {member.socialMedia && (
                    <p className="text-pink-300/90 truncate font-mono text-[11px]">
                      {member.socialMedia}
                    </p>
                  )}

                  {member.reason && (
                    <p className="text-slate-400 text-[11px] line-clamp-2 italic bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                      "{member.reason}"
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      member.source === 'google_form_sync'
                        ? 'bg-emerald-400'
                        : member.source === 'spreadsheet_import'
                        ? 'bg-teal-400'
                        : 'bg-indigo-400'
                    }`}
                  ></span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                    {member.source === 'google_form_sync'
                      ? 'Live GForm'
                      : member.source === 'spreadsheet_import'
                      ? 'Sheets'
                      : 'Web Form'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onSelectMember(member)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
                  >
                    <IdCard className="w-3.5 h-3.5" />
                    <span>KTA</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(member.id, member.cosplayName)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Hapus member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Member ID</th>
                  <th className="py-3.5 px-4">Cosname / Nama</th>
                  <th className="py-3.5 px-4">Peran</th>
                  <th className="py-3.5 px-4">Domisili</th>
                  <th className="py-3.5 px-4">Fandom</th>
                  <th className="py-3.5 px-4">Kontak / Medsos</th>
                  <th className="py-3.5 px-4">Sumber</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-rose-400 whitespace-nowrap">
                      {member.userId16 ? (
                        <>
                          <div className="text-xs">{member.userId16.slice(0, 4)} {member.userId16.slice(4, 8)}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {member.userId16.slice(8, 12)} {member.userId16.slice(12, 16)}
                          </div>
                        </>
                      ) : (
                        <div className="text-slate-500">-</div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-white">{member.cosplayName}</div>
                      <div className="text-slate-400 text-[11px]">{member.fullName}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium text-[11px]">
                        {member.primaryRole}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{member.city}</td>
                    <td className="py-3 px-4 max-w-[180px] truncate">{member.fandom}</td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-pink-300">
                      {member.socialMedia || member.phone || '-'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400">
                        {member.source === 'google_form_sync' ? 'Live GForm' : member.source}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectMember(member)}
                        className="px-2.5 py-1 rounded bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-[11px] font-semibold transition-colors"
                      >
                        Lihat KTA
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
