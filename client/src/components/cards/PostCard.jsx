import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark, Share2, MapPin } from 'lucide-react';
import { useSelector } from 'react-redux';
import { interactionService } from '../../services/interaction.service.js';
import toast from 'react-hot-toast';

export const PostCard = ({ post, onSaveClick, onPostUpdated }) => {
  const { user } = useSelector((state) => state.auth);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please sign in to like inspirations');
      return;
    }

    try {
      setIsLiking(true);
      const res = await interactionService.toggleLike(post._id);
      setIsLiked(res.data.isLiked);
      setLikesCount(res.data.likesCount);
      if (onPostUpdated) onPostUpdated();
    } catch (err) {
      toast.error('Failed to update like');
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/posts/${post._id}`);
    toast.success('Link copied to clipboard!');
  };

  const firstMedia = post.media?.[0]?.url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';

  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-burgundy/5 shadow-soft hover:shadow-elevated transition-all duration-300 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-ivory-200">
        <Link
          to={`/users/${post.authorId?._id}`}
          className="flex items-center gap-3 hover:opacity-85 transition-opacity"
        >
          <img
            src={post.authorId?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt={post.authorId?.firstName || 'Author'}
            className="w-10 h-10 rounded-full object-cover border border-rose/20"
          />
          <div>
            {console.log(post)}
            <h4 className="text-sm font-semibold text-charcoal">
              {post.authorId?.displayName || `${post.authorId?.firstName} ${post.authorId?.lastName}`}
            </h4>
            {post.location && (
              <span className="flex items-center text-[11px] text-mutedGray gap-1">
                <MapPin className="w-3 h-3 text-rose" />
                {post.location}
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* Media Image */}
      <Link to={`/posts/${post._id}`} className="relative block overflow-hidden aspect-[4/5] bg-ivory-200">
        <img
          src={firstMedia}
          alt={post.title || 'Wedding inspiration'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p className="text-white text-xs font-serif italic line-clamp-2">
            {post.title || post.content}
          </p>
        </div>
      </Link>

      {/* Content & Actions */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        {/* Caption */}
        <div>
          {post.title && <h3 className="font-serif text-base font-medium text-charcoal mb-1 line-clamp-1">{post.title}</h3>}
          <p className="text-xs text-charcoal/80 line-clamp-2 leading-relaxed">{post.content}</p>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-[10px] text-mutedGray hover:text-burgundy transition-colors">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between pt-2 border-t border-ivory-200 text-mutedGray text-xs">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-1.5 transition-colors ${
                isLiked ? 'text-burgundy font-semibold' : 'hover:text-burgundy'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-burgundy text-burgundy' : ''}`} />
              <span>{likesCount}</span>
            </button>
            <Link to={`/posts/${post._id}`} className="flex items-center gap-1.5 hover:text-charcoal transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span>{post.commentsCount || 0}</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              title="Share"
              className="p-1 hover:text-charcoal transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onSaveClick) onSaveClick(post);
              }}
              title="Save to Collection"
              className="p-1 hover:text-burgundy transition-colors"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
