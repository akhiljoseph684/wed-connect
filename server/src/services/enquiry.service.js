import { Enquiry, Business, Conversation, Message, Notification, User } from '../models/index.js';
import { ApiError } from '../utils/apiResponse.js';
import { sendNotificationToUser } from '../config/socket.js';
import { sendVendorInquiryAlertEmail, sendAutoInquiryResponseEmail } from '../utils/email.js';

export const createEnquiry = async (userId, businessId, data) => {
  const business = await Business.findById(businessId).populate('ownerId', 'email firstName lastName');
  if (!business) throw new ApiError(404, 'Business not found');

  const vendorOwnerId = business.ownerId?._id || business.ownerId;
  const vendorEmail = business.contactEmail || business.ownerId?.email;

  // Check if existing conversation exists or create one
  let conversation = await Conversation.findOne({
    businessId,
    'participants.userId': { $all: [userId, vendorOwnerId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      type: 'business_enquiry',
      businessId,
      participants: [
        { userId, role: 'client' },
        { userId: vendorOwnerId, role: 'vendor' },
      ],
      lastMessage: {
        text: `New Enquiry from ${data.coupleNames}: "${data.message.substring(0, 60)}..."`,
        senderId: userId,
        sentAt: new Date(),
      },
    });
  }

  const enquiry = await Enquiry.create({
    businessId,
    userId,
    serviceId: data.serviceId || null,
    coupleNames: data.coupleNames,
    weddingDate: data.weddingDate,
    guestCount: data.guestCount || 0,
    estimatedBudget: data.estimatedBudget || 0,
    message: data.message,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone || '',
    conversationId: conversation._id,
  });

  // Post initial message into conversation
  await Message.create({
    conversationId: conversation._id,
    senderId: userId,
    text: `Wedding Enquiry for ${data.coupleNames}\nDate: ${data.weddingDate ? new Date(data.weddingDate).toLocaleDateString() : 'TBD'}\nGuests: ${data.guestCount || 'Not specified'}\n\n${data.message}`,
  });

  // Increment business enquiry count
  await Business.findByIdAndUpdate(businessId, { $inc: { enquiriesCount: 1 } });

  // Send notification to vendor owner
  const notification = await Notification.create({
    recipientId: vendorOwnerId,
    senderId: userId,
    type: 'enquiry',
    title: 'New Booking Enquiry',
    message: `${data.coupleNames} requested a quote for their wedding.`,
    link: `/vendor/enquiries/${enquiry._id}`,
  });
  sendNotificationToUser(vendorOwnerId, notification);

  // Issue 28: Send emails if vendor enabled alerts
  if (business.settings?.instantEmailAlerts !== false && vendorEmail) {
    sendVendorInquiryAlertEmail({
      vendorEmail,
      vendorName: business.name,
      clientName: data.coupleNames,
      clientEmail: data.contactEmail,
      message: data.message,
      weddingDate: data.weddingDate,
    }).catch((err) => console.error('[Enquiry Email Alert Warning]:', err.message));
  }

  if (business.settings?.autoInquiryResponse && data.contactEmail) {
    sendAutoInquiryResponseEmail({
      clientEmail: data.contactEmail,
      clientName: data.coupleNames,
      vendorName: business.name,
      customMessage:
        business.settings?.autoInquiryMessage ||
        'Thank you for reaching out! We have received your inquiry and will respond shortly.',
    }).catch((err) => console.error('[Auto Inquiry Email Warning]:', err.message));
  }

  return enquiry;
};

export const getSentEnquiries = async (userId) => {
  return await Enquiry.find({ userId })
    .populate('businessId', 'name slug logoUrl rating')
    .populate('serviceId', 'name price')
    .sort({ createdAt: -1 });
};

export const getReceivedEnquiries = async (userId) => {
  const business = await Business.findOne({ ownerId: userId });
  if (!business) return [];

  return await Enquiry.find({ businessId: business._id })
    .populate('userId', 'firstName lastName avatarUrl email')
    .populate('serviceId', 'name price')
    .sort({ createdAt: -1 });
};

export const getEnquiryById = async (enquiryId, userId) => {
  const enquiry = await Enquiry.findById(enquiryId)
    .populate('businessId', 'name slug logoUrl ownerId')
    .populate('userId', 'firstName lastName avatarUrl email')
    .populate('serviceId', 'name price duration description');

  if (!enquiry) throw new ApiError(404, 'Enquiry not found');

  const isClient = enquiry.userId._id.toString() === userId.toString();
  const isVendor = enquiry.businessId.ownerId.toString() === userId.toString();

  if (!isClient && !isVendor) {
    throw new ApiError(403, 'Unauthorized to view this enquiry');
  }

  return enquiry;
};

export const updateEnquiryStatus = async (enquiryId, userId, status) => {
  const enquiry = await Enquiry.findById(enquiryId).populate('businessId');
  if (!enquiry) throw new ApiError(404, 'Enquiry not found');

  if (enquiry.businessId.ownerId.toString() !== userId.toString()) {
    throw new ApiError(403, 'Only the vendor can update enquiry status');
  }

  enquiry.status = status;
  await enquiry.save();

  // Notify client
  const notification = await Notification.create({
    recipientId: enquiry.userId,
    senderId: userId,
    type: 'enquiry',
    title: 'Enquiry Status Updated',
    message: `${enquiry.businessId.name} updated your enquiry status to "${status.replace('_', ' ')}"`,
    link: `/messages/${enquiry.conversationId}`,
  });
  sendNotificationToUser(enquiry.userId, notification);

  return enquiry;
};
