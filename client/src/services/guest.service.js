import api from './api';

export const guestService = {
  getGuests: (planId, params) => api.get(`/guests/plan/${planId}`, { params }),
  createGuest: (planId, data) => api.post(`/guests/plan/${planId}`, data),
  updateGuest: (guestId, data, planId) => api.patch(`/guests/${guestId}/${planId}`, data),
  updateRsvp: (guestId, rsvpStatus, planId) => api.patch(`/guests/${guestId}/rsvp/${planId}`, { rsvpStatus }),
  deleteGuest: (guestId, planId) => api.delete(`/guests/${guestId}/${planId}`),
};

export default guestService;
