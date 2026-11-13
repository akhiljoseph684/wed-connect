import * as guestService from '../services/guest.service.js';
import { ApiResponse, asyncHandler } from '../utils/apiResponse.js';

export const getGuests = asyncHandler(async (req, res) => {
  const { rsvpStatus, group, search } = req.query;
  const guests = await guestService.getPlanGuests(req.params.planId, { rsvpStatus, group, search });
  return res.status(200).json(new ApiResponse(200, guests, 'Guests retrieved'));
});

export const createGuest = asyncHandler(async (req, res) => {
  const guest = await guestService.createGuest(req.params.planId, req.body);
  return res.status(201).json(new ApiResponse(201, guest, 'Guest added successfully'));
});

export const updateGuest = asyncHandler(async (req, res) => {
  const guest = await guestService.updateGuest(req.params.guestId, req.body);
  return res.status(200).json(new ApiResponse(200, guest, 'Guest updated'));
});

export const deleteGuest = asyncHandler(async (req, res) => {
  await guestService.deleteGuest(req.params.guestId);
  return res.status(200).json(new ApiResponse(200, null, 'Guest removed'));
});

export const updateRsvp = asyncHandler(async (req, res) => {
  const guest = await guestService.updateRsvpStatus(req.params.guestId, req.body.rsvpStatus);
  return res.status(200).json(new ApiResponse(200, guest, 'RSVP updated'));
});
