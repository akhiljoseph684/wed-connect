import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { DollarSign, Plus, Trash2, PieChart, CalendarHeart } from "lucide-react";
import toast from "react-hot-toast";
import expenseService from "../../services/expense.service.js";
import weddingPlanService from "../../services/weddingPlan.service.js";
import CreateExpenseModal from "../../components/modals/CreateExpenseModal.jsx";
import { formatCurrency } from "../../utils/formatters.js";

export default function BudgetPage() {
  const { planId } = useParams();
  const [plan, setPlan] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchBudget = async () => {
    setLoading(true);
    try {
      const [pRes, eRes] = await Promise.all([
        weddingPlanService.getPlanDetails(planId),
        expenseService.getExpenses(planId),
      ]);
      setPlan(pRes.data?.plan || pRes.data);
      setExpenses(eRes.data || []);
    } catch (err) {
      navigate("/my-wedding/new")
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (planId) fetchBudget();
  }, [planId]);

  const handleDelete = async (expenseId) => {
    try {
      await expenseService.deleteExpense(expenseId, planId);
      setExpenses((prev) => prev.filter((e) => e._id !== expenseId));
      toast.success("Expense removed");
    } catch (err) {
      toast.error(err.message || "Failed to delete expense");
    }
  };

  const totalBudget = plan?.totalBudget || 25000;
  const totalActual = expenses.reduce(
    (acc, curr) => acc + Number(curr.actualAmount || curr.paidAmount || 0),
    0,
  );
  const totalPaid = expenses.reduce(
    (acc, curr) => acc + Number(curr.paidAmount || 0),
    0,
  );
  const remaining = Math.max(0, totalBudget - totalActual);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-burgundy" /> Wedding Budget &
            Expenses
          </h1>
          <p className="text-sm text-gray-500">
            Track estimates, actual quotes, and payments made
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 transition-all shadow-soft self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-soft border border-gray-100">
          <p className="text-xs text-gray-500">Total Planned Budget</p>
          <p className="font-bold text-xl text-charcoal mt-1">
            {formatCurrency(totalBudget)}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-soft border border-gray-100">
          <p className="text-xs text-gray-500">Total Committed</p>
          <p className="font-bold text-xl text-burgundy mt-1">
            {formatCurrency(totalActual)}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-soft border border-gray-100">
          <p className="text-xs text-gray-500">Paid So Far</p>
          <p className="font-bold text-xl text-emerald-600 mt-1">
            {formatCurrency(totalPaid)}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-soft border border-gray-100">
          <p className="text-xs text-gray-500">Remaining Budget</p>
          <p className="font-bold text-xl text-gold mt-1">
            {formatCurrency(remaining)}
          </p>
        </div>
      </div>

      {/* Expenses Table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-14 bg-white rounded-2xl animate-pulse shadow-soft"
            />
          ))}
        </div>
      ) : expenses.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/70 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Item / Vendor</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Estimated</th>
                  <th className="p-4">Actual</th>
                  <th className="p-4">Paid</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-4 font-semibold text-charcoal">
                      {item.title}
                    </td>
                    <td className="p-4">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                        {item.category || "General"}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">
                      {formatCurrency(item.estimatedAmount || 0)}
                    </td>
                    <td className="p-4 font-semibold text-charcoal">
                      {formatCurrency(item.actualAmount || item.amount || 0)}
                    </td>
                    <td className="p-4 text-emerald-600 font-medium">
                      {formatCurrency(item.paidAmount || 0)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-gray-100">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-playfair text-xl font-bold text-charcoal">
            No expenses logged yet
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Start adding expected costs for venue, catering, dress, etc.
          </p>
        </div>
      )}

      <CreateExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planId={planId}
        onCreated={() => fetchBudget()}
      />
    </div>
  );
}
