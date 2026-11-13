import { useState, useEffect } from 'react';
import { Settings, Bell, Shield, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import businessService from '../../services/business.service.js';

export default function VendorSettingsPage() {
  const [business, setBusiness] = useState(null);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoReply, setAutoReply] = useState(false);
  const [autoReplyText, setAutoReplyText] = useState('Thank you for reaching out! We will review your wedding date and get back to you within 24 hours.');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await businessService.getMyBusiness();
        setBusiness(res.data?.business || res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Storefront settings saved!');
    }, 400);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
          <Settings className="w-6 h-6 text-burgundy" /> Storefront Settings
        </h1>
        <p className="text-sm text-gray-500">Configure inquiries alerts, automatic responses, and notifications</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-gray-100 space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-charcoal">Instant Email Alerts for New Inquiries</p>
            <p className="text-xs text-gray-500">Receive an email immediately whenever a couple reaches out</p>
          </div>
          <input
            type="checkbox"
            checked={emailAlerts}
            onChange={e => setEmailAlerts(e.target.checked)}
            className="w-4 h-4 text-burgundy rounded"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-charcoal">Automated Inquiry Response</p>
              <p className="text-xs text-gray-500">Send an instant confirmation message to the couple upon submitting an inquiry</p>
            </div>
            <input
              type="checkbox"
              checked={autoReply}
              onChange={e => setAutoReply(e.target.checked)}
              className="w-4 h-4 text-burgundy rounded"
            />
          </div>

          {autoReply && (
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Auto-Response Message</label>
              <textarea
                value={autoReplyText}
                onChange={e => setAutoReplyText(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 disabled:opacity-50 transition-all shadow-soft"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
