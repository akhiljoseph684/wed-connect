import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckSquare, Plus, Trash2, CheckCircle2, Circle, CalendarHeart } from "lucide-react";
import toast from "react-hot-toast";
import taskService from "../../services/task.service.js";
import CreateTaskModal from "../../components/modals/CreateTaskModal.jsx";

const CATEGORIES = [
  "all",
  "venue",
  "attire",
  "catering",
  "photography",
  "music",
  "decor",
  "other",
];

export default function TasksPage() {
  const { planId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await taskService.getTasks(planId);
      setTasks(res.data || []);
    } catch (err) {
      navigate("/my-wedding/new");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (planId) fetchTasks();
  }, [planId]);

  const toggleTaskStatus = async (task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    try {
      await taskService.updateTask(task._id, { status: newStatus }, planId);
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t)),
      );
    } catch (err) {
      toast.error(err.message || "Failed to update task status");
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await taskService.deleteTask(taskId, planId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      toast.success("Task removed");
    } catch (err) {
      toast.error(err.message || "Failed to delete task");
    }
  };

  const filtered = tasks.filter((t) => {
    if (filterCat === "all") return true;
    return t.category?.toLowerCase() === filterCat.toLowerCase();
  });

  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-burgundy" /> Wedding Checklist
            & Tasks
          </h1>
          <p className="text-sm text-gray-500">
            {completedCount} of {tasks.length} tasks completed
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 transition-all shadow-soft self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all ${
              filterCat === cat
                ? "bg-burgundy text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-burgundy"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Task List */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-white rounded-2xl animate-pulse shadow-soft"
            />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 divide-y divide-gray-100 overflow-hidden">
          {filtered.map((t) => (
            <div
              key={t._id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => toggleTaskStatus(t)}
                  className="text-burgundy hover:scale-110 transition-transform shrink-0"
                >
                  {t.status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300" />
                  )}
                </button>
                <div className="min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${t.status === "completed" ? "line-through text-gray-400" : "text-charcoal"}`}
                  >
                    {t.title}
                  </p>
                  {t.dueDate && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Due: {new Date(t.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                  {t.category || "General"}
                </span>
                <button
                  onClick={() => handleDelete(t._id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-gray-100">
          <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-playfair text-xl font-bold text-charcoal">
            No tasks in this category
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Add items to stay organized on your wedding roadmap!
          </p>
        </div>
      )}

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planId={planId}
        onCreated={() => fetchTasks()}
      />
    </div>
  );
}
