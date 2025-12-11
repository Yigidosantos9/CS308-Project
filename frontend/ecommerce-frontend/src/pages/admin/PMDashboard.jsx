import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, ChevronDown, FileText, XCircle, RotateCcw, LogOut, Star, MessageSquare } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { orderService, reviewService } from '../../services/api';

const ORDER_STATUSES = ['PREPARING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

const PMDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useShop();
    const [orders, setOrders] = useState([]);
    const [pendingReviews, setPendingReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [activeTab, setActiveTab] = useState('orders');

    useEffect(() => {
        // Check if user is product manager
        if (!user || user.userType !== 'PRODUCT_MANAGER') {
            navigate('/');
            return;
        }
        fetchOrders();
        fetchPendingReviews();
    }, [user, navigate]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await orderService.getAllOrders();
            setOrders(data || []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingReviews = async () => {
        try {
            const data = await reviewService.getPendingReviews();
            setPendingReviews(data || []);
        } catch (error) {
            console.error('Failed to fetch pending reviews:', error);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            // Refresh orders after update
            fetchOrders();
        } catch (error) {
            console.error('Failed to update order status:', error);
            alert('Failed to update order status');
        }
    };

    const handleApproveReview = async (reviewId) => {
        try {
            await reviewService.approveReview(reviewId);
            fetchPendingReviews();
        } catch (error) {
            console.error('Failed to approve review:', error);
            alert('Failed to approve review');
        }
    };

    const handleDisapproveReview = async (reviewId) => {
        try {
            await reviewService.disapproveReview(reviewId);
            fetchPendingReviews();
        } catch (error) {
            console.error('Failed to disapprove review:', error);
            alert('Failed to disapprove review');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PREPARING':
                return <Clock className="h-4 w-4" />;
            case 'IN_TRANSIT':
                return <Truck className="h-4 w-4" />;
            case 'DELIVERED':
                return <CheckCircle className="h-4 w-4" />;
            case 'CANCELLED':
                return <XCircle className="h-4 w-4" />;
            case 'REFUNDED':
                return <RotateCcw className="h-4 w-4" />;
            default:
                return <Package className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PREPARING':
                return 'bg-yellow-100 text-yellow-800';
            case 'IN_TRANSIT':
                return 'bg-blue-100 text-blue-800';
            case 'DELIVERED':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            case 'REFUNDED':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Product Manager Dashboard</h1>
                        <p className="text-gray-600 mt-2">Manage orders and deliveries</p>
                    </div>
                    <button
                        onClick={() => {
                            logout();
                            navigate('/login');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Orders</p>
                                <p className="text-2xl font-bold">{orders.length}</p>
                            </div>
                            <Package className="h-8 w-8 text-gray-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Preparing</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {orders.filter(o => o.status === 'PREPARING').length}
                                </p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">In Transit</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {orders.filter(o => o.status === 'IN_TRANSIT').length}
                                </p>
                            </div>
                            <Truck className="h-8 w-8 text-blue-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Delivered</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {orders.filter(o => o.status === 'DELIVERED').length}
                                </p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-400" />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'orders'
                            ? 'bg-gray-900 text-white'
                            : 'bg-white text-gray-700 border border-gray-200'
                            }`}
                    >
                        All Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'pending'
                            ? 'bg-gray-900 text-white'
                            : 'bg-white text-gray-700 border border-gray-200'
                            }`}
                    >
                        Pending Delivery
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${activeTab === 'reviews'
                            ? 'bg-gray-900 text-white'
                            : 'bg-white text-gray-700 border border-gray-200'
                            }`}
                    >
                        <MessageSquare className="h-4 w-4" />
                        Pending Reviews ({pendingReviews.length})
                    </button>
                </div>

                {/* Orders List - Only show when not in reviews tab */}
                {activeTab !== 'reviews' && (
                    <div className="space-y-4">
                        {orders
                            .filter(order => activeTab === 'orders' || order.status !== 'DELIVERED')
                            .map(order => (
                                <div
                                    key={order.id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                                >
                                    {/* Order Header */}
                                    <div
                                        className="p-5 cursor-pointer hover:bg-gray-50 transition"
                                        onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <ChevronDown
                                                    className={`h-5 w-5 text-gray-400 transition-transform ${expandedOrderId === order.id ? 'rotate-180' : ''
                                                        }`}
                                                />
                                                <div>
                                                    <p className="font-bold">Order #{order.id}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Customer #{order.userId} • {new Date(order.orderDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="font-bold">${order.totalPrice?.toFixed(2)}</p>
                                                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                                                    {getStatusIcon(order.status)}
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Details */}
                                    {expandedOrderId === order.id && (
                                        <div className="border-t border-gray-200 bg-gray-50 p-5">
                                            {/* Order Items */}
                                            <h4 className="font-semibold mb-3">Order Items</h4>
                                            <div className="space-y-2 mb-4">
                                                {order.items?.map((item, index) => (
                                                    <div key={index} className="flex justify-between bg-white p-3 rounded-lg border border-gray-100">
                                                        <div>
                                                            <p className="font-medium">Product #{item.productId}</p>
                                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                        </div>
                                                        <p className="font-medium">${item.price?.toFixed(2)}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Status Update */}
                                            <div className="border-t border-gray-200 pt-4 mt-4">
                                                <h4 className="font-semibold mb-3">Update Status</h4>
                                                <div className="flex gap-2">
                                                    {ORDER_STATUSES.map(status => (
                                                        <button
                                                            key={status}
                                                            onClick={() => handleStatusUpdate(order.id, status)}
                                                            disabled={order.status === status}
                                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${order.status === status
                                                                ? 'bg-gray-900 text-white cursor-default'
                                                                : 'bg-white border border-gray-300 hover:bg-gray-100'
                                                                }`}
                                                        >
                                                            {status.replace('_', ' ')}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                )}

                {orders.length === 0 && activeTab !== 'reviews' && (
                    <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No orders yet</p>
                    </div>
                )}

                {/* Pending Reviews List */}
                {activeTab === 'reviews' && (
                    <div className="space-y-4">
                        {pendingReviews.length === 0 ? (
                            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
                                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No pending reviews</p>
                            </div>
                        ) : (
                            pendingReviews.map(review => (
                                <div
                                    key={review.id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-semibold">Product #{review.productId}</span>
                                                <span className="text-sm text-gray-500">
                                                    by {review.userName ||
                                                        review.username ||
                                                        review.reviewerName ||
                                                        review.reviewerFullName ||
                                                        (review.userId ? `User #${review.userId}` : 'User')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 mb-2">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star
                                                        key={star}
                                                        className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-gray-700">{review.comment}</p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleApproveReview(review.id)}
                                                className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleDisapproveReview(review.id)}
                                                className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PMDashboard;
