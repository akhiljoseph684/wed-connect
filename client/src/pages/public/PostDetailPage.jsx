import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postService } from '../../services/post.service.js';
import { interactionService } from '../../services/interaction.service.js';
import SaveToCollectionModal from '../../components/modals/SaveToCollectionModal.jsx';
import Button from '../../components/common/Button.jsx';
import { useSelector } from 'react-redux';
import { Heart, MessageCircle, Bookmark, Share2, MapPin, Send, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters.js';
import toast from 'react-hot-toast';

export const PostDetailPage = () => {
  const { postId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const fetchPost = async () => {
    setIsLoading(true);
    try {
      const [postRes, commentRes] = await Promise.all([
        postService.getPostById(postId),
        interactionService.getComments(postId),
      ]);
      setPost(postRes.data);
      setIsLiked(postRes.data?.isLiked || false);
      setLikesCount(postRes.data?.likesCount || 0);
      setComments(commentRes.data?.comments || []);

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like inspirations');
      return;
    }
    try {
      const res = await interactionService.toggleLike(postId);
      setIsLiked(res.data.isLiked);
      setLikesCount(res.data.likesCount);
    } catch (err) {
      toast.error('Failed to update like');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!user) {
      toast.error('Please sign in to leave a comment');
      return;
    }

    try {
      setIsSubmittingComment(true);
      const res = await interactionService.addComment(postId, { text: commentText });
      setComments([...comments, res.data]);
      setCommentText('');
      toast.success('Comment posted!');
    } catch (err) {
      toast.error('Failed to post comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await interactionService.deleteComment(commentId);
      setComments(comments.filter((c) => c._id !== commentId));
      toast.success('Comment deleted');
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (!post && !isLoading) {
    return (
      <div className="py-20 text-center">
        <h2 className="font-serif text-2xl text-charcoal">Post Not Found</h2>
        <Link to="/explore" className="text-sm text-burgundy underline mt-2 block">
          Return to Explore Feed
        </Link>
      </div>
    );
  }

  const media = post?.media?.[0]?.url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-3xl overflow-hidden border border-burgundy/10 shadow-luxury grid grid-cols-1 lg:grid-cols-12">
        {/* Media Side (Left) */}
        <div className="lg:col-span-7 bg-charcoal flex items-center justify-center overflow-hidden min-h-[450px]">
          <img src={media} alt={post?.title} className="w-full h-full object-cover max-h-[750px]" />
        </div>

        {/* Content & Comments Side (Right) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 space-y-6">
          {/* Header Author Info */}
          <div className="flex items-center justify-between pb-4 border-b border-ivory-200">
            <Link to={`/users/${post?.authorId?._id}`} className="flex items-center gap-3">
              <img
                src={post?.authorId?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt={post?.authorId?.firstName}
                className="w-12 h-12 rounded-full object-cover border border-rose/30"
              />
              <div>
                <h3 className="font-semibold text-sm text-charcoal">
                  {post?.authorId?.displayName || `${post?.authorId?.firstName} ${post?.authorId?.lastName}`}
                </h3>
                {post?.location && (
                  <span className="flex items-center gap-1 text-[11px] text-mutedGray">
                    <MapPin className="w-3 h-3 text-rose" />
                    {post.location}
                  </span>
                )}
              </div>
            </Link>

            {post?.categoryId && (
              <span className="text-xs bg-ivory-200 text-burgundy font-medium px-3 py-1 rounded-full">
                {post.categoryId.name}
              </span>
            )}
          </div>

          {/* Post Description */}
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-2">
            {post?.title && <h1 className="font-serif text-xl font-medium text-charcoal">{post.title}</h1>}
            <p className="text-xs sm:text-sm text-charcoal/80 leading-relaxed whitespace-pre-line">
              {post?.content}
            </p>

            {post?.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {post.tags.map((t, idx) => (
                  <span key={idx} className="text-xs text-rose font-medium">#{t}</span>
                ))}
              </div>
            )}

            {/* Comments List */}
            <div className="pt-6 border-t border-ivory-200 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-mutedGray">
                Comments ({comments.length})
              </h4>
              {comments.length === 0 ? (
                <p className="text-xs text-mutedGray italic">Be the first to comment on this look.</p>
              ) : (
                <div className="space-y-3">
                  {comments.map((c) => (
                    <div key={c._id} className="flex items-start justify-between gap-3 bg-ivory-50 p-3 rounded-xl border border-charcoal/5">
                      <div className="flex items-start gap-2.5">
                        <img
                          src={c.authorId?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}
                          alt={c.authorId?.firstName}
                          className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                        />
                        <div>
                          <span className="text-xs font-semibold text-charcoal block">
                            {c.authorId?.displayName || c.authorId?.firstName}
                          </span>
                          <p className="text-xs text-charcoal/80 leading-relaxed">{c.text}</p>
                        </div>
                      </div>
                      {(user?._id === c.authorId?._id || user?.role === 'admin') && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(c._id)}
                          className="text-mutedGray hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Bar & Comment Box */}
          <div className="pt-4 border-t border-ivory-200 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 transition-colors ${
                    isLiked ? 'text-burgundy font-semibold' : 'text-mutedGray hover:text-burgundy'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-burgundy text-burgundy' : ''}`} />
                  <span>{likesCount} Likes</span>
                </button>
                <span className="flex items-center gap-1.5 text-mutedGray">
                  <MessageCircle className="w-5 h-5" />
                  <span>{comments.length}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2 text-mutedGray hover:text-charcoal transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(true)}
                  className="p-2 text-mutedGray hover:text-burgundy transition-colors"
                >
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Comment input form */}
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2.5 text-xs rounded-full border border-charcoal/15 bg-ivory-50 focus:outline-none focus:border-burgundy focus:bg-white transition-all"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <Button type="submit" size="sm" variant="primary" className="rounded-full px-4" isLoading={isSubmittingComment}>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {isSaveModalOpen && (
        <SaveToCollectionModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          post={post}
        />
      )}
    </div>
  );
};

export default PostDetailPage;
