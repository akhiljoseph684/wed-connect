import { useState } from 'react';
import { Settings, Save, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [requireEmailVerification, setRequireEmailVerification] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Platform configurations saved!');
    }, 400);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
          <Settings className="w-6 h-6 text-burgundy" /> Global Platform Settings
        </h1>
        <p className="text-sm text-gray-500">Configure core platform availability and authentication rules</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-gray-100 space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-charcoal">Allow New User Registrations</p>
            <p className="text-xs text-gray-500">Enable or temporarily suspend signups</p>
          </div>
          <input
            type="checkbox"
            checked={allowRegistration}
            onChange={e => setAllowRegistration(e.target.checked)}
            className="w-4 h-4 text-burgundy rounded"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-charcoal">Enforce Email Verification</p>
            <p className="text-xs text-gray-500">Require email confirmation before allowing post creation</p>
          </div>
          <input
            type="checkbox"
            checked={requireEmailVerification}
            onChange={e => setRequireEmailVerification(e.target.checked)}
            className="w-4 h-4 text-burgundy rounded"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-red-50/50 border border-red-100 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-red-700 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Platform Maintenance Mode
            </p>
            <p className="text-xs text-red-600/80">Only administrators will be able to access the application</p>
          </div>
          <input
            type="checkbox"
            checked={maintenanceMode}
            onChange={e => setMaintenanceMode(e.target.checked)}
            className="w-4 h-4 text-red-600 rounded"
          />
        </div>

        <div className="flex justify-end pt-3 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 disabled:opacity-50 transition-all shadow-soft"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Platform Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
