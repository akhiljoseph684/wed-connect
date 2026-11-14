import mongoose from 'mongoose';

const platformSettingsSchema = new mongoose.Schema(
  {
    allowNewUserRegistrations: {
      type: Boolean,
      default: true,
    },
    enforceEmailVerification: {
      type: Boolean,
      default: false,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const PlatformSettings = mongoose.model('PlatformSettings', platformSettingsSchema);
export default PlatformSettings;
