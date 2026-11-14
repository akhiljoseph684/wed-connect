import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings, Trash2, UserPlus, Users, Shield, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import weddingPlanService from '../../services/weddingPlan.service.js';
import { useDispatch } from 'react-redux';
import { setActivePlan } from '../../store/slices/weddingPlanSlice.js';
import ConfirmationDialog from '../../components/common/ConfirmationDialog.jsx';

export default function WeddingSettingsPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [plan, setPlan] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [partner1, setPartner1] = useState('');
  const [partner2, setPartner2] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [totalBudget, setTotalBudget] = useState('');
  const [city, setCity] = useState('');

  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('collaborator');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [saving, setSaving] = useState(false);

  // Confirmation dialogs
  const [isDeletingPlan, setIsDeletingPlan] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await weddingPlanService.getPlanDetails(planId);
      const data = res.data || {};
      const p = data.plan || data;
      setPlan(p);
      setMembers(data.members || []);
      setPartner1(p?.partner1Name || '');
      setPartner2(p?.partner2Name || '');
      setWeddingDate(p?.weddingDate ? p.weddingDate.split('T')[0] : '');
      setTotalBudget(p?.totalBudget || p?.budget?.total || 25000);
      setCity(p?.city || p?.location?.city || '');
    } catch (err) {
      navigate('/my-wedding/new');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (planId) fetchSettings();
  }, [planId]);

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await weddingPlanService.updatePlan(planId, {
        partner1Name: partner1,
        partner2Name: partner2,
        weddingDate,
        totalBudget: Number(totalBudget) || 20000,
        city,
      });
      toast.success('Workspace settings updated!');
    } catch (err) {
      console.log(err)
      toast.error(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) {
      toast.error('Please enter an email address.');
      return;
    }
    setIsAddingMember(true);
    try {
      await weddingPlanService.addMember(planId, { email: memberEmail.trim(), role: memberRole });
      toast.success(`Collaboration invite sent to ${memberEmail}`);
      setMemberEmail('');
      fetchSettings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add collaborator');
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await weddingPlanService.updateMemberRole(planId, memberId, newRole);
      toast.success('Collaborator permissions updated');
      setMembers((prev) =>
        prev.map((m) => (m._id === memberId ? { ...m, role: newRole } : m))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update collaborator role');
    }
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      await weddingPlanService.removeMember(planId, memberToRemove._id);
      toast.success('Collaborator removed from workspace');
      setMembers((prev) => prev.filter((m) => m._id !== memberToRemove._id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove collaborator');
    } finally {
      setMemberToRemove(null);
    }
  };

  const confirmDeletePlan = async () => {
    try {
      await weddingPlanService.deletePlan(planId);
      toast.success('Wedding workspace deleted');
      dispatch(setActivePlan(null));
      navigate('/my-wedding');
    } catch (err) {
      toast.error('Failed to delete workspace');
    } finally {
      setIsDeletingPlan(false);
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
              onChange={(e) => setPartner1(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Partner 2</label>
            <input
              type="text"
              value={partner2}
              onChange={(e) => setPartner2(e.target.value)}
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
              onChange={(e) => setWeddingDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Total Budget Target ($)</label>
            <input
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">Wedding Location / City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
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

      {/* Collaborators & Permissions Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-gray-100 space-y-6">
        <div>
          <h2 className="font-playfair font-bold text-lg text-charcoal flex items-center gap-2">
            <Users className="w-5 h-5 text-burgundy" /> Collaborators & Team Permissions
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Invite your partner, maid of honor, wedding planner, or family members. Editors can modify tasks and budgets; viewers have read-only privileges.
          </p>
        </div>

        {/* Invite Form */}
        <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            placeholder="collaborator@example.com"
            required
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
          />
          <select
            value={memberRole}
            onChange={(e) => setMemberRole(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
          >
            <option value="collaborator">Editor (Full Edit)</option>
            <option value="viewer">Viewer Only (Read-Only)</option>
          </select>
          <button
            type="submit"
            disabled={isAddingMember}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 transition shadow-soft disabled:opacity-50"
          >
            {isAddingMember ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            <span>Invite</span>
          </button>
        </form>

        {/* Existing Members List */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal/70">
            Active Workspace Members ({members.length})
          </h3>
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
            {members.map((m) => {
              const u = m.userId || {};
              const isOwner = m.role === 'owner';
              return (
                <div key={m._id} className="p-3.5 bg-white flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-sand/40 text-burgundy font-semibold flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={u.firstName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{u.firstName?.[0] || 'U'}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-charcoal truncate">
                        {u.firstName} {u.lastName}
                        {isOwner && (
                          <span className="ml-2 text-[10px] font-semibold bg-burgundy/10 text-burgundy px-2 py-0.5 rounded-full">
                            Owner
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!isOwner ? (
                      <>
                        <select
                          value={m.role}
                          onChange={(e) => handleRoleChange(m._id, e.target.value)}
                          className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-charcoal focus:outline-none"
                        >
                          <option value="collaborator">Editor</option>
                          <option value="viewer">Viewer Only</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => setMemberToRemove(m)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition"
                          title="Remove collaborator"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-mutedGray italic pr-2">Workspace Admin</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-red-700">Delete This Workspace</h3>
          <p className="text-xs text-red-600/80 mt-0.5">This action cannot be undone.</p>
        </div>
        <button
          onClick={() => setIsDeletingPlan(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition shadow-soft"
        >
          <Trash2 className="w-4 h-4" /> Delete Workspace
        </button>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={isDeletingPlan}
        onClose={() => setIsDeletingPlan(false)}
        onConfirm={confirmDeletePlan}
        title="Delete Wedding Workspace"
        message="Are you sure you want to delete this wedding workspace? All checklist items, expenses, guest lists, and collaborator accesses will be permanently removed."
        confirmText="Delete Workspace"
        isDestructive={true}
      />

      <ConfirmationDialog
        isOpen={Boolean(memberToRemove)}
        onClose={() => setMemberToRemove(null)}
        onConfirm={confirmRemoveMember}
        title="Remove Collaborator"
        message={`Are you sure you want to remove ${memberToRemove?.userId?.firstName || 'this member'} from your wedding workspace?`}
        confirmText="Remove Collaborator"
        isDestructive={true}
      />
    </div>
  );
}
