import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import messageService from '../../services/message.service.js';
import { useSocket } from '../../context/SocketContext.jsx';
import { formatRelativeTime } from '../../utils/formatters.js';

export default function ConversationPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { socket } = useSocket();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchChat = async () => {
      setLoading(true);
      try {
        const [convRes, msgRes] = await Promise.all([
          messageService.getConversationById(conversationId),
          messageService.getMessages(conversationId),
        ]);
        setConversation(convRes.data || convRes.data);
        setMessages(msgRes.data?.messages || []);
        messageService.markAsRead(conversationId).catch(() => {});
      } catch (err) {
        toast.error('Failed to load conversation');
        navigate('/messages');
      } finally {
        setLoading(false);
      }
    };
    fetchChat();
  }, [conversationId, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time socket events
  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit('conversation:join', { conversationId });

    const handleNewMessage = (newMsg) => {
      if (newMsg.conversationId === conversationId || newMsg.conversation === conversationId) {
        setMessages(prev => [...prev, newMsg]);
        messageService.markAsRead(conversationId).catch(() => {});
      }
    };

    socket.on('message:new', handleNewMessage);

    return () => {
      socket.off('message:new', handleNewMessage);
    };
  }, [socket, conversationId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setSending(true);
    const content = inputText.trim();
    setInputText('');

    try {
      const res = await messageService.sendMessage(conversationId, { content });
      const created = res.data?.message;
      if (created) {
        setMessages(prev => [...prev, created]);
        if (socket) {
          socket.emit('message:send', { conversationId, message: created });
        }
      }
    } catch (err) {
      console.log(err)
      toast.error('Failed to send message');
      setInputText(content);
    } finally {
      setSending(false);
    }
  };

  const otherParticipant = conversation?.participants?.find(p => p.userId._id !== user?._id).userId || conversation?.participants?.[0].userId;
  const avatar = otherParticipant?.avatarUrl || `https://ui-avatars.com/api/?name=${otherParticipant?.firstName}+${otherParticipant?.lastName}&background=7D1E3B&color=fff`;

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white">
        <button
          onClick={() => navigate('/messages')}
          className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-charcoal transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <img src={avatar} alt={otherParticipant?.firstName} className="w-10 h-10 rounded-full object-cover" />
        <div>
          <h2 className="font-semibold text-charcoal text-sm">
            {otherParticipant?.firstName} {otherParticipant?.lastName}
          </h2>
          <p className="text-xs text-gray-400 capitalize">{otherParticipant?.role || 'Member'}</p>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-ivory/40">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-10 bg-white rounded-xl w-1/2" />
            <div className="h-10 bg-burgundy/10 rounded-xl w-1/2 ml-auto" />
            <div className="h-10 bg-white rounded-xl w-1/3" />
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg) => {
            const isMe = (msg.senderId?._id || msg.senderId) === user?._id;
            return (
              <div
                key={msg._id || Math.random()}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    isMe
                      ? 'bg-burgundy text-white rounded-br-xs shadow-soft'
                      : 'bg-white text-charcoal rounded-bl-xs border border-gray-100 shadow-soft'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                </div>
                {/* <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {formatRelativeTime(msg.createdAt)}
                </span> */}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-400 text-xs">
            Start the conversation by sending a message below!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <form onSubmit={handleSend} className="p-3 border-t border-gray-100 flex items-center gap-2 bg-white">
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
        />
        <button
          type="submit"
          disabled={sending || !inputText.trim()}
          className="p-2.5 bg-burgundy text-white rounded-xl hover:bg-burgundy/90 disabled:opacity-50 transition-all shadow-soft shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
