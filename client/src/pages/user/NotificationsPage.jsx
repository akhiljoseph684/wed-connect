import { useState, useEffect } from "react";
import {
  Bell,
  CheckCheck,
  Heart,
  MessageSquare,
  UserPlus,
  Sparkles,
  MessageSquareText,
} from "lucide-react";
import toast from "react-hot-toast";
import notificationService from "../../services/notification.service.js";
import { formatRelativeTime } from "../../utils/formatters.js";
import { useNavigate } from "react-router-dom";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.data?.notifications || []);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All marked as read");
    } catch (err) {
      toast.error("Failed to update notifications");
    }
  };

  const handleMarkRead = async (id, item) => {
    try {
      if (!item.isRead) {
        await notificationService.markAsRead(id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
        );
      }
      navigate(item.link);
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart className="w-4 h-4 text-rose fill-rose" />;
      case "comment":
        return <MessageSquare className="w-4 h-4 text-burgundy" />;
      case "follow":
        return <UserPlus className="w-4 h-4 text-gold" />;
      case "enquiry":
        return <MessageSquareText className="w-4 h-4 text-blue-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-burgundy" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
            <Bell className="w-6 h-6 text-burgundy" /> Notifications
          </h1>
          <p className="text-sm text-gray-500">
            Activity on your posts, follows, and enquiries
          </p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3.5 py-1.5 border border-gray-200 text-charcoal rounded-xl text-xs font-medium hover:bg-gray-50 transition-all shadow-soft"
          >
            <CheckCheck className="w-4 h-4 text-burgundy" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-white rounded-2xl animate-pulse shadow-soft"
            />
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 divide-y divide-gray-100 overflow-hidden">
          {notifications.map((item) => (
            <div
              key={item._id}
              onClick={() => handleMarkRead(item._id, item)}
              className={`p-4 flex items-center gap-4 transition-colors cursor-pointer ${
                item.isRead
                  ? "hover:bg-gray-50/50"
                  : "bg-rose/5 hover:bg-rose/10"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-soft">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-charcoal">
                  {item.message || item.content || "New notification"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatRelativeTime(item.createdAt)}
                </p>
              </div>
              {!item.isRead && (
                <div className="w-2.5 h-2.5 rounded-full bg-burgundy shrink-0" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-gray-100">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-playfair text-xl font-bold text-charcoal">
            All caught up!
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            You have no new notifications.
          </p>
        </div>
      )}
    </div>
  );
}
