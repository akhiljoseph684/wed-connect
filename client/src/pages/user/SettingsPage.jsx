import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Settings, Shield, Bell, Lock, LogOut, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { clearAuth, updateUser } from '../../store/slices/authSlice.js';
import authService from '../../services/auth.service.js';
import userService from '../../services/user.service.js';

export default function SettingsPage() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('account');
  const [emailNotifs, setEmailNotifs] = useState(
    user?.notificationPreferences?.emailNotifications ?? true
  );
  const [pushNotifs, setPushNotifs] = useState(
    user?.notificationPreferences?.pushNotifications ?? true
  );
  const [isSavingNotifs, setIsSavingNotifs] = useState(false);

  useEffect(() => {
    if (user?.notificationPreferences) {
      setEmailNotifs(user.notificationPreferences.emailNotifications ?? true);
      setPushNotifs(user.notificationPreferences.pushNotifications ?? true);
    }
  }, [user]);

  const handleSaveNotifications = async () => {
    setIsSavingNotifs(true);
    try {
      const res = await userService.updateMe({
        notificationPreferences: {
          emailNotifications: Boolean(emailNotifs),
          pushNotifications: Boolean(pushNotifs),
        },
      });
      const updated = res.data?.user || res.data;
      dispatch(updateUser(updated));
      toast.success('Notification preferences saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update preferences');
    } finally {
      setIsSavingNotifs(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // ignore
    } finally {
      dispatch(clearAuth());
      toast.success('Logged out successfully');
      navigate('/login');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
          <Settings className="w-6 h-6 text-burgundy" /> Settings
        </h1>
        <p className="text-sm text-gray-500">Manage your account preferences, security, and alerts</p>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-sand/60 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-sand/40 bg-sand/10">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex-1 py-3.5 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'account'
                ? 'border-burgundy text-burgundy bg-white'
                : 'border-transparent text-gray-500 hover:text-charcoal'
            }`}
          >
            <Shield className="w-4 h-4" /> Account & Security
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-3.5 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'notifications'
                ? 'border-burgundy text-burgundy bg-white'
                : 'border-transparent text-gray-500 hover:text-charcoal'
            }`}
          >
            <Bell className="w-4 h-4" /> Notifications
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {activeTab === 'account' ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-charcoal">Account Details</h3>
                <div className="mt-3 p-4 bg-sand/15 rounded-xl space-y-2 text-sm border border-sand/40">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name</span>
                    <span className="font-medium text-charcoal">
                      {user?.firstName} {user?.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium text-charcoal">{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email Status</span>
                    <span
                      className={`font-semibold text-xs px-2 py-0.5 rounded-full ${
                        user?.isEmailVerified
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {user?.isEmailVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Platform Role</span>
                    <span className="font-medium capitalize text-burgundy">{user?.role}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-sand/40">
                <h3 className="text-sm font-semibold text-charcoal mb-2">Password & Security</h3>
                <p className="text-xs text-gray-500 mb-4">Want to reset or change your account password?</p>
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="flex items-center gap-2 px-4 py-2 border border-sand rounded-xl text-sm font-medium hover:bg-sand/20 text-charcoal transition-all"
                >
                  <Lock className="w-4 h-4 text-gray-500" /> Send Password Reset Link
                </button>
              </div>

              <div className="pt-4 border-t border-sand/40 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-semibold text-red-600">Sign Out</h3>
                  <p className="text-xs text-gray-500">Log out from this device</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-all border border-red-200"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 bg-sand/15 rounded-xl border border-sand/40">
                <div>
                  <p className="text-sm font-semibold text-charcoal">Email Notifications</p>
                  <p className="text-xs text-gray-500">
                    Receive email alerts for wedding enquiries, collaboration proposals, and messages
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifs}
                    onChange={(e) => setEmailNotifs(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-burgundy"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-sand/15 rounded-xl border border-sand/40">
                <div>
                  <p className="text-sm font-semibold text-charcoal">Push Notifications</p>
                  <p className="text-xs text-gray-500">
                    In-browser alert notifications for social hearts, comments, and task milestones
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pushNotifs}
                    onChange={(e) => setPushNotifs(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-burgundy"></div>
                </label>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveNotifications}
                  disabled={isSavingNotifs}
                  className="flex items-center gap-2 px-6 py-2.5 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 transition shadow-soft disabled:opacity-50"
                >
                  {isSavingNotifs ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Preferences
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
