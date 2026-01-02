import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCcw, Users } from 'lucide-react';

import { authService, supportChatService } from '../../services/api';
import { useShop } from '../../context/ShopContext';

const SupportAgentQueue = () => {
  const { user } = useShop();
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState('');
  const [customerNames, setCustomerNames] = useState({});

  const loadQueue = async () => {
    try {
      setIsLoading(true);
      const data = await supportChatService.getChatQueue(user?.userId);
      const nextQueue = Array.isArray(data) ? data : [];
      setQueue(nextQueue);
      const customerIds = Array.from(new Set(
        nextQueue.map((item) => item.customerId).filter(Boolean)
      ));
      if (customerIds.length > 0) {
        const missingIds = customerIds.filter((id) => !customerNames[id]);
        if (missingIds.length > 0) {
          const entries = await Promise.all(
            missingIds.map(async (id) => {
              try {
                const userInfo = await authService.getUserById(id);
                const fullName = [userInfo?.firstName, userInfo?.lastName].filter(Boolean).join(' ').trim();
                return [id, fullName || userInfo?.email || `Customer #${id}`];
              } catch (err) {
                return [id, `Customer #${id}`];
              }
            })
          );
          setCustomerNames((prev) => Object.fromEntries([...Object.entries(prev), ...entries]));
        }
      }
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      setError('Queue could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChat = async (chatId) => {
    try {
      await supportChatService.claimChat(chatId);
      navigate(`/support/queue/${chatId}`);
    } catch (err) {
      setError('Chat could not be claimed.');
    }
  };

  useEffect(() => {
    if (!user) return;
    if (user.userType !== 'SUPPORT_AGENT') {
      navigate('/support');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.userType !== 'SUPPORT_AGENT') {
      return undefined;
    }
    let isMounted = true;
    const fetchQueue = async () => {
      if (!isMounted) return;
      await loadQueue();
    };
    fetchQueue();
    const interval = setInterval(fetchQueue, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  return (
    <div className="min-h-[calc(100vh-160px)] bg-gradient-to-br from-[#fef7ec] via-[#f5f5f5] to-[#e9f5ff] px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_15px_45px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Support Team</p>
              <h1 className="text-3xl font-black text-black md:text-4xl">Live Chat Queue</h1>
              <p className="mt-2 max-w-xl text-sm text-gray-600">
                Review customers waiting for assistance. Queue updates every 2 seconds.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">Waiting</p>
                <p className="text-sm font-semibold text-black">
                  {queue.filter((item) => (item.status || '').toLowerCase() === 'queued').length} chat(s)
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">Queue</p>
              <p className="text-sm font-semibold text-black">
                {lastUpdated ? `Last updated ${lastUpdated.toLocaleTimeString()}` : 'Fetching queue...'}
              </p>
            </div>
            <button
              type="button"
              onClick={loadQueue}
              className="inline-flex items-center gap-2 rounded-full border border-black px-4 py-2 text-xs font-semibold text-black transition hover:bg-black hover:text-white"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-4">
            {isLoading && queue.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">
                Loading queue...
              </div>
            )}
            {!isLoading && queue.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">
                No customers are waiting right now.
              </div>
            )}
            {queue.map((item) => {
              const status = item.status?.toLowerCase() || 'queued';
              const isQueued = status === 'queued';
              const isActive = status === 'active';
              const isClosed = status === 'closed';
              const cardClass = isQueued
                ? 'bg-[#fff7ed]'
                : isActive
                  ? 'bg-[#ecfdf3]'
                  : 'bg-[#f5f5f5]';
              const badgeClass = isQueued
                ? 'bg-black text-white'
                : isActive
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-500 text-white';
              const buttonLabel = isClosed ? 'View' : 'Open';
              return (
              <div
                key={item.chatId}
                className={`flex flex-col gap-3 rounded-2xl border border-black/10 px-5 py-4 md:flex-row md:items-center md:justify-between ${cardClass}`}
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
                    {item.queuePosition ? `Queue #${item.queuePosition}` : isClosed ? 'Closed chat' : 'Active chat'}
                  </p>
                  <p className="text-lg font-bold text-black">Chat {item.chatId}</p>
                  <p className="text-sm text-gray-600">
                    {item.customerId ? (customerNames[item.customerId] || `Customer #${item.customerId}`) : 'Guest customer'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${badgeClass}`}>
                    {status}
                  </span>
                  <span className="text-xs font-semibold text-gray-500">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Just now'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenChat(item.chatId)}
                    className="rounded-full border border-black px-3 py-1 text-xs font-semibold text-black transition hover:bg-black hover:text-white"
                  >
                    {buttonLabel}
                  </button>
                </div>
              </div>
            );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SupportAgentQueue;
