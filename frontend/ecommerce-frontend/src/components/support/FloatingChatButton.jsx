import { MessageCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';

const FloatingChatButton = () => {
    const location = useLocation();
    const { user } = useShop();

    // Hide on support pages and admin dashboards
    const hiddenPaths = [
        '/support',
        '/pm-dashboard',
        '/sales-dashboard',
        '/login',
        '/register'
    ];

    const shouldHide = hiddenPaths.some(path => location.pathname.startsWith(path));

    // Also hide for support agents (they use the queue)
    if (shouldHide || user?.userType === 'SUPPORT_AGENT') {
        return null;
    }

    return (
        <Link
            to="/support"
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl active:scale-95"
            title="Chat with Support"
        >
            <MessageCircle className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-4 w-4 rounded-full bg-green-500"></span>
            </span>
        </Link>
    );
};

export default FloatingChatButton;
