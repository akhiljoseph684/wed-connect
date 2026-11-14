import { useState, useEffect } from 'react';
import { BarChart3, Eye, Heart, Bookmark, TrendingUp, Users, MessageCircle, Sparkles } from 'lucide-react';
import creatorService from '../../services/creator.service.js';

export default function CreatorAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    creatorService
      .getAnalytics()
      .then((res) => setAnalytics(res.data?.analytics || res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const reach = analytics?.monthlyReach || 0;
  const saves = analytics?.totalSaves || 0;
  const likes = analytics?.totalLikes || 0;
  const comments = analytics?.totalComments || 0;
  const followers = analytics?.followersCount || 0;
  const postsCount = analytics?.totalPosts || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-burgundy" /> Creator Growth Analytics
        </h1>
        <p className="text-sm text-gray-500">Real-time performance metrics computed from community engagement</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl animate-pulse shadow-soft" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-sand/60">
            <div className="flex items-center justify-between text-mutedGray text-xs">
              <span className="font-semibold uppercase tracking-wider">Estimated Reach</span>
              <Eye className="w-4 h-4 text-burgundy" />
            </div>
            <p className="text-3xl font-bold text-charcoal mt-2 font-serif">{reach.toLocaleString()}</p>
            <p className="text-[11px] text-mutedGray mt-1">Impressions across wedding feeds</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-soft border border-sand/60">
            <div className="flex items-center justify-between text-mutedGray text-xs">
              <span className="font-semibold uppercase tracking-wider">Board Saves</span>
              <Bookmark className="w-4 h-4 text-rose" />
            </div>
            <p className="text-3xl font-bold text-charcoal mt-2 font-serif">{saves.toLocaleString()}</p>
            <p className="text-[11px] text-mutedGray mt-1">Times saved to couples' mood boards</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-soft border border-sand/60">
            <div className="flex items-center justify-between text-mutedGray text-xs">
              <span className="font-semibold uppercase tracking-wider">Community Likes</span>
              <Heart className="w-4 h-4 text-burgundy fill-burgundy" />
            </div>
            <p className="text-3xl font-bold text-charcoal mt-2 font-serif">{likes.toLocaleString()}</p>
            <p className="text-[11px] text-mutedGray mt-1">Total hearts on your inspirations</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-soft border border-sand/60">
            <div className="flex items-center justify-between text-mutedGray text-xs">
              <span className="font-semibold uppercase tracking-wider">Followers</span>
              <Users className="w-4 h-4 text-gold" />
            </div>
            <p className="text-3xl font-bold text-charcoal mt-2 font-serif">{followers.toLocaleString()}</p>
            <p className="text-[11px] text-mutedGray mt-1">Active couples & creators following</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-soft border border-sand/60">
            <div className="flex items-center justify-between text-mutedGray text-xs">
              <span className="font-semibold uppercase tracking-wider">Comments</span>
              <MessageCircle className="w-4 h-4 text-charcoal/60" />
            </div>
            <p className="text-3xl font-bold text-charcoal mt-2 font-serif">{comments.toLocaleString()}</p>
            <p className="text-[11px] text-mutedGray mt-1">Inquiries and remarks on styling</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-soft border border-sand/60">
            <div className="flex items-center justify-between text-mutedGray text-xs">
              <span className="font-semibold uppercase tracking-wider">Published Inspirations</span>
              <Sparkles className="w-4 h-4 text-burgundy" />
            </div>
            <p className="text-3xl font-bold text-charcoal mt-2 font-serif">{postsCount.toLocaleString()}</p>
            <p className="text-[11px] text-mutedGray mt-1">Active editorial posts in public feed</p>
          </div>
        </div>
      )}
    </div>
  );
}
