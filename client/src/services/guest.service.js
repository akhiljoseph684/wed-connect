import api from './api';

export const guestService = {
  getGuests: (planId, params) => api.get(`/guests/plan/${planId}`, { params }),
  createGuest: (planId, data) => api.post(`/guests/plan/${planId}`, data),
  updateGuest: (guestId, data) => api.patch(`/guests/${guestId}`, data),
  updateRsvp: (guestId, rsvpStatus) => api.patch(`/guests/${guestId}/rsvp`, { rsvpStatus }),
  deleteGuest: (guestId) => api.delete(`/guests/${guestId}`),
};

export default guestService;
