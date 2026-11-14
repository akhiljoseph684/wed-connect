import { useState, useEffect } from 'react';
import { Settings, Bell, Shield, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import businessService from '../../services/business.service.js';

export default function VendorSettingsPage() {
  const [business, setBusiness] = useState(null);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoReply, setAutoReply] = useState(false);
  const [autoReplyText, setAutoReplyText] = useState(
    'Thank you for reaching out! We will review your wedding date and get back to you within 24 hours.'
  );
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await businessService.getMyBusiness();
        const biz = res.data?.business || res.data;
        if (biz) {
          setBusiness(biz);
          setEmailAlerts(biz.settings?.instantEmailAlerts !== false);
          setAutoReply(Boolean(biz.settings?.autoInquiryResponse));
          if (biz.settings?.autoInquiryMessage) {
            setAutoReplyText(biz.settings.autoInquiryMessage);
          }
        }
      } catch (err) {
        console.error('Failed to load business settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!business?._id) {
      toast.error('No active business profile found.');
      return;
    }

    setSaving(true);
    try {
      await businessService.updateVendorSettings(business._id, {
        instantEmailAlerts: Boolean(emailAlerts),
        autoInquiryResponse: Boolean(autoReply),
        autoInquiryMessage: autoReplyText.trim(),
      });
      toast.success('Storefront inquiry & alert settings saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
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
          <Settings className="w-6 h-6 text-burgundy" /> Storefront Settings
        </h1>
        <p className="text-sm text-gray-500">Configure inquiries alerts, automatic responses, and notifications</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-sand/60 space-y-6">
        <div className="flex items-center justify-between p-4 bg-sand/15 rounded-xl border border-sand/40">
          <div>
            <p className="text-sm font-semibold text-charcoal">Instant Email Alerts for New Inquiries</p>
            <p className="text-xs text-mutedGray">Receive an email immediately whenever a couple reaches out</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-burgundy"></div>
          </label>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-sand/15 rounded-xl border border-sand/40">
            <div>
              <p className="text-sm font-semibold text-charcoal">Automated Inquiry Response</p>
              <p className="text-xs text-mutedGray">
                Send an instant confirmation email to the couple upon submitting an inquiry
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoReply}
                onChange={(e) => setAutoReply(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-burgundy"></div>
            </label>
          </div>

          {autoReply && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 mb-1">
                Auto-Response Message
              </label>
              <textarea
                value={autoReplyText}
                onChange={(e) => setAutoReplyText(e.target.value)}
                rows={3}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy resize-none"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-sand/40">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 disabled:opacity-50 transition-all shadow-soft"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
