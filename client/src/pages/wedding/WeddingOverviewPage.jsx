import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  CalendarHeart,
  CheckSquare,
  DollarSign,
  Users,
  Store,
  Clock,
  ChevronRight,
  AlertCircle,
  Plus,
} from "lucide-react";
import weddingPlanService from "../../services/weddingPlan.service.js";
import taskService from "../../services/task.service.js";
import expenseService from "../../services/expense.service.js";
import guestService from "../../services/guest.service.js";
import { setActivePlan } from "../../store/slices/weddingPlanSlice.js";
import {
  formatCurrency,
  calculateDaysRemaining,
} from "../../utils/formatters.js";

export default function WeddingOverviewPage() {
  const { planId } = useParams();
  const dispatch = useDispatch();

  const [plan, setPlan] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!planId) return;
    const fetchOverview = async () => {
      setLoading(true);
      try {
        const [planRes, taskRes, expRes, guestRes] = await Promise.allSettled([
          weddingPlanService.getPlanDetails(planId),
          taskService.getTasks(planId),
          expenseService.getExpenses(planId),
          guestService.getGuests(planId),
        ]);

        if (planRes.status === "fulfilled") {
          const p = planRes.value.data.plan || planRes.value.data;
          setPlan(p);
          dispatch(setActivePlan(p));
        }
        if (taskRes.status === "fulfilled") {
          setTasks(taskRes.value.data || []);
        }
        if (expRes.status === "fulfilled") {
          setExpenses(expRes.value.data || []);
        }
        if (guestRes.status === "fulfilled") {
          setGuests(guestRes.value.data || []);
        }
      } catch (err) {
        console.error("Failed to load wedding plan details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, [planId, dispatch]);

  const daysLeft = calculateDaysRemaining(plan?.weddingDate);

  // Calculations
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const taskPercent =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const totalBudget = plan?.budget?.total || 25000;
  const totalSpent = expenses.reduce(
    (acc, curr) => acc + Number(curr.actualAmount || curr.paidAmount || 0),
    0,
  );
  const budgetPercent = Math.min(
    100,
    Math.round((totalSpent / (totalBudget || 1)) * 100),
  );

  const confirmedGuests = guests.filter(
    (g) => g.rsvpStatus === "attending",
  ).length;
  const pendingGuests = guests.filter(
    (g) => g.rsvpStatus === "pending" || !g.rsvpStatus,
  ).length;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-white rounded-2xl shadow-soft" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl shadow-soft" />
          ))}
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-gray-100">
        <CalendarHeart className="w-12 h-12 text-gray-300 mx-auto mb-3" />

        <h3 className="font-playfair text-xl font-bold text-charcoal">
          No Wedding Plan Found
        </h3>

        <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
          You haven't created your wedding plan yet. Create your wedding
          workspace to start managing tasks, budgets, guests, and vendors.
        </p>

        <Link
          to="/my-wedding/new"
          className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 transition-all shadow-soft"
        >
          <Plus className="w-4 h-4" /> Create Wedding Workspace
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wedding Hero Banner */}
      <div className="bg-gradient-to-r from-burgundy via-rose to-burgundy text-white rounded-2xl p-6 sm:p-8 shadow-luxury relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-gold text-xs font-semibold uppercase tracking-wider">
              {daysLeft > 0
                ? `${daysLeft} Days Until The Big Day`
                : "Wedding Celebrated"}
            </span>
            <h1 className="font-playfair text-2xl sm:text-3xl font-bold mt-1">
              {plan?.partner1Name || "Partner 1"} &{" "}
              {plan?.partner2Name || "Partner 2"}
            </h1>
            <p className="text-white/80 text-sm mt-1">
              {plan?.weddingDate
                ? new Date(plan.weddingDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Date not set"}
              {plan?.location?.city ? ` • ${plan.location.city}` : ""}
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to={`/my-wedding/${planId}/tasks`}
              className="px-4 py-2 bg-white text-burgundy rounded-xl text-xs font-semibold hover:bg-ivory transition-all shadow-soft"
            >
              Checklist
            </Link>
            <Link
              to={`/my-wedding/${planId}/budget`}
              className="px-4 py-2 bg-gold text-charcoal rounded-xl text-xs font-semibold hover:bg-gold/90 transition-all shadow-soft"
            >
              Budget
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Task Progress */}
        <Link
          to={`/my-wedding/${planId}/tasks`}
          className="bg-white p-5 rounded-2xl shadow-soft hover:shadow-elevated transition-all border border-gray-100 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-burgundy/10 text-burgundy flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-burgundy">
              {taskPercent}% done
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">Tasks Checklist</p>
            <p className="font-bold text-lg text-charcoal mt-0.5">
              {completedTasks} / {tasks.length} Completed
            </p>
            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-burgundy h-full rounded-full transition-all"
                style={{ width: `${taskPercent}%` }}
              />
            </div>
          </div>
        </Link>

        {/* Budget overview */}
        <Link
          to={`/my-wedding/${planId}/budget`}
          className="bg-white p-5 rounded-2xl shadow-soft hover:shadow-elevated transition-all border border-gray-100 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600">
              {budgetPercent}%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">Total Budget</p>
            <p className="font-bold text-lg text-charcoal mt-0.5">
              {formatCurrency(totalSpent)}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              of {formatCurrency(totalBudget)} planned
            </p>
          </div>
        </Link>

        {/* Guest List */}
        <Link
          to={`/my-wedding/${planId}/guests`}
          className="bg-white p-5 rounded-2xl shadow-soft hover:shadow-elevated transition-all border border-gray-100 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose/10 text-rose flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-charcoal">
              {confirmedGuests} Attending
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">Guest Responses</p>
            <p className="font-bold text-lg text-charcoal mt-0.5">
              {guests.length} Invited
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              {pendingGuests} pending RSVP
            </p>
          </div>
        </Link>

        {/* Vendors */}
        <Link
          to={`/my-wedding/${planId}/vendors`}
          className="bg-white p-5 rounded-2xl shadow-soft hover:shadow-elevated transition-all border border-gray-100 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-gold/20 text-charcoal flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">Saved Vendors</p>
            <p className="font-bold text-lg text-charcoal mt-0.5">
              {plan?.savedVendors?.length || 0} Vendors
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Photographers, Florists, Venues
            </p>
          </div>
        </Link>
      </div>

      {/* Upcoming Tasks Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-playfair text-lg font-bold text-charcoal">
              Upcoming Tasks
            </h2>
            <Link
              to={`/my-wedding/${planId}/tasks`}
              className="text-xs font-semibold text-burgundy hover:underline"
            >
              View all
            </Link>
          </div>
          {tasks.slice(0, 4).length > 0 ? (
            <div className="space-y-2.5">
              {tasks.slice(0, 4).map((t) => (
                <div
                  key={t._id}
                  className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${t.status === "completed" ? "bg-emerald-500" : "bg-gold"}`}
                    />
                    <span
                      className={`text-charcoal ${t.status === "completed" ? "line-through text-gray-400" : "font-medium"}`}
                    >
                      {t.title}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 capitalize">
                    {t.category || "General"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-6 text-center">
              No tasks created yet
            </p>
          )}
        </div>

        {/* Recent Expenses Section */}
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-playfair text-lg font-bold text-charcoal">
              Recent Expenses
            </h2>
            <Link
              to={`/my-wedding/${planId}/budget`}
              className="text-xs font-semibold text-burgundy hover:underline"
            >
              Manage Budget
            </Link>
          </div>
          {expenses.slice(0, 4).length > 0 ? (
            <div className="space-y-2.5">
              {expenses.slice(0, 4).map((exp) => (
                <div
                  key={exp._id}
                  className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-sm"
                >
                  <div>
                    <p className="font-medium text-charcoal">{exp.title}</p>
                    <p className="text-xs text-gray-400 capitalize">
                      {exp.category || "Other"}
                    </p>
                  </div>
                  <span className="font-bold text-charcoal">
                    {formatCurrency(exp.actualAmount || exp.paidAmount || 0)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-6 text-center">
              No expenses recorded yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
