import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Paperclip, SendHorizontal } from 'lucide-react';

import { supportChatService } from '../../services/api';
import { useShop } from '../../context/ShopContext';

const CHAT_STORAGE_KEY_PREFIX = 'supportChatId';
const LEGACY_CHAT_STORAGE_KEY = 'supportChatId';

const SupportChat = () => {
  const { user, loading } = useShop();
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState('starting');
  const [error, setError] = useState('');
  const lastMessageIdRef = useRef(0);
  const messageIdsRef = useRef(new Set());
  const pollRef = useRef(null);
  const endRef = useRef(null);
  const fileInputRef = useRef(null);

  const storageKey = useMemo(() => {
    const userStorageId = user?.userId || user?.email;
    if (userStorageId) {
      return `${CHAT_STORAGE_KEY_PREFIX}:user:${userStorageId}`;
    }
    return `${CHAT_STORAGE_KEY_PREFIX}:guest`;
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    if (loading) {
      return () => {
        isMounted = false;
      };
    }
    const startChat = async () => {
      try {
        setStatus('starting');
        const customerId = user?.userType === 'CUSTOMER' ? user.userId : undefined;
        const response = await supportChatService.startChat({
          source: 'web',
          note: 'Customer initiated chat',
          customerId,
        });
        if (!isMounted) return;
        setChatId(response.chatId);
        const normalizedStatus = response.status ? response.status.toLowerCase() : 'queued';
        setStatus(normalizedStatus);
        localStorage.setItem(storageKey, String(response.chatId));
        setMessages([]);
        lastMessageIdRef.current = 0;
        messageIdsRef.current = new Set();
      } catch (err) {
        if (!isMounted) return;
        setError('Chat could not be started. Please try again.');
        setStatus('error');
      }
    };

    const initChat = async () => {
      setChatId(null);
      setMessages([]);
      lastMessageIdRef.current = 0;
      messageIdsRef.current = new Set();
      setStatus('starting');

      localStorage.removeItem(LEGACY_CHAT_STORAGE_KEY);

      if (user?.userId || user?.email) {
        localStorage.removeItem(`${CHAT_STORAGE_KEY_PREFIX}:guest`);
        try {
          const customerId = user?.userType === 'CUSTOMER' ? user.userId : undefined;
          const activeChat = customerId ? await supportChatService.getActiveChat(customerId) : null;
          if (!isMounted) return;
          if (activeChat?.chatId) {
            setChatId(activeChat.chatId);
            setStatus(activeChat.status ? activeChat.status.toLowerCase() : 'queued');
            localStorage.setItem(storageKey, String(activeChat.chatId));
            return;
          }
        } catch (err) {
          if (!isMounted) return;
        }
        await startChat();
        return;
      }

      const existingChatId = localStorage.getItem(storageKey);
      if (existingChatId) {
        setChatId(Number(existingChatId));
        setStatus('active');
        return;
      }

      await startChat();
    };

    initChat();
    return () => {
      isMounted = false;
    };
  }, [user, loading, storageKey]);

  useEffect(() => {
    if (!chatId) return undefined;

    let isActive = true;
    const switchToChat = (nextChatId, nextStatus) => {
      if (!nextChatId || nextChatId === chatId) {
        return;
      }
      setChatId(nextChatId);
      setMessages([]);
      lastMessageIdRef.current = 0;
      messageIdsRef.current = new Set();
      setStatus(nextStatus ? nextStatus.toLowerCase() : 'queued');
      localStorage.setItem(storageKey, String(nextChatId));
    };

    const pollMessages = async () => {
      try {
        if (user?.userId) {
        const customerId = user?.userType === 'CUSTOMER' ? user.userId : undefined;
        const activeChat = customerId ? await supportChatService.getActiveChat(customerId) : null;
          if (activeChat?.chatId && activeChat.chatId !== chatId) {
            switchToChat(activeChat.chatId, activeChat.status);
            return;
          }
          if (activeChat?.chatId === chatId && activeChat?.status) {
            setStatus(activeChat.status.toLowerCase());
          }
          if (!activeChat?.chatId) {
            const chatInfo = await supportChatService.getChat(chatId);
            if (chatInfo?.status) {
              setStatus(chatInfo.status.toLowerCase());
            }
          }
        } else {
          const chatInfo = await supportChatService.getChat(chatId);
          if (chatInfo?.status) {
            setStatus(chatInfo.status.toLowerCase());
          }
        }

        const newMessages = await supportChatService.getMessages(chatId, lastMessageIdRef.current);
        if (Array.isArray(newMessages) && newMessages.length > 0) {
          const uniqueMessages = newMessages.filter((message) => !messageIdsRef.current.has(message.id));
          if (uniqueMessages.length === 0) {
            return;
          }
          uniqueMessages.forEach((message) => messageIdsRef.current.add(message.id));
          lastMessageIdRef.current = uniqueMessages[uniqueMessages.length - 1].id;
          setMessages((prev) => [...prev, ...uniqueMessages]);
        }
      } catch (err) {
        if (err.response?.status === 404 && isActive) {
          localStorage.removeItem(storageKey);
          setChatId(null);
          setMessages([]);
          lastMessageIdRef.current = 0;
          setStatus('error');
          return;
        }
        setError('Unable to sync messages right now.');
      }
    };

    const loadInitial = async () => {
      try {
        const initialMessages = await supportChatService.getMessages(chatId);
        if (!isActive) return;
        if (Array.isArray(initialMessages)) {
          setMessages(initialMessages);
          messageIdsRef.current = new Set(initialMessages.map((message) => message.id));
          if (initialMessages.length > 0) {
            lastMessageIdRef.current = initialMessages[initialMessages.length - 1].id;
          }
        }
        const chatInfo = await supportChatService.getChat(chatId);
        if (chatInfo?.status) {
          setStatus(chatInfo.status.toLowerCase());
        }
      } catch (err) {
        if (err.response?.status === 404 && isActive) {
          localStorage.removeItem(storageKey);
          setChatId(null);
          setMessages([]);
          lastMessageIdRef.current = 0;
          setStatus('error');
        }
      }
    };

    const startPolling = async () => {
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
  }, [chatId, user]);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (event) => {
    event.preventDefault();
    if ((!input.trim() && !selectedFile) || !chatId) return;

    try {
      setIsSending(true);

      if (selectedFile) {
        const fileResponse = await supportChatService.uploadFile(chatId, selectedFile);
        if (fileResponse?.id && !messageIdsRef.current.has(fileResponse.id)) {
          messageIdsRef.current.add(fileResponse.id);
          lastMessageIdRef.current = Math.max(lastMessageIdRef.current, fileResponse.id || 0);
          setMessages((prev) => [...prev, fileResponse]);
        }
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }

      if (input.trim()) {
        const response = await supportChatService.sendMessage(chatId, input.trim());
        if (response?.id && !messageIdsRef.current.has(response.id)) {
          messageIdsRef.current.add(response.id);
          lastMessageIdRef.current = Math.max(lastMessageIdRef.current, response.id || 0);
          setMessages((prev) => [...prev, response]);
        }
        setInput('');
      }
      setStatus('active');
      setError('');
    } catch (err) {
      if (err.response?.status === 409) {
        setStatus('closed');
        setError('This chat is closed. Start a new chat to continue.');
        return;
      }
      const backendMessage = err.response?.data?.error;
      setError(backendMessage || 'Message could not be sent. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleDownloadAttachment = async (attachment) => {
    if (!attachment) return;
    try {
      const response = await supportChatService.downloadFile(attachment.chatId, attachment.id);
      const contentType = response.headers?.['content-type'] || 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.filename || 'attachment';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Unable to download file.');
    }
  };

  const formatFileSize = (size) => {
    if (!size && size !== 0) return '';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleCloseChat = async () => {
    if (!chatId) return;
    try {
      await supportChatService.closeChat(chatId);
    } catch (err) {
      if (err.response?.status !== 404 && err.response?.status !== 409) {
        setError('Unable to close chat right now.');
        return;
      }
    }
    localStorage.removeItem(storageKey);
    setStatus('closed');
    messageIdsRef.current = new Set();
  };

  const handleStartNewChat = async () => {
    if (chatId) {
      try {
        await supportChatService.closeChat(chatId);
      } catch (err) {
        setError('Unable to close previous chat.');
      }
    }
    localStorage.removeItem(storageKey);
    setChatId(null);
    setMessages([]);
    lastMessageIdRef.current = 0;
    messageIdsRef.current = new Set();
    setError('');
    setStatus('starting');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    try {
      const customerId = user?.userType === 'CUSTOMER' ? user.userId : undefined;
      const response = await supportChatService.startChat({
        source: 'web',
        note: 'Customer initiated chat',
        customerId,
      });
      setChatId(response.chatId);
      const normalizedStatus = response.status ? response.status.toLowerCase() : 'queued';
      setStatus(normalizedStatus);
      localStorage.setItem(storageKey, String(response.chatId));
    } catch (err) {
      setStatus('error');
      setError('Chat could not be started. Please try again.');
    }
  };

  const statusLabel = status === 'error'
    ? 'Chat unavailable'
    : status === 'closed'
      ? 'Chat closed'
    : status === 'active'
      ? 'Agent will respond soon'
      : status === 'queued'
        ? 'Waiting in queue'
        : 'Starting chat...';

  return (
    <div className="min-h-[calc(100vh-160px)] bg-gradient-to-br from-[#fef7ec] via-[#f5f5f5] to-[#ffe8e0] px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_15px_45px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Support Desk</p>
              <h1 className="text-3xl font-black text-black md:text-4xl">Live Styling Chat</h1>
              <p className="mt-2 max-w-xl text-sm text-gray-600">
                Reach a product expert in real time. Ask sizing questions, track an order, or get curated outfit ideas.
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

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between border-b border-black/10 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">Conversation</p>
                <p className="text-sm font-semibold text-black">Chat with Support</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">Chat ID {chatId || '...'}</span>
                <button
                  type="button"
                  onClick={handleStartNewChat}
                  className="rounded-full border border-black px-3 py-1 text-xs font-semibold text-black transition hover:bg-black hover:text-white"
                >
                  New chat
                </button>
                <button
                  type="button"
                  onClick={handleCloseChat}
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:border-black hover:text-black"
                >
                  End chat
                </button>
              </div>
            </div>

            <div className="mt-4 flex h-[380px] flex-col gap-4 overflow-y-auto pr-2">
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-gray-500">
                  <p className="text-sm font-semibold">Say hello to get started.</p>
                  <p className="text-xs">A support agent will join as soon as they pick up your request.</p>
                </div>
              )}
              {messages.map((message) => {
                const isCustomer = message.senderType === 'CUSTOMER' || message.senderType === 'GUEST';
                return (
                  <div
                    key={`${message.id}-${message.createdAt}`}
                    className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-sm ${isCustomer
                        ? 'bg-black text-white'
                        : 'bg-[#f5f5f5] text-black'
                        }`}
                    >
                      {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
                      {message.attachment && (
                        <div className={`mt-2 rounded-xl px-3 py-2 text-xs ${isCustomer ? 'border border-white/20 bg-white/10' : 'border border-black/10 bg-white'}`}>
                          <p className="font-semibold">{message.attachment.filename}</p>
                          <div className="mt-1 flex items-center justify-between text-[10px] uppercase tracking-[0.2em]">
                            <span>{formatFileSize(message.attachment.size)}</span>
                            <button
                              type="button"
                              onClick={() => handleDownloadAttachment(message.attachment)}
                              className={`${isCustomer ? 'text-white underline' : 'text-black underline'}`}
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      )}
                      <p className={`mt-2 text-[10px] uppercase tracking-[0.2em] ${isCustomer ? 'text-white/60' : 'text-gray-500'}`}>
                        {message.senderType?.toLowerCase() || 'agent'}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>

            <form onSubmit={handleSend} className="mt-6 flex flex-col gap-3">
              {selectedFile && (
                <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-2 text-xs">
                  <div>
                    <p className="font-semibold">{selectedFile.name}</p>
                    <p className="text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-semibold text-gray-500 hover:text-black"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                rows={3}
                placeholder={status === 'closed' ? 'Start a new chat to continue.' : 'Type your message...'}
                disabled={!chatId || status === 'closed' || status === 'error' || isSending}
                className="w-full resize-none rounded-2xl border border-black/10 bg-[#fdf7f0] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:cursor-not-allowed disabled:bg-gray-100"
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                {error ? (
                  <p className="text-xs font-semibold text-red-600">{error}</p>
                ) : (
                  <p className="text-xs text-gray-500">We typically reply within 2 minutes.</p>
                )}
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={!chatId || status === 'closed' || status === 'error' || isSending}
                  />
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-black px-4 py-2 text-sm font-semibold text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!chatId || status === 'closed' || status === 'error' || isSending}
                  >
                    <Paperclip className="h-4 w-4" />
                    Attach
                  </button>
                  <button
                    type="submit"
                    disabled={!chatId || status === 'closed' || status === 'error' || isSending}
                    className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Send
                    <SendHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </form>
          </section>

          <aside className="flex flex-col gap-6">
            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">What we can do</p>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-gray-700">
                <li>Sizing and fit guidance tailored to your preferences.</li>
                <li>Order status, return eligibility, and delivery updates.</li>
                <li>Styling suggestions for upcoming drops.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-black/10 bg-black p-6 text-white shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Availability</p>
              <p className="mt-3 text-2xl font-black">Mon-Sat</p>
              <p className="text-sm text-white/80">09:00 -> 22:00</p>
              <div className="mt-6 rounded-2xl bg-white/10 px-4 py-3 text-xs uppercase tracking-[0.3em] text-white/70">
                Queue updates refresh every 2 seconds
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default SupportChat;
