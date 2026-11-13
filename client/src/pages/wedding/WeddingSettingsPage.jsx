import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings, Trash2, UserPlus, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import weddingPlanService from '../../services/weddingPlan.service.js';
import { useDispatch } from 'react-redux';
import { setActivePlan } from '../../store/slices/weddingPlanSlice.js';

export default function WeddingSettingsPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const [partner1, setPartner1] = useState('');
  const [partner2, setPartner2] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [totalBudget, setTotalBudget] = useState('');
  const [city, setCity] = useState('');

  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('collaborator');
  const [saving, setSaving] = useState(false);
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await weddingPlanService.getPlanDetails(planId);
        const p = res.data?.plan || res.data;
        setPlan(p);
        setPartner1(p?.partner1Name || '');
        setPartner2(p?.partner2Name || '');
        setWeddingDate(p?.weddingDate ? p.weddingDate.split('T')[0] : '');
        setTotalBudget(p?.budget?.total || 25000);
        setCity(p?.location?.city || '');
      } catch (err) {
        navigate("/my-wedding/new")
      } finally {
        setLoading(false);
      }
    };
    if (planId) fetchSettings();
  }, [planId]);

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await weddingPlanService.updatePlan(planId, {
        coupleNames: { partner1, partner2 },
        weddingDate,
        budget: { total: Number(totalBudget) || 20000 },
        location: { city },
      });
      toast.success('Workspace settings updated!');
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;
    try {
      await weddingPlanService.addMember(planId, { email: memberEmail.trim(), role: memberRole });
      toast.success(`Invite sent to ${memberEmail}`);
      setMemberEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add collaborator');
    }
  };

  const handleDeletePlan = async () => {
    if (!window.confirm('Are you sure you want to delete this wedding workspace? All checklist items and expenses will be removed.')) return;
    try {
      await weddingPlanService.deletePlan(planId);
      toast.success('Wedding workspace deleted');
      dispatch(setActivePlan(null));
      navigate('/my-wedding');
    } catch (err) {
      toast.error('Failed to delete workspace');
    }
  };

  if (loading) {
    return <div className="h-64 bg-white rounded-2xl animate-pulse shadow-soft" />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
          <Settings className="w-6 h-6 text-burgundy" /> Workspace Settings
        </h1>
        <p className="text-sm text-gray-500">Manage wedding details, budget parameters, and collaborators</p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveDetails} className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-gray-100 space-y-5">
        <h2 className="font-playfair font-bold text-lg text-charcoal">General Information</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Partner 1</label>
            <input
              type="text"
              value={partner1}
              onChange={e => setPartner1(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Partner 2</label>
            <input
              type="text"
              value={partner2}
              onChange={e => setPartner2(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Wedding Date</label>
            <input
              type="date"
              value={weddingDate}
              onChange={e => setWeddingDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Total Budget Target ($)</label>
            <input
              type="number"
              value={totalBudget}
              onChange={e => setTotalBudget(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">Wedding Location / City</label>
          <input
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
          />
        </div>

        <div className="flex justify-end pt-3 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 disabled:opacity-50 shadow-soft"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Collaborator Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-gray-100 space-y-4">
        <h2 className="font-playfair font-bold text-lg text-charcoal flex items-center gap-2">
          <Users className="w-5 h-5 text-burgundy" /> Invite Collaborator
        </h2>
        <p className="text-xs text-gray-500">
          Invite your partner, wedding planner, or maid of honor to edit this workspace.
        </p>
        <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={memberEmail}
            onChange={e => setMemberEmail(e.target.value)}
            placeholder="collaborator@example.com"
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
          />
          <select
            value={memberRole}
            onChange={e => setMemberRole(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
          >
            <option value="collaborator">Editor</option>
            <option value="viewer">Viewer Only</option>
          </select>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-charcoal text-white rounded-xl text-sm font-medium hover:bg-black transition-all shadow-soft"
          >
            <UserPlus className="w-4 h-4" /> Send Invite
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-red-700">Delete This Workspace</h3>
          <p className="text-xs text-red-600/80 mt-0.5">This action cannot be undone.</p>
        </div>
        <button
          onClick={handleDeletePlan}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition-all shadow-soft"
        >
          <Trash2 className="w-4 h-4" /> Delete Workspace
        </button>
      </div>
    </div>
  );
}
