import { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import businessService from '../../services/business.service.js';
import reviewService from '../../services/review.service.js';
import { formatRelativeTime } from '../../utils/formatters.js';

export default function VendorReviewsPage() {
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [activeReplyId, setActiveReplyId] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const bRes = await businessService.getMyBusiness();
        const b = bRes.data?.business || bRes.data;
        setBusiness(b);
        if (b?._id) {
          const rRes = await reviewService.getReviews(b._id);
          setReviews(rRes.data?.reviews || []);
        }
      } catch (err) {
        toast.error('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleSendReply = async (reviewId) => {
    const text = replyText[reviewId];
    if (!text?.trim()) return;
    try {
      await reviewService.replyReview(reviewId, text.trim());
      toast.success('Reply submitted');
      setActiveReplyId(null);
      // Update local state
      setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, reply: { text: text.trim(), createdAt: new Date() } } : r));
    } catch (err) {
      toast.error('Failed to send reply');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
          <Star className="w-6 h-6 text-amber-500 fill-amber-500" /> Client Reviews & Ratings
        </h1>
        <p className="text-sm text-gray-500">
          Average rating: {business?.averageRating?.toFixed(1) || business?.rating?.average?.toFixed(1) || '5.0'} / 5.0 ({reviews.length} reviews)
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse shadow-soft" />)}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map(rev => (
            <div key={rev._id} className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-charcoal text-sm">
                    {rev.authorId?.firstName} {rev.authorId?.lastName}
                  </h3>
                  <span className="text-xs text-gray-400">{formatRelativeTime(rev.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < (rev.rating || 5) ? 'fill-amber-500 text-amber-500' : 'text-gray-200'}`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-sm text-gray-600">{rev.content || rev.reviewText}</p>

              {rev.reply?.text ? (
                <div className="bg-gray-50 rounded-xl p-3 text-xs text-charcoal border-l-2 border-burgundy">
                  <span className="font-bold block text-burgundy mb-0.5">Your Response:</span>
                  <p>{rev.reply.text}</p>
                </div>
              ) : activeReplyId === rev._id ? (
                <div className="pt-2 flex gap-2">
                  <input
                    type="text"
                    value={replyText[rev._id] || ''}
                    onChange={e => setReplyText({ ...replyText, [rev._id]: e.target.value })}
                    placeholder="Write a public response..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none"
                  />
                  <button
                    onClick={() => handleSendReply(rev._id)}
                    className="px-3 py-1.5 bg-burgundy text-white rounded-lg text-xs font-semibold"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => setActiveReplyId(null)}
                    className="px-3 py-1.5 border border-gray-200 text-charcoal rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setActiveReplyId(rev._id)}
                  className="text-xs font-semibold text-burgundy hover:underline flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Reply to Review
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-gray-100">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-playfair text-xl font-bold text-charcoal">No reviews yet</h3>
          <p className="text-sm text-gray-500 mt-1">Clients you collaborate with can submit feedback on your public profile.</p>
        </div>
      )}
    </div>
  );
}
