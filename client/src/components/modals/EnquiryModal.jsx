import React, { useState } from 'react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import { enquiryService } from '../../services/enquiry.service.js';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

export const EnquiryModal = ({ isOpen, onClose, business, service }) => {
  const { user } = useSelector((state) => state.auth);
  const [coupleNames, setCoupleNames] = useState(user?.displayName || (user ? `${user.firstName} & Partner` : ''));
  const [weddingDate, setWeddingDate] = useState('');
  const [guestCount, setGuestCount] = useState(100);
  const [estimatedBudget, setEstimatedBudget] = useState(service?.price || business?.startingPrice || 3500);
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [message, setMessage] = useState(
    service
      ? `Hello! We are interested in booking the "${service.name}" collection for our wedding celebration. Could you confirm your availability?`
      : `Hello! We love your work and would like to learn more about your wedding packages and availability.`
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to send booking enquiries');
      return;
    }

    try {
      setIsLoading(true);
      await enquiryService.createEnquiry(business._id, {
        serviceId: service?._id || undefined,
        coupleNames,
        weddingDate: weddingDate || undefined,
        guestCount: Number(guestCount) || 0,
        estimatedBudget: Number(estimatedBudget) || 0,
        contactEmail,
        contactPhone,
        message,
      });

      toast.success(`Enquiry sent directly to ${business.name}! They will respond via messages.`);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to send enquiry');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Request Quote — ${business?.name}`}
      description="Connect directly with the vendor team to check dates, receive pricing, and schedule a consultation."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Couple Names *"
            required
            value={coupleNames}
            onChange={(e) => setCoupleNames(e.target.value)}
          />
          <Input
            label="Wedding Date"
            type="date"
            value={weddingDate}
            onChange={(e) => setWeddingDate(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Estimated Guest Count"
            type="number"
            value={guestCount}
            onChange={(e) => setGuestCount(e.target.value)}
          />
          <Input
            label="Estimated Budget (USD)"
            type="number"
            value={estimatedBudget}
            onChange={(e) => setEstimatedBudget(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email Address *"
            type="email"
            required
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
          <Input
            label="Phone Number"
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80">
            Personal Message *
          </label>
          <textarea
            required
            rows={3}
            className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-white border border-charcoal/15 text-charcoal placeholder:text-mutedGray/60 focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/15 resize-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-charcoal/5">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            Send Wedding Enquiry
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EnquiryModal;
