import React, { useState } from 'react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import { guestService } from '../../services/guest.service.js';
import toast from 'react-hot-toast';

export const CreateGuestModal = ({ isOpen, onClose, planId, onCreated }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [side, setSide] = useState('both');
  const [group, setGroup] = useState('friends');
  const [rsvpStatus, setRsvpStatus] = useState('pending');
  const [allowPlusOne, setAllowPlusOne] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [dietary, setDietary] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    try {
      setIsLoading(true);
      const res = await guestService.createGuest(planId, {
        firstName,
        lastName,
        email,
        phone,
        side,
        group,
        rsvpStatus,
        plusOne: { allowed: allowPlusOne },
        tableNumber,
        dietaryRestrictions: dietary,
      });

      toast.success('Guest added to invitation list!');
      if (onCreated) onCreated(res.data);
      onClose();
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setDietary('');
      setTableNumber('');
    } catch (err) {
      toast.error(err.message || 'Failed to add guest');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Wedding Guest" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name *"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            label="Last Name *"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80">
              Side
            </label>
            <select
              className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-charcoal/15 text-charcoal focus:outline-none focus:border-burgundy"
              value={side}
              onChange={(e) => setSide(e.target.value)}
            >
              <option value="both">Both</option>
              <option value="partner1">Partner 1</option>
              <option value="partner2">Partner 2</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80">
              Group
            </label>
            <select
              className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-charcoal/15 text-charcoal focus:outline-none focus:border-burgundy"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            >
              <option value="family">Family</option>
              <option value="friends">Friends</option>
              <option value="wedding_party">Wedding Party</option>
              <option value="colleagues">Colleagues</option>
              <option value="vip">VIP</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80">
              RSVP Status
            </label>
            <select
              className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-charcoal/15 text-charcoal focus:outline-none focus:border-burgundy"
              value={rsvpStatus}
              onChange={(e) => setRsvpStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="attending">Attending</option>
              <option value="declined">Declined</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Table Number / Assignment"
            placeholder="e.g. Table 4"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
          />
          <Input
            label="Dietary Restrictions"
            placeholder="e.g. Vegan, Nut Allergy"
            value={dietary}
            onChange={(e) => setDietary(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="allowPlusOne"
            checked={allowPlusOne}
            onChange={(e) => setAllowPlusOne(e.target.checked)}
            className="w-4 h-4 rounded text-burgundy focus:ring-burgundy"
          />
          <label htmlFor="allowPlusOne" className="text-xs text-charcoal font-medium">
            Allow +1 Plus One for this guest
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-charcoal/5">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            Add Guest
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateGuestModal;
