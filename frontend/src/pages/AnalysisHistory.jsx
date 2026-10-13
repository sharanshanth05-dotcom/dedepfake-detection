import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import apiClient from '../api/client';
import RiskBadge from '../components/RiskBadge';

export default function AnalysisHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaFilter, setMediaFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    const matchesSearch = item.original_filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.file_hash.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getMediaIcon = (type) => {
    switch (type) {
      case 'image': return FileImage;
      case 'video': return Film;
      case 'audio': return Mic;
      default: return History;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            Forensic Audit History
          </h1>
          <p className="text-xs text-slate-400 font-mono-code">
            Immutable chain-of-custody audit log of past digital media inspections
          </p>
        </div>

        <button
          onClick={fetchHistory}
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          title="Refresh History"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by filename or SHA-256 hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono-code"
          />
        </div>

        {/* Modality Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono-code">
          {['', 'image', 'video', 'audio'].map((type) => (
            <button
              key={type}
              onClick={() => setMediaFilter(type)}
              className={`px-3 py-1 rounded transition-colors uppercase ${
                mediaFilter === type
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {type || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="cyber-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-2" />
            <span className="text-xs font-mono-code text-slate-400">Loading audit history ledger...</span>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-500 font-mono-code">
            No analysis records match your search query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono-code">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
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
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredHistory.map((row) => {
                  const Icon = getMediaIcon(row.media_type);
                  return (
                    <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-sans font-medium text-white max-w-xs truncate">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span className="truncate" title={row.original_filename}>
                            {row.original_filename}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 uppercase text-slate-400">
                        {row.media_type}
                      </td>

                      <td className="py-3.5 px-4 font-bold">
                        <span className={row.trust_score >= 80 ? 'text-emerald-400' : row.trust_score >= 40 ? 'text-amber-400' : 'text-rose-400'}>
                          {row.trust_score}
                        </span>
                        <span className="text-slate-500 font-normal"> / 100</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <RiskBadge riskLevel={row.risk_level} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        {row.model_version}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(row.created_at).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/analysis/${row.id}`}
                            className="p-1.5 rounded hover:bg-cyan-950/60 text-slate-400 hover:text-cyan-400 transition-colors"
                            title="Inspect Report"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteId(row.id)}
                            className="p-1.5 rounded hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
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

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="cyber-card p-6 max-w-sm w-full space-y-4 border-rose-500/30">
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm Audit Deletion</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete this forensic audit record? This will purge the analysis and certified PDF/JSON reports from the system.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
