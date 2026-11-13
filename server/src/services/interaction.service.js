import { Like, Comment, Post, User, Notification } from '../models/index.js';
import { ApiError } from '../utils/apiResponse.js';
import { sendNotificationToUser } from '../config/socket.js';

export const toggleLikePost = async (userId, postId) => {
  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, 'Post not found');

  const existingLike = await Like.findOne({ userId, targetId: postId, targetType: 'post' });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    const updatedPost = await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } }, { new: true });
    return { isLiked: false, likesCount: Math.max(0, updatedPost.likesCount) };
  } else {
    await Like.create({ userId, targetId: postId, targetType: 'post' });
    const updatedPost = await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } }, { new: true });

    // Send notification to author if not liking own post
    if (post.authorId.toString() !== userId.toString()) {
      const user = await User.findById(userId).select('firstName lastName');
      const notification = await Notification.create({
        recipientId: post.authorId,
        senderId: userId,
        type: 'like',
        title: 'New Like',
        message: `${user?.firstName || 'Someone'} loved your post.`,
        link: `/posts/${postId}`,
      });
      sendNotificationToUser(post.authorId, notification);
    }

    return { isLiked: true, likesCount: updatedPost.likesCount };
  }
};

export const getPostLikes = async (postId) => {
  const likes = await Like.find({ targetId: postId, targetType: 'post' })
    .populate('userId', 'firstName lastName displayName avatarUrl bio')
    .sort({ createdAt: -1 })
    .limit(50);
  return likes.map((l) => l.userId);
};

export const getPostComments = async (postId, { page = 1, limit = 50 }) => {
  const skip = (page - 1) * limit;
  const [comments, total] = await Promise.all([
    Comment.find({ postId, parentCommentId: null })
      .populate('authorId', 'firstName lastName displayName avatarUrl')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit),
    Comment.countDocuments({ postId, parentCommentId: null }),
  ]);

  return { comments, total };
};

export const addComment = async (postId, authorId, { text, parentCommentId = null }) => {
  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, 'Post not found');

  const comment = await Comment.create({
    postId,
    authorId,
    parentCommentId,
    text,
  });

  await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

  const populatedComment = await Comment.findById(comment._id).populate('authorId', 'firstName lastName displayName avatarUrl');

  // Notify post author
  if (post.authorId.toString() !== authorId.toString()) {
    const author = await User.findById(authorId).select('firstName lastName');
    const notification = await Notification.create({
      recipientId: post.authorId,
      senderId: authorId,
      type: 'comment',
      title: 'New Comment',
      message: `${author?.firstName || 'Someone'} commented on your wedding post: "${text.substring(0, 40)}..."`,
      link: `/posts/${postId}`,
    });
    sendNotificationToUser(post.authorId, notification);
  }

  return populatedComment;
};

export const deleteComment = async (commentId, userId, isAdmin = false) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, 'Comment not found');

  if (!isAdmin && comment.authorId.toString() !== userId.toString()) {
    throw new ApiError(403, 'You are not authorized to delete this comment');
  }

  await Comment.findByIdAndDelete(commentId);
  await Post.findByIdAndUpdate(comment.postId, { $inc: { commentsCount: -1 } });
  return true;
};
