import { WeddingPlan, WeddingPlanMember, Task, Expense, Guest, Business, User } from '../models/index.js';
import { ApiError } from '../utils/apiResponse.js';

export const getUserWeddingPlans = async (userId) => {
  const [ownedPlans, memberPlans] = await Promise.all([
    WeddingPlan.find({ ownerId: userId }).sort({ createdAt: -1 }),
    WeddingPlanMember.find({ userId, status: 'accepted' }).populate('planId'),
  ]);

  const plansMap = new Map();
  ownedPlans.forEach((p) => plansMap.set(p._id.toString(), p));
  memberPlans.forEach((m) => {
    if (m.planId && !plansMap.has(m.planId._id.toString())) {
      plansMap.set(m.planId._id.toString(), m.planId);
    }
  });

  return Array.from(plansMap.values());
};

export const createWeddingPlan = async (ownerId, planData) => {
  const partner1 =
    planData.partner1Name ||
    planData.coupleNames?.partner1Name ||
    planData.coupleNames?.partner1 ||
    '';
  const partner2 =
    planData.partner2Name ||
    planData.coupleNames?.partner2Name ||
    planData.coupleNames?.partner2 ||
    '';

  const plan = await WeddingPlan.create({
    ownerId,
    title: planData.title || `${partner1} & ${partner2}'s Wedding`,
    partner1Name: partner1,
    partner2Name: partner2,
    weddingDate: planData.weddingDate,
    city: planData.city || planData.location?.city || '',
    country: planData.country || planData.location?.country || '',
    venueName: planData.venueName || planData.location?.venue || planData.location?.venueName || '',
    totalBudget: planData.totalBudget || planData.budget?.total || 30000,
    currency: planData.currency || planData.budget?.currency || 'USD',
    weddingTheme: planData.weddingTheme || 'Classic Romantic',
    estimatedGuests: planData.estimatedGuests || 120,
    coverImageUrl: planData.coverImageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
  });

  // Create owner member record
  await WeddingPlanMember.create({
    planId: plan._id,
    userId: ownerId,
    role: 'owner',
    permissions: ['all'],
    status: 'accepted',
  });

  // Initialize standard wedding tasks starter checklist
  const standardTasks = [
    { title: 'Determine overall wedding budget and vision', category: 'other', priority: 'high', order: 1 },
    { title: 'Tour and book dream wedding venue', category: 'venue', priority: 'urgent', order: 2 },
    { title: 'Book professional wedding photographer & videographer', category: 'photography', priority: 'high', order: 3 },
    { title: 'Finalize guest list and gather mailing addresses', category: 'invitations', priority: 'medium', order: 4 },
    { title: 'Select wedding party attire and bridal gown', category: 'attire', priority: 'medium', order: 5 },
    { title: 'Catering menu tasting and cocktail curation', category: 'catering', priority: 'medium', order: 6 },
    { title: 'Send out Save-The-Dates', category: 'invitations', priority: 'medium', order: 7 },
    { title: 'Floral design and table setting mockup', category: 'decor', priority: 'low', order: 8 },
  ];

  await Task.insertMany(standardTasks.map((t) => ({ ...t, planId: plan._id })));

  // Initialize initial expense categories
  const standardExpenses = [
    { title: 'Reception & Ceremony Venue', category: 'Venue', estimatedAmount: plan.totalBudget * 0.45, status: 'estimated' },
    { title: 'Catering & Beverages', category: 'Catering', estimatedAmount: plan.totalBudget * 0.25, status: 'estimated' },
    { title: 'Photography & Cinema', category: 'Photography', estimatedAmount: plan.totalBudget * 0.12, status: 'estimated' },
    { title: 'Floral & Event Styling', category: 'Decor', estimatedAmount: plan.totalBudget * 0.08, status: 'estimated' },
    { title: 'Music & Entertainment', category: 'Music', estimatedAmount: plan.totalBudget * 0.05, status: 'estimated' },
    { title: 'Wedding Attire & Rings', category: 'Attire', estimatedAmount: plan.totalBudget * 0.05, status: 'estimated' },
  ];

  await Expense.insertMany(standardExpenses.map((e) => ({ ...e, planId: plan._id })));

  // Enable planner capability
  await User.findByIdAndUpdate(ownerId, { 'capabilities.isPlanner': true });

  return plan;
};

export const getWeddingPlanDetails = async (planId) => {
  const plan = await WeddingPlan.findById(planId).populate('savedVendorIds', 'name slug logoUrl rating startingPrice location');
  if (!plan) throw new ApiError(404, 'Wedding plan not found');

  const [tasks, expenses, guests, members] = await Promise.all([
    Task.find({ planId }).sort({ order: 1, dueDate: 1 }),
    Expense.find({ planId }).sort({ createdAt: 1 }),
    Guest.find({ planId }).sort({ lastName: 1 }),
    WeddingPlanMember.find({ planId }).populate('userId', 'firstName lastName email avatarUrl'),
  ]);

  // Aggregate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;

  const totalEstimatedExpense = expenses.reduce((sum, e) => sum + (e.estimatedAmount || 0), 0);
  const totalActualExpense = expenses.reduce((sum, e) => sum + (e.actualAmount || 0), 0);
  const totalPaidExpense = expenses.reduce((sum, e) => sum + (e.paidAmount || 0), 0);

  const totalGuests = guests.length;
  const attendingGuests = guests.filter((g) => g.rsvpStatus === 'attending').length;
  const declinedGuests = guests.filter((g) => g.rsvpStatus === 'declined').length;
  const pendingGuests = guests.filter((g) => g.rsvpStatus === 'pending').length;

  return {
    plan,
    stats: {
      totalTasks,
      completedTasks,
      taskProgressPercentage: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
      totalBudget: plan.totalBudget,
      totalEstimatedExpense,
      totalActualExpense,
      totalPaidExpense,
      remainingBudget: plan.totalBudget - (totalActualExpense || totalEstimatedExpense),
      totalGuests,
      attendingGuests,
      declinedGuests,
      pendingGuests,
    },
    tasks,
    expenses,
    guests,
    members,
  };
};

export const updateWeddingPlan = async (planId, updateData) => {
  const data = {};

  if (updateData.title !== undefined) data.title = updateData.title;
  if (updateData.weddingDate !== undefined) data.weddingDate = updateData.weddingDate;
  if (updateData.weddingTheme !== undefined) data.weddingTheme = updateData.weddingTheme;
  if (updateData.estimatedGuests !== undefined) data.estimatedGuests = updateData.estimatedGuests;
  if (updateData.coverImageUrl !== undefined) data.coverImageUrl = updateData.coverImageUrl;
  if (updateData.isPrivate !== undefined) data.isPrivate = updateData.isPrivate;

  // Partner names (support flat and nested)
  const p1 = updateData.partner1Name || updateData.coupleNames?.partner1 || updateData.coupleNames?.partner1Name;
  if (p1 !== undefined) data.partner1Name = p1;
  const p2 = updateData.partner2Name || updateData.coupleNames?.partner2 || updateData.coupleNames?.partner2Name;
  if (p2 !== undefined) data.partner2Name = p2;

  // Location (support flat and nested)
  const city = updateData.city || updateData.location?.city;
  if (city !== undefined) data.city = city;
  const country = updateData.country || updateData.location?.country;
  if (country !== undefined) data.country = country;
  const venue = updateData.venueName || updateData.location?.venue || updateData.location?.venueName;
  if (venue !== undefined) data.venueName = venue;

  // Budget (support flat and nested)
  const totalBudget = updateData.totalBudget ?? updateData.budget?.total;
  if (totalBudget !== undefined) data.totalBudget = totalBudget;
  const currency = updateData.currency || updateData.budget?.currency;
  if (currency !== undefined) data.currency = currency;

  const plan = await WeddingPlan.findByIdAndUpdate(planId, data, { new: true, runValidators: true });
  if (!plan) throw new ApiError(404, 'Wedding plan not found');
  return plan;
};

export const deleteWeddingPlan = async (planId) => {
  await Promise.all([
    WeddingPlan.findByIdAndDelete(planId),
    WeddingPlanMember.deleteMany({ planId }),
    Task.deleteMany({ planId }),
    Expense.deleteMany({ planId }),
    Guest.deleteMany({ planId }),
  ]);
  return true;
};

export const toggleSaveVendorToPlan = async (planId, vendorId) => {
  const plan = await WeddingPlan.findById(planId);
  if (!plan) throw new ApiError(404, 'Wedding plan not found');

  const vendorIndex = plan.savedVendorIds.findIndex((id) => id.toString() === vendorId.toString());
  if (vendorIndex > -1) {
    plan.savedVendorIds.splice(vendorIndex, 1);
    await plan.save();
    return { isSaved: false };
  } else {
    plan.savedVendorIds.push(vendorId);
    await plan.save();
    return { isSaved: true };
  }
};

export const addTimelineEvent = async (planId, eventData) => {
  const plan = await WeddingPlan.findById(planId);
  if (!plan) throw new ApiError(404, 'Wedding plan not found');

  plan.timelineEvents.push(eventData);
  await plan.save();
  return plan.timelineEvents;
};

export const deleteTimelineEvent = async (planId, eventIndex) => {
  const plan = await WeddingPlan.findById(planId);
  if (!plan) throw new ApiError(404, 'Wedding plan not found');

  plan.timelineEvents.splice(eventIndex, 1);
  await plan.save();
  return plan.timelineEvents;
};

export const addPlanMember = async (planId, email, role = 'collaborator') => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new ApiError(404, `No WedConnect user found with email ${email}`);

  const existing = await WeddingPlanMember.findOne({ planId, userId: user._id });
  if (existing) throw new ApiError(400, 'User is already a member of this wedding plan');

  const member = await WeddingPlanMember.create({
    planId,
    userId: user._id,
    role,
    status: 'accepted',
  });

  return await member.populate('userId', 'firstName lastName email avatarUrl');
};
