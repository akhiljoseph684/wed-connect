import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MessageSquare, Search } from 'lucide-react';
import messageService from '../../services/message.service.js';
import { formatRelativeTime } from '../../utils/formatters.js';

export default function MessagesPage() {
  const { user } = useSelector(state => state.auth);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const res = await messageService.getConversations();
        setConversations(res.data || []);
      } catch (err) {
        console.error('Failed to load conversations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const getOtherParticipant = (conv) => {
    return conv.participants?.find(p => p.userId._id !== user?._id).userId || conv.participants?.[0].userId;
  };

  const filtered = conversations.filter(c => {
    const other = getOtherParticipant(c);
    const name = `${other?.firstName || ''} ${other?.lastName || ''}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-burgundy" /> Messages
        </h1>
        <p className="text-sm text-gray-500">Conversations with vendors, couples, and creators</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search conversations..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy shadow-soft"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-2xl animate-pulse shadow-soft" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 divide-y divide-gray-100 overflow-hidden">
          {filtered.map(conv => {
            const other = getOtherParticipant(conv);
            const avatar = other?.avatarUrl || `https://ui-avatars.com/api/?name=${other?.firstName}+${other?.lastName}&background=7D1E3B&color=fff`;
            return (
              <Link
                key={conv._id}
                to={`/messages/${conv._id}`}
                className="p-4 flex items-center gap-4 hover:bg-gray-50/70 transition-colors block"
              >
                <img src={avatar} alt={other?.firstName} className="w-12 h-12 rounded-full object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-charcoal text-sm truncate">
                      {other?.firstName} {other?.lastName}
                    </h3>
                    <span className="text-xs text-gray-400 shrink-0">
                      {console.log(conv)}
                      {formatRelativeTime(conv.lastMessage?.sentAt || conv.updatedAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-1">
                    {conv.lastMessage?.text || 'No messages yet'}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-gray-100">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-playfair text-xl font-bold text-charcoal">No conversations yet</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Contact vendors on their profile pages or send inquiries to start a conversation!
          </p>
        </div>
      )}
    </div>
  );
}
