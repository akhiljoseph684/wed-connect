import { useState } from 'react';
import { Settings, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreatorSettingsPage() {
  const [openToCollabs, setOpenToCollabs] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Creator preferences saved!');
    }, 400);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
          <Settings className="w-6 h-6 text-burgundy" /> Creator Studio Settings
        </h1>
        <p className="text-sm text-gray-500">Configure collaboration openness and publishing preferences</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-gray-100 space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-charcoal">Accepting Brand Collaborations</p>
            <p className="text-xs text-gray-500">Show an "Open to Collaborations" badge on your public creator profile</p>
          </div>
          <input
            type="checkbox"
            checked={openToCollabs}
            onChange={e => setOpenToCollabs(e.target.checked)}
            className="w-4 h-4 text-burgundy rounded"
          />
        </div>

        <div className="flex justify-end pt-3 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 disabled:opacity-50 transition-all shadow-soft"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
}
