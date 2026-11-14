import { useState, useEffect } from 'react';
import { Settings, Save, ShieldAlert, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/admin.service.js';

export default function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [requireEmailVerification, setRequireEmailVerification] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getSettings()
      .then((res) => {
        const s = res.data;
        if (s) {
          setAllowRegistration(s.allowNewUserRegistrations !== false);
          setRequireEmailVerification(Boolean(s.enforceEmailVerification));
          setMaintenanceMode(Boolean(s.maintenanceMode));
        }
      })
      .catch((err) => console.error('Failed to load settings', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateSettings({
        allowNewUserRegistrations: Boolean(allowRegistration),
        enforceEmailVerification: Boolean(requireEmailVerification),
        maintenanceMode: Boolean(maintenanceMode),
      });
      toast.success('Global platform settings updated live!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update platform settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-2xl mx-auto h-64 bg-white rounded-2xl animate-pulse shadow-soft" />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
          <Settings className="w-6 h-6 text-burgundy" /> Global Platform Settings
        </h1>
        <p className="text-sm text-gray-500">Configure core platform availability and authentication rules</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-sand/60 space-y-6">
        <div className="flex items-center justify-between p-4 bg-sand/15 rounded-xl border border-sand/40">
          <div>
            <p className="text-sm font-semibold text-charcoal">Allow New User Registrations</p>
            <p className="text-xs text-mutedGray">Enable or temporarily suspend signups platform-wide</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={allowRegistration}
              onChange={(e) => setAllowRegistration(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-burgundy"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-sand/15 rounded-xl border border-sand/40">
          <div>
            <p className="text-sm font-semibold text-charcoal">Enforce Email Verification</p>
            <p className="text-xs text-mutedGray">Require verified email before allowing post creation and planning</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={requireEmailVerification}
              onChange={(e) => setRequireEmailVerification(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-burgundy"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-red-50/50 border border-red-200 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-red-700 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Platform Maintenance Mode
            </p>
            <p className="text-xs text-red-600/80">
              Only platform administrators will be granted access while maintenance mode is active
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>

        <div className="flex justify-end pt-3 border-t border-sand/40">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 disabled:opacity-50 transition shadow-soft"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Platform Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
