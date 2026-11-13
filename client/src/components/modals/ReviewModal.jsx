import React, { useState } from 'react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import { reviewService } from '../../services/review.service.js';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';

export const ReviewModal = ({ isOpen, onClose, business, onSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !comment.trim()) {
      toast.error('Please enter a review headline and feedback');
      return;
    }

    try {
      setIsLoading(true);
      const res = await reviewService.createReview(business._id, {
        rating,
        title,
        comment,
        weddingDate: weddingDate || undefined,
      });

      toast.success('Thank you! Your wedding vendor review has been submitted.');
      if (onSubmitted) onSubmitted(res.data);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Review ${business?.name}`}
      description="Share your genuine wedding experience to help other couples plan their special day."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating stars */}
        <div className="flex flex-col items-center justify-center p-4 bg-ivory-100 rounded-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/70 mb-2">
            Your Rating
          </span>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-1 text-2xl transition-transform hover:scale-110 focus:outline-none"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star
                  className={`w-7 h-7 ${
                    (hoverRating || rating) >= star
                      ? 'fill-gold-500 text-gold-500'
                      : 'text-charcoal/20'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Review Headline *"
          required
          placeholder="e.g. Unbelievable eye for detail and stunning photos!"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80">
            Feedback & Details *
          </label>
          <textarea
            required
            rows={4}
            className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-white border border-charcoal/15 text-charcoal placeholder:text-mutedGray/60 focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/15 resize-none"
            placeholder="What made their service special? How did they support your wedding day vision?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <Input
          label="Your Wedding Date (Optional)"
          type="date"
          value={weddingDate}
          onChange={(e) => setWeddingDate(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-charcoal/5">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            Submit Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReviewModal;
