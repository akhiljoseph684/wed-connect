import { Guest } from '../models/index.js';
import { ApiError } from '../utils/apiResponse.js';

export const getPlanGuests = async (planId, { rsvpStatus, group, search } = {}) => {
  const filter = { planId };
  if (rsvpStatus) filter.rsvpStatus = rsvpStatus;
  if (group) filter.group = group;
  if (search) {
    filter.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
  }

  return await Guest.find(filter).sort({ lastName: 1, firstName: 1 });
};

export const createGuest = async (planId, guestData) => {
  return await Guest.create({
    planId,
    firstName: guestData.firstName,
    lastName: guestData.lastName,
    email: guestData.email || '',
    phone: guestData.phone || '',
    side: guestData.side || 'both',
    group: guestData.group || 'friends',
    invitationStatus: guestData.invitationStatus || 'not_sent',
    rsvpStatus: guestData.rsvpStatus || 'pending',
    dietaryRestrictions: guestData.dietaryRestrictions || '',
    plusOne: guestData.plusOne || { allowed: false, hasPlusOne: false, name: '' },
    tableNumber: guestData.tableNumber || '',
    notes: guestData.notes || '',
  });
};

export const updateGuest = async (guestId, updateData) => {
  const guest = await Guest.findByIdAndUpdate(guestId, updateData, { new: true, runValidators: true });
  if (!guest) throw new ApiError(404, 'Guest not found');
  return guest;
};

export const deleteGuest = async (guestId) => {
  const guest = await Guest.findByIdAndDelete(guestId);
  if (!guest) throw new ApiError(404, 'Guest not found');
  return true;
};

export const updateRsvpStatus = async (guestId, rsvpStatus) => {
  const guest = await Guest.findByIdAndUpdate(guestId, { rsvpStatus }, { new: true });
  if (!guest) throw new ApiError(404, 'Guest not found');
  return guest;
};
