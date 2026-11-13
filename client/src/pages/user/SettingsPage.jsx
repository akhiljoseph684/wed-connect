import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Settings, Shield, Bell, Lock, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { clearAuth } from '../../store/slices/authSlice.js';
import authService from '../../services/auth.service.js';

export default function SettingsPage() {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('account');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // ignore
    } finally {
      localStorage.removeItem('wedconnect_access_token');
      localStorage.removeItem('wedconnect_user');
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
        <p className="text-sm text-gray-500">Manage your account preferences and privacy</p>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
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
                <div className="mt-3 p-4 bg-gray-50 rounded-xl space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name</span>
                    <span className="font-medium text-charcoal">{user?.firstName} {user?.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium text-charcoal">{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Role</span>
                    <span className="font-medium capitalize text-burgundy">{user?.role}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-charcoal mb-2">Password & Security</h3>
                <p className="text-xs text-gray-500 mb-4">Want to reset or change your account password?</p>
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 text-charcoal transition-all"
                >
                  <Lock className="w-4 h-4 text-gray-500" /> Send Password Reset Link
                </button>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-semibold text-red-600">Sign Out</h3>
                  <p className="text-xs text-gray-500">Log out from this device</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-all"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-charcoal">Email Notifications</p>
                  <p className="text-xs text-gray-500">Receive emails for new messages and enquiry updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifs}
                  onChange={e => setEmailNotifs(e.target.checked)}
                  className="w-4 h-4 text-burgundy rounded"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-charcoal">Push Notifications</p>
                  <p className="text-xs text-gray-500">In-browser alert notifications for social activity</p>
                </div>
                <input
                  type="checkbox"
                  checked={pushNotifs}
                  onChange={e => setPushNotifs(e.target.checked)}
                  className="w-4 h-4 text-burgundy rounded"
                />
              </div>

              <button
                onClick={() => toast.success('Preferences saved!')}
                className="mt-4 px-5 py-2.5 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 transition-all shadow-soft"
              >
                Save Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
