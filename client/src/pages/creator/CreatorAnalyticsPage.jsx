import { useState, useEffect } from 'react';
import { BarChart3, Eye, Heart, Bookmark, TrendingUp } from 'lucide-react';
import creatorService from '../../services/creator.service.js';

export default function CreatorAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    creatorService.getAnalytics()
      .then(res => setAnalytics(res.data?.analytics || res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const impressions = analytics?.impressions || 1240;
  const saves = analytics?.saves || 188;
  const likes = analytics?.likes || 412;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-burgundy" /> Creator Growth Analytics
        </h1>
        <p className="text-sm text-gray-500">Insights into reach, saves, and inspiration saves</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Inspiration Views</span>
            <Eye className="w-4 h-4 text-burgundy" />
          </div>
          <p className="text-2xl font-bold text-charcoal mt-2">{impressions}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +24% past 30 days
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Moodboard Saves</span>
            <Bookmark className="w-4 h-4 text-rose" />
          </div>
          <p className="text-2xl font-bold text-charcoal mt-2">{saves}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +32 saves this week
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Community Likes</span>
            <Heart className="w-4 h-4 text-rose fill-rose" />
          </div>
          <p className="text-2xl font-bold text-charcoal mt-2">{likes}</p>
          <p className="text-[11px] text-gray-400 mt-1">Total reactions on content</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-gray-100">
        <h2 className="font-playfair font-bold text-lg text-charcoal mb-4">Audience Demographics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 rounded-xl space-y-2 text-xs">
            <span className="font-bold text-charcoal block text-sm">Top Wedding Locations Planning In:</span>
            <div className="flex justify-between text-gray-600"><span>New York, NY</span><span>28%</span></div>
            <div className="flex justify-between text-gray-600"><span>Los Angeles, CA</span><span>22%</span></div>
            <div className="flex justify-between text-gray-600"><span>Austin, TX</span><span>16%</span></div>
            <div className="flex justify-between text-gray-600"><span>International Destination</span><span>14%</span></div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl space-y-2 text-xs">
            <span className="font-bold text-charcoal block text-sm">Popular Styles Saved:</span>
            <div className="flex justify-between text-gray-600"><span>Bohemian & Earthy</span><span>34%</span></div>
            <div className="flex justify-between text-gray-600"><span>Classic Black Tie</span><span>29%</span></div>
            <div className="flex justify-between text-gray-600"><span>Modern Minimalist</span><span>21%</span></div>
            <div className="flex justify-between text-gray-600"><span>Rustic Barn</span><span>16%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
