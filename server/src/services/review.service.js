import { Review, Business, Notification } from '../models/index.js';
import { ApiError } from '../utils/apiResponse.js';
import { sendNotificationToUser } from '../config/socket.js';

export const getBusinessReviews = async (businessId, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([
    Review.find({ businessId })
      .populate('authorId', 'firstName lastName avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ businessId }),
  ]);

  return { reviews, total, page: Number(page), pages: Math.ceil(total / limit) };
};

export const createReview = async (businessId, authorId, reviewData) => {
  const business = await Business.findById(businessId);
  if (!business) throw new ApiError(404, 'Business not found');

  if (business.ownerId.toString() === authorId.toString()) {
    throw new ApiError(400, 'You cannot review your own business.');
  }

  const existing = await Review.findOne({ businessId, authorId });
  if (existing) {
    throw new ApiError(400, 'You have already submitted a review for this vendor.');
  }

  const review = await Review.create({
    businessId,
    authorId,
    rating: reviewData.rating,
    title: reviewData.title,
    comment: reviewData.comment,
    weddingDate: reviewData.weddingDate,
  });

  // Notify vendor owner
  const notification = await Notification.create({
    recipientId: business.ownerId,
    senderId: authorId,
    type: 'review',
    title: 'New Client Review',
    message: `A client left a ${reviewData.rating}-star review for ${business.name}`,
    link: `/vendor/reviews`,
  });
  sendNotificationToUser(business.ownerId, notification);

  return await Review.findById(review._id).populate('authorId', 'firstName lastName avatarUrl');
};

export const updateReview = async (reviewId, userId, updateData) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new ApiError(404, 'Review not found');

  if (review.authorId.toString() !== userId.toString()) {
    throw new ApiError(403, 'You are not authorized to edit this review');
  }

  if (updateData.rating !== undefined) review.rating = updateData.rating;
  if (updateData.title !== undefined) review.title = updateData.title;
  if (updateData.comment !== undefined) review.comment = updateData.comment;
  if (updateData.weddingDate !== undefined) review.weddingDate = updateData.weddingDate;

  await review.save();
  return await Review.findById(review._id).populate('authorId', 'firstName lastName avatarUrl');
};

export const replyToReview = async (reviewId, userId, text) => {
  const review = await Review.findById(reviewId).populate('businessId');
  if (!review) throw new ApiError(404, 'Review not found');

  if (review.businessId.ownerId.toString() !== userId.toString()) {
    throw new ApiError(403, 'Unauthorized to reply to this review');
  }

  review.reply = {
    text,
    repliedAt: new Date(),
  };

  await review.save();
  return review;
};

export const deleteReview = async (reviewId, userId, isAdmin = false) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new ApiError(404, 'Review not found');

  if (!isAdmin && review.authorId.toString() !== userId.toString()) {
    throw new ApiError(403, 'Unauthorized to delete this review');
  }

  await Review.findByIdAndDelete(reviewId);
  return true;
};
