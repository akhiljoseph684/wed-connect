import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Heart, Plus, Calendar, MapPin, ChevronRight, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import weddingPlanService from '../../services/weddingPlan.service.js';
import { setActivePlan } from '../../store/slices/weddingPlanSlice.js';
import { formatCurrency, calculateDaysRemaining } from '../../utils/formatters.js';

export default function WeddingPlansListPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const res = await weddingPlanService.getWeddingPlans();
        const list = res.data || res.data?.plans || [];
        setPlans(list);
        if (list.length === 1) {
          dispatch(setActivePlan(list[0]));
        }
      } catch (err) {
        toast.error('Failed to load wedding plans');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [dispatch, navigate]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
            <Heart className="w-6 h-6 text-burgundy fill-burgundy" /> Your Wedding Plans
          </h1>
          <p className="text-sm text-gray-500">Select or create a workspace to manage your wedding</p>
        </div>
        <Link
          to="/my-wedding/new"
          className="flex items-center gap-2 px-4 py-2 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 transition-all shadow-soft"
        >
          <Plus className="w-4 h-4" /> New Wedding Plan
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-44 bg-white rounded-2xl animate-pulse shadow-soft" />
          ))}
        </div>
      ) : plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map(plan => {
            const daysLeft = calculateDaysRemaining(plan.weddingDate);
            return (
              <div
                key={plan._id}
                onClick={() => {
                  dispatch(setActivePlan(plan));
                  navigate(`/my-wedding/${plan._id}/overview`);
                }}
                className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-elevated transition-all border border-gray-100 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose/10 text-burgundy">
                      {daysLeft > 0 ? `${daysLeft} days to go` : 'Celebrated'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-burgundy group-hover:translate-x-1 transition-all" />
                  </div>
                  <h2 className="font-playfair text-xl font-bold text-charcoal">{plan.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">{plan.coupleNames?.partner1} & {plan.coupleNames?.partner2}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 space-y-1.5 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-burgundy" />
                    <span>{plan.weddingDate ? new Date(plan.weddingDate).toLocaleDateString() : 'Date TBD'}</span>
                  </div>
                  {plan.location?.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-burgundy" />
                      <span>{plan.location.city}, {plan.location.country}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <span>Budget: <strong>{formatCurrency(plan.budget?.total || 0)}</strong></span>
                    {console.log(plan)}
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {plan?.guestsCount || 0} guests</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-gray-100">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-playfair text-xl font-bold text-charcoal">No wedding workspaces yet</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Create your wedding plan to track tasks, budgets, guests, and vendor shortlists.
          </p>
          <Link
            to="/my-wedding/new"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 transition-all shadow-soft"
          >
            <Plus className="w-4 h-4" /> Create Wedding Workspace
          </Link>
        </div>
      )}
    </div>
  );
}
