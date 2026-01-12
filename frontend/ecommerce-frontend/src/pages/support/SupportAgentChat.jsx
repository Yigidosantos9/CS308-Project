import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MessageCircle, SendHorizontal, ChevronDown, ChevronUp, Package, Heart, User } from 'lucide-react';

import { API_BASE_URL, supportChatService } from '../../services/api';
import { useShop } from '../../context/ShopContext';

const SupportAgentChat = () => {
  const { user } = useShop();
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState('starting');
  const [error, setError] = useState('');
  const lastMessageIdRef = useRef(0);
  const messageIdsRef = useRef(new Set());
  const pollRef = useRef(null);
  const endRef = useRef(null);

  // Customer details state for Support Agent panel
  const [customerDetails, setCustomerDetails] = useState(null);
  const [customerDetailsLoading, setCustomerDetailsLoading] = useState(false);
  const [showCustomerPanel, setShowCustomerPanel] = useState(true);

  const agentName = useMemo(() => {
    if (!user) return 'Agent';
    return user.firstName || user.email?.split('@')[0] || 'Agent';
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (user.userType !== 'SUPPORT_AGENT') {
      navigate('/support');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!chatId || user?.userType !== 'SUPPORT_AGENT') return undefined;

    let isActive = true;
    const parsedChatId = Number(chatId);
    const claimAndLoad = async () => {
      try {
        await supportChatService.claimChat(parsedChatId);
      } catch (err) {
        if (!isActive) return;
        const errorMessage = err.response?.data?.error;
        const normalizedMessage = errorMessage?.toLowerCase();
        if (normalizedMessage?.includes('closed')) {
          setError('Chat is closed.');
          return;
        }
        if (normalizedMessage?.includes('claimed')) {
          setError('Chat is already claimed.');
          return;
        }
        setError(errorMessage || 'Chat could not be claimed.');
      }
    };

    const pollMessages = async () => {
      try {
        const chatInfo = await supportChatService.getChat(parsedChatId);
        if (!isActive) return;
        if (chatInfo?.status) {
          const normalizedStatus = chatInfo.status.toLowerCase();
          setStatus(normalizedStatus);
          if (normalizedStatus === 'closed') {
            setError('Chat is closed.');
          }
        }
        const newMessages = await supportChatService.getMessages(parsedChatId, lastMessageIdRef.current);
        if (Array.isArray(newMessages) && newMessages.length > 0) {
          const uniqueMessages = newMessages.filter((message) => !messageIdsRef.current.has(message.id));
          if (uniqueMessages.length === 0) return;
          uniqueMessages.forEach((message) => messageIdsRef.current.add(message.id));
          lastMessageIdRef.current = uniqueMessages[uniqueMessages.length - 1].id;
          setMessages((prev) => [...prev, ...uniqueMessages]);
        }
      } catch (err) {
        if (!isActive) return;
        setError('Unable to sync messages right now.');
      }
    };

    const loadInitial = async () => {
      try {
        const initialMessages = await supportChatService.getMessages(parsedChatId);
        if (!isActive) return;
        if (Array.isArray(initialMessages)) {
          setMessages(initialMessages);
          messageIdsRef.current = new Set(initialMessages.map((message) => message.id));
          if (initialMessages.length > 0) {
            lastMessageIdRef.current = initialMessages[initialMessages.length - 1].id;
          }
        }
        const chatInfo = await supportChatService.getChat(parsedChatId);
        if (chatInfo?.status) {
          setStatus(chatInfo.status.toLowerCase());
        }
      } catch (err) {
        if (!isActive) return;
        setError('Unable to load chat.');
      }
    };

    const startPolling = async () => {
      await claimAndLoad();
      await loadInitial();
      if (!isActive) return;
      await pollMessages();
      if (!isActive) return;
      pollRef.current = setInterval(pollMessages, 2000);
    };

    startPolling();

    return () => {
      isActive = false;
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [chatId, user, navigate]);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Fetch customer details when chat is loaded
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!chatId || user?.userType !== 'SUPPORT_AGENT') return;

      setCustomerDetailsLoading(true);
      try {
        const details = await supportChatService.getCustomerDetails(Number(chatId));
        setCustomerDetails(details);
      } catch (err) {
        console.error('Failed to fetch customer details:', err);
      } finally {
        setCustomerDetailsLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [chatId, user]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!input.trim() || !chatId) return;

    try {
      setIsSending(true);
      const parsedChatId = Number(chatId);
      const response = await supportChatService.sendMessage(parsedChatId, input.trim(), 'AGENT');
      if (response?.id && !messageIdsRef.current.has(response.id)) {
        messageIdsRef.current.add(response.id);
        lastMessageIdRef.current = Math.max(lastMessageIdRef.current, response.id || 0);
        setMessages((prev) => [...prev, response]);
      }
      setInput('');
    } catch (err) {
      setError('Message could not be sent.');
    } finally {
      setIsSending(false);
    }
  };

  const handleEndChat = async () => {
    if (!chatId) return;
    try {
      await supportChatService.closeChat(Number(chatId));
      setStatus('closed');
      navigate('/support/queue');
    } catch (err) {
      setError('Chat could not be closed.');
    }
  };

  const statusLabel = status === 'error'
    ? 'Chat unavailable'
    : status === 'closed'
      ? 'Chat closed'
      : status === 'active'
        ? 'Active'
        : status === 'queued'
          ? 'Waiting in queue'
          : 'Starting chat...';

  const getFileUrl = (attachment) => `${API_BASE_URL}/support/chat/${attachment.chatId}/file/${attachment.id}`;

  return (
    <div className="min-h-[calc(100vh-160px)] bg-gradient-to-br from-[#fef7ec] via-[#f5f5f5] to-[#ffe8e0] px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_15px_45px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Support Team</p>
              <h1 className="text-3xl font-black text-black md:text-4xl">Agent Console</h1>
              <p className="mt-2 max-w-xl text-sm text-gray-600">
                Respond quickly, keep it clear, and close the loop.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">Status</p>
                <p className="text-sm font-semibold text-black">{statusLabel}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Details Panel - Support Agent View */}
        {customerDetails && (
          <div className="rounded-3xl border border-black/10 bg-white/90 shadow-[0_15px_45px_rgba(0,0,0,0.08)] backdrop-blur overflow-hidden">
            <button
              type="button"
              onClick={() => setShowCustomerPanel(!showCustomerPanel)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <User className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">Customer Info</p>
                  <p className="text-sm font-semibold text-black">
                    {customerDetails.firstName} {customerDetails.lastName}
                    {customerDetails.email && <span className="text-gray-500 font-normal ml-2">({customerDetails.email})</span>}
                  </p>
                </div>
              </div>
              {showCustomerPanel ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
            </button>

            {showCustomerPanel && (
              <div className="border-t border-black/10 p-4 space-y-4">
                {/* Customer Basic Info */}
                {customerDetails.phoneNumber && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Phone:</span> {customerDetails.phoneNumber}
                  </div>
                )}

                {/* Previous Orders */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Recent Orders ({customerDetails.orders?.length || 0})
                  </h4>
                  {customerDetails.orders && customerDetails.orders.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {customerDetails.orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2 text-sm">
                          <div>
                            <span className="font-medium">Order #{order.id}</span>
                            <span className="text-gray-400 ml-2 text-xs">
                              {new Date(order.orderDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">${order.totalPrice?.toFixed(2)}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                order.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-700' :
                                  order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-700' :
                                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                      'bg-gray-100 text-gray-700'
                              }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No orders found</p>
                  )}
                </div>

                {/* Wishlist Items */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-2 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Wishlist ({customerDetails.wishlistItems?.length || 0})
                  </h4>
                  {customerDetails.wishlistItems && customerDetails.wishlistItems.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {customerDetails.wishlistItems.slice(0, 6).map((item, idx) => (
                        <span key={idx} className="text-xs bg-pink-50 text-pink-700 px-2 py-1 rounded-full">
                          {item.productName || item.product?.name || `Product #${item.productId}`}
                        </span>
                      ))}
                      {customerDetails.wishlistItems.length > 6 && (
                        <span className="text-xs text-gray-400">+{customerDetails.wishlistItems.length - 6} more</span>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">Wishlist is empty</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {customerDetailsLoading && (
          <div className="rounded-3xl border border-black/10 bg-white/90 p-4 shadow-sm text-center text-sm text-gray-500">
            Loading customer details...
          </div>
        )}

        {!customerDetails && !customerDetailsLoading && (
          <div className="rounded-3xl border border-black/10 bg-yellow-50 p-4 shadow-sm text-center text-sm text-yellow-700">
            <User className="h-5 w-5 inline mr-2" />
            Guest user - No customer details available
          </div>
        )}

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">Conversation</p>
              <p className="text-sm font-semibold text-black">Agent {agentName} · Chat {chatId}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/support/queue"
                className="rounded-full border border-black px-3 py-1 text-xs font-semibold text-black transition hover:bg-black hover:text-white"
              >
                Back to queue
              </Link>
              <button
                type="button"
                onClick={handleEndChat}
                className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:border-black hover:text-black"
              >
                End chat
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <div className="mt-4 flex h-[420px] flex-col gap-4 overflow-y-auto pr-2">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-gray-500">
                <p className="text-sm font-semibold">No messages yet.</p>
                <p className="text-xs">Send a reply to start the conversation.</p>
              </div>
            )}
            {messages.map((message) => {
              const isAgent = message.senderType === 'AGENT';
              return (
                <div
                  key={`${message.id}-${message.createdAt}`}
                  className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-sm ${isAgent
                      ? 'bg-black text-white'
                      : 'bg-[#f5f5f5] text-black'
                      }`}
                  >
                    {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
                    {message.attachment && (
                      <div className={`mt-2 rounded-xl px-3 py-2 text-xs ${isAgent ? 'border border-white/20 bg-white/10' : 'border border-black/10 bg-white'}`}>
                        <p className="font-semibold">{message.attachment.filename}</p>
                        <div className="mt-1 flex items-center justify-between text-[10px] uppercase tracking-[0.2em]">
                          <span>{message.attachment.size} bytes</span>
                          <a
                            href={getFileUrl(message.attachment)}
                            className={`${isAgent ? 'text-white underline' : 'text-black underline'}`}
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    )}
                    <p className={`mt-2 text-[10px] uppercase tracking-[0.2em] ${isAgent ? 'text-white/60' : 'text-gray-500'}`}>
                      {message.senderType?.toLowerCase() || 'customer'}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          <form onSubmit={handleSend} className="mt-6 flex flex-col gap-3">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={3}
              placeholder={status === 'closed' ? 'Chat is closed.' : 'Type your reply...'}
              disabled={status === 'closed' || status === 'error' || isSending}
              className="w-full resize-none rounded-2xl border border-black/10 bg-[#fdf7f0] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:cursor-not-allowed disabled:bg-gray-100"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-gray-500">Respond within 2 minutes for best experience.</p>
              <button
                type="submit"
                disabled={status === 'closed' || status === 'error' || isSending}
                className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send
                <SendHorizontal className="h-4 w-4" />
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default SupportAgentChat;
