import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Globe, Tag, ChevronRight, FileText } from 'lucide-react';
import { api } from '../services/api';

export default function Knowledge() {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('all');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getKnowledge({
          language: language === 'all' ? '' : language,
          category: category === 'all' ? '' : category,
          search: search
        });
        setArticles(data || []);
        if (data && data.length > 0 && !selectedArticle) {
          setSelectedArticle(data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [language, category, search]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-emerald-400" />
          Verified Hospital Bio-Safety Knowledge Base
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Regulatory standard operating procedures (SOPs), color-coding manuals, and emergency incident guidelines.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guidelines, SOPs, or keywords..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Language selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Languages</option>
            <option value="en">English</option>
            <option value="ta">தமிழ் (Tamil)</option>
            <option value="hi">हिंदी (Hindi)</option>
          </select>

          {/* Category filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Topics</option>
            <option value="Segregation">Segregation & Bins</option>
            <option value="Sharps safety">Sharps & Needle Safety</option>
            <option value="Infectious waste">Infectious Waste</option>
            <option value="Chemical waste">Chemical Waste</option>
            <option value="Emergency procedures">Emergency Procedures</option>
          </select>
        </div>
      </div>

      {/* Main Content Layout: Article List + Reader */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Article Index List */}
        <div className="md:col-span-1 space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading articles...</div>
          ) : articles.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No articles matched.</div>
          ) : (
            articles.map((art) => (
              <div
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  selectedArticle?.id === art.id
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="font-semibold uppercase tracking-wider text-emerald-400">
                    {art.category}
                  </span>
                  <span className="uppercase">{art.language}</span>
                </div>
                <h4 className="text-xs font-bold leading-snug line-clamp-2">
                  {art.title}
                </h4>
              </div>
            ))
          )}
        </div>

        {/* Reader View */}
        <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl min-h-[500px]">
          {selectedArticle ? (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold mb-1">
                  <span>{selectedArticle.category}</span>
                  <span>•</span>
                  <span className="uppercase text-slate-400">{selectedArticle.language}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {selectedArticle.title}
                </h2>
              </div>

              {/* Formatted Markdown Content */}
              <div className="prose prose-invert prose-sm max-w-none text-xs sm:text-sm text-slate-300 space-y-3 leading-relaxed whitespace-pre-line">
                {selectedArticle.content}
              </div>

              {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                <div className="pt-6 border-t border-slate-800 flex items-center gap-1.5 flex-wrap">
                  <Tag className="w-3.5 h-3.5 text-slate-500" />
                  {selectedArticle.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
              <FileText className="w-8 h-8 mb-2 opacity-50" />
              <span>Select an institutional guideline from the left to read.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
