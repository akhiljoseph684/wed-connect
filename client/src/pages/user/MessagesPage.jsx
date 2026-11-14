import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { MessageSquare, Search, Store } from "lucide-react";
import messageService from "../../services/message.service.js";
import { formatRelativeTime } from "../../utils/formatters.js";
import { useSocket } from "../../context/SocketContext.jsx";

export default function MessagesPage() {
  const { user } = useSelector((state) => state.auth);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleConversationUpdate = (data) => {
      console.log("[Messages] Conversation updated:", data);

      fetchConversations(search);
    };

    socket.on("conversation:updated", handleConversationUpdate);

    return () => {
      socket.off("conversation:updated", handleConversationUpdate);
    };
  }, [socket, search]);

  const fetchConversations = async (query = "") => {
    setLoading(true);
    try {
      const res = await messageService.getConversations({ search: query });
      setConversations(res.data || []);
    } catch (err) {
      console.error("Failed to load conversations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchConversations(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const getOtherParticipant = (conv) => {
    if (!conv?.participants) return null;
    const other = conv.participants.find(
      (p) => (p.userId?._id || p.userId)?.toString() !== user?._id?.toString(),
    );
    return other?.userId || conv.participants[0]?.userId;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-burgundy" /> Messages
          </h1>
          <p className="text-sm text-gray-500">
            Real-time conversations with wedding vendors, planners, and creators
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by vendor, creator, or conversation name..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-sand rounded-xl text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy shadow-soft transition"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-white rounded-2xl animate-pulse shadow-soft"
            />
          ))}
        </div>
      ) : conversations.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-soft border border-sand/60 divide-y divide-sand/30 overflow-hidden">
          {conversations.map((conv) => {
            const other = getOtherParticipant(conv);
            const isBusiness = Boolean(conv.businessId);
            const title = isBusiness
              ? conv.businessId?.name
              : other?.displayName ||
                `${other?.firstName || ""} ${other?.lastName || ""}`.trim() ||
                "Member";

            const avatar = isBusiness
              ? conv.businessId?.logoUrl
              : other?.avatarUrl;

            const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
              title,
            )}&background=722F45&color=fff`;

            const sender = conv.lastMessage?.senderId;

            const senderId = sender?._id || sender;

            const isMyMessage = senderId?.toString() === user?._id?.toString();

            const senderName = isMyMessage
              ? "You"
              :
                `${sender?.firstName || ""}`.trim() ||
                "Member";

            const lastMessageText =
              conv.lastMessage?.text || "Sent an attachment";

            // Issue 10: Latest message createdAt / sentAt timestamp
            const latestTimestamp =
              conv.lastMessage?.sentAt ||
              conv.lastMessage?.createdAt ||
              conv.updatedAt;

            // Issue 17: Unread status indicator
            const hasUnread = Boolean(
              conv.hasUnread || (conv.unreadCount && conv.unreadCount > 0),
            );

            return (
              <Link
                key={conv._id}
                to={`/messages/${conv._id}`}
                className={`p-4 flex items-center gap-4 hover:bg-sand/15 transition-colors block ${
                  hasUnread ? "bg-burgundy/[0.02]" : ""
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={avatar || fallbackAvatar}
                    alt={title}
                    className="w-12 h-12 rounded-full object-cover border border-sand shadow-xs"
                  />
                  {isBusiness && (
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-gold rounded-full flex items-center justify-center text-white shadow-xs">
                      <Store className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3
                        className={`text-sm truncate ${
                          hasUnread
                            ? "font-bold text-charcoal"
                            : "font-semibold text-charcoal/90"
                        }`}
                      >
                        {title}
                      </h3>
                      {/* Issue 17: Unread colored dot */}
                      {hasUnread && (
                        <span
                          className="w-2.5 h-2.5 rounded-full bg-burgundy shrink-0 animate-pulse"
                          title="Unread messages"
                        />
                      )}
                    </div>

                    <span className="text-[11px] text-mutedGray shrink-0 font-medium">
                      {latestTimestamp
                        ? formatRelativeTime(latestTimestamp)
                        : ""}
                    </span>
                  </div>

                  <p
                    className={`text-xs truncate mt-1 ${
                      hasUnread
                        ? "font-semibold text-charcoal"
                        : "text-gray-500"
                    }`}
                  >
                    <span className="font-semibold text-charcoal/80">
                      {senderName}:
                    </span>{" "}
                    {lastMessageText}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-sand/60">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-playfair text-xl font-bold text-charcoal">
            No conversations found
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            {search
              ? "No messages match your search. Try another name or vendor keyword."
              : "Start a dialogue with a wedding venue, photographer, or planner to begin."}
          </p>
        </div>
      )}
    </div>
  );
}
