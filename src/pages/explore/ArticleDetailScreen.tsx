import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Share2, Clock, User, Tag, Sparkles } from 'lucide-react';
import { MobileContainer } from '../../components/layout/MobileContainer';
import { EXPLORE_ARTICLES } from './ExploreScreen';

export const ArticleDetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const article = EXPLORE_ARTICLES.find(a => a.id === id) || EXPLORE_ARTICLES[0];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const related = EXPLORE_ARTICLES.filter(a => a.id !== article.id).slice(0, 2);

  return (
    <MobileContainer hasBottomNav={false} className="p-4 space-y-4 bg-[#F8FAFC]">
      {/* Top Navbar */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => navigate('/explore')}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          MAUSAM Editorial
        </span>

        <button
          onClick={handleShare}
          className="p-2 -mr-2 rounded-xl text-[#0E468A] hover:text-[#082046] transition-colors"
          aria-label="Share article"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Article Header */}
      <div className="space-y-3">
        <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-[#0E468A] border border-blue-200">
          {article.category}
        </span>

        <h1 className="text-xl font-extrabold font-display text-[#082046] leading-snug">
          {article.title}
        </h1>

        <div className="flex items-center gap-4 text-xs text-slate-500 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{article.readTime}</span>
          </div>
        </div>
      </div>

      {/* Article Body */}
      <div className="space-y-4 text-xs text-slate-700 leading-relaxed font-sans font-medium">
        <p className="font-serif italic text-sm text-slate-800 border-l-2 border-[#0E468A] pl-3 py-1 bg-blue-50/50 rounded-r-lg">
          "{article.summary}"
        </p>

        {article.content.map((paragraph, idx) => (
          <p key={idx} className="leading-relaxed">
            {paragraph}
          </p>
        ))}

        {/* AI Actionable Tip Callout */}
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1.5 shadow-xs">
          <div className="flex items-center gap-2 text-[#0E468A] font-extrabold text-xs">
            <Sparkles className="w-4 h-4" />
            <span>MAUSAM Quick Action</span>
          </div>
          <p className="text-[11px] text-slate-700 leading-normal font-normal">
            Configure a custom alert trigger on your account to notify you 3 hours in advance before these conditions occur.
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {article.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-mono font-bold text-slate-600 border border-slate-200">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Related Articles */}
      <div className="pt-4 border-t border-slate-200 space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Related Reads</h4>
        <div className="grid grid-cols-2 gap-2">
          {related.map((rel) => (
            <div
              key={rel.id}
              onClick={() => navigate(`/explore/article/${rel.id}`)}
              className="bg-white border border-slate-200 shadow-xs rounded-2xl p-2.5 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <span className="text-[9px] font-bold text-[#0E468A] block uppercase">{rel.category}</span>
              <h5 className="text-[11px] font-bold text-slate-900 mt-1 line-clamp-2 leading-snug">{rel.title}</h5>
            </div>
          ))}
        </div>
      </div>
    </MobileContainer>
  );
};
