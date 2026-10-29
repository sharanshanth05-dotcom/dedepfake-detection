import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  RefreshCw,
  FileImage,
  Film,
  Mic,
  AlertTriangle,
  Calendar as CalendarIcon,
  Table as TableIcon,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import apiClient from '../api/client';
import RiskBadge from '../components/RiskBadge';
import { Calendar1 } from '../components/Calendar1';

export default function AnalysisHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaFilter, setMediaFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'ledger'

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = {};
      if (mediaFilter) params.media_type = mediaFilter;
      const res = await apiClient.get('/analysis/history', { params });
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to load analysis history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [mediaFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await apiClient.delete(`/analysis/${deleteId}`);
      setHistory(history.filter((h) => h.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert('Failed to delete analysis record: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.original_filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.file_hash?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Transform forensic history into Calendar1 events
  const calendarEvents = useMemo(() => {
    return history.map((item) => {
      const dateObj = new Date(item.created_at);
      const isoDate = !isNaN(dateObj.getTime())
        ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`
        : new Date().toISOString().split('T')[0];

      const timeStr = !isNaN(dateObj.getTime())
        ? `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`
        : '12:00';

      let calId = 'work'; // default Authentic Verified
      if (item.predicted_class === 'manipulated' || item.risk_level === 'critical') {
        calId = 'important';
      } else if (item.media_type === 'video') {
        calId = 'meetings';
      } else if (item.media_type === 'audio') {
        calId = 'social';
      } else if (item.risk_level === 'elevated' || item.risk_level === 'moderate') {
        calId = 'personal';
      }

      return {
        id: item.id,
        analysisId: item.id,
        title: item.original_filename || 'Forensic Media Target',
        description: `Verified ${item.media_type?.toUpperCase()} record. Trust score: ${item.trust_score}/100. Verdict: ${item.predicted_class?.toUpperCase()}.`,
        date: isoDate,
        start: timeStr,
        calendar: calId,
        trustScore: item.trust_score,
        predictedClass: item.predicted_class,
        riskLevel: item.risk_level,
        fileHash: item.file_hash,
      };
    });
  }, [history]);

  const getMediaIcon = (type) => {
    switch (type) {
      case 'image':
        return FileImage;
      case 'video':
        return Film;
      case 'audio':
        return Mic;
      default:
        return History;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8e8e8] pb-5">
        <div>
          <h1 className="font-display font-semibold text-2xl text-[#1b1b1b] flex items-center gap-2">
            <History className="w-5 h-5 text-[#6e78d5]" />
            Forensic Audit History
          </h1>
          <p className="text-xs text-[#71737a] font-mono-code">
            Immutable chain-of-custody timeline and ledger of digital media forensic inspections
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-[6px] bg-[#ececef] border border-[#e8e8e8] text-xs font-mono-code shadow-xs">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] font-medium transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white text-[#1b1b1b] border border-[#e8e8e8] shadow-xs'
                  : 'text-[#71737a] hover:text-[#1b1b1b]'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[#6e78d5]" />
              Calendar Timeline
            </button>
            <button
              onClick={() => setViewMode('ledger')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] font-medium transition-all cursor-pointer ${
                viewMode === 'ledger'
                  ? 'bg-white text-[#1b1b1b] border border-[#e8e8e8] shadow-xs'
                  : 'text-[#71737a] hover:text-[#1b1b1b]'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5 text-[#6e78d5]" />
              Audit Ledger
            </button>
          </div>

          <button
            onClick={fetchHistory}
            className="p-2 rounded-[6px] bg-white hover:bg-[#ececef] text-[#71737a] hover:text-[#1b1b1b] border border-[#e8e8e8] shadow-xs transition-colors cursor-pointer"
            title="Refresh History"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar (shown for both views) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-[#71737a] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audits by filename or SHA-256 hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-[6px] bg-white border border-[#e8e8e8] text-xs text-[#1b1b1b] placeholder-[#71737a] focus:outline-none focus:border-[#6e78d5] font-mono-code shadow-xs"
          />
        </div>

        {/* Modality Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#ececef] rounded-[6px] border border-[#e8e8e8] text-xs font-mono-code">
          {['', 'image', 'video', 'audio'].map((type) => (
            <button
              key={type}
              onClick={() => setMediaFilter(type)}
              className={`px-3 py-1 rounded-[4px] transition-colors uppercase cursor-pointer ${
                mediaFilter === type
                  ? 'bg-white text-[#1b1b1b] font-medium border border-[#e8e8e8] shadow-xs'
                  : 'text-[#71737a] hover:text-[#1b1b1b]'
              }`}
            >
              {type || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'calendar' ? (
        /* Calendar 1 Forensic Audit View */
        <div className="space-y-4">
          <Calendar1
            events={calendarEvents}
            onEventDelete={(id) => setDeleteId(id)}
          />
        </div>
      ) : (
        /* Tabular Ledger View */
        <div className="cyber-card overflow-hidden bg-white border border-[#e8e8e8] rounded-xl shadow-xs">
          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-6 h-6 text-[#6e78d5] animate-spin mx-auto mb-2" />
              <span className="text-xs font-mono-code text-[#71737a]">
                Loading audit history ledger...
              </span>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-20 text-center text-xs text-[#71737a] font-mono-code">
              No analysis records match your search query.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono-code">
                <thead className="bg-[#fbfbfb] border-b border-[#e8e8e8] text-[#71737a] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Media Target</th>
                    <th className="py-3 px-4">Modality</th>
                    <th className="py-3 px-4">Trust Score</th>
                    <th className="py-3 px-4">Risk Rating</th>
                    <th className="py-3 px-4">Model Version</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8e8e8] text-[#1b1b1b]">
                  {filteredHistory.map((row) => {
                    const Icon = getMediaIcon(row.media_type);
                    return (
                      <tr key={row.id} className="hover:bg-[#fbfbfb] transition-colors">
                        <td className="py-3.5 px-4 font-sans font-medium text-[#1b1b1b] max-w-xs truncate">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-[#6e78d5] shrink-0" />
                            <span className="truncate" title={row.original_filename}>
                              {row.original_filename}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 uppercase text-[#71737a]">
                          {row.media_type}
                        </td>

                        <td className="py-3.5 px-4 font-bold">
                          <span
                            className={
                              row.trust_score >= 80
                                ? 'text-[#02755c]'
                                : row.trust_score >= 40
                                ? 'text-[#6e78d5]'
                                : 'text-[#92681b]'
                            }
                          >
                            {row.trust_score}
                          </span>
                          <span className="text-[#71737a] font-normal"> / 100</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <RiskBadge riskLevel={row.risk_level} size="sm" />
                        </td>

                        <td className="py-3.5 px-4 text-[#71737a]">
                          {row.model_version}
                        </td>

                        <td className="py-3.5 px-4 text-[#71737a]">
                          {new Date(row.created_at).toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/analysis/${row.id}`}
                              className="p-1.5 rounded-[4px] hover:bg-[#ececef] text-[#71737a] hover:text-[#6e78d5] transition-colors"
                              title="Inspect Report"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => setDeleteId(row.id)}
                              className="p-1.5 rounded-[4px] hover:bg-[#ececef] text-[#71737a] hover:text-[#92681b] transition-colors cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-[#101011]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="cyber-card p-6 max-w-sm w-full space-y-4 bg-white border border-[#e8e8e8] rounded-xl shadow-xs">
            <div className="flex items-center gap-3 text-[#92681b]">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-display font-semibold text-base text-[#1b1b1b]">
                Confirm Ledger Purge
              </h3>
            </div>
            <p className="text-xs text-[#71737a] leading-relaxed">
              Are you sure you want to permanently delete this forensic analysis record? This action cannot be reversed.
            </p>
            <div className="flex justify-end gap-3 pt-2 font-mono-code text-xs">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-[6px] bg-white border border-[#e8e8e8] text-[#1b1b1b] hover:bg-[#ececef] transition-colors cursor-pointer"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-[6px] bg-[#92681b] text-white font-medium hover:bg-[#7e5917] transition-colors cursor-pointer"
                disabled={isDeleting}
              >
                {isDeleting ? 'Purging...' : 'Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
