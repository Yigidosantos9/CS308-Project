import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, ChevronDown, FileText, XCircle, RotateCcw, LogOut, Star, MessageSquare, AlertCircle } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { orderService, reviewService, productService, authService, refundService } from '../../services/api';

const ORDER_STATUSES = ['PREPARING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

const PMDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useShop();
    const [orders, setOrders] = useState([]);
    const [pendingReviews, setPendingReviews] = useState([]);
    const [pendingRefunds, setPendingRefunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [activeTab, setActiveTab] = useState('orders');
    const [productNames, setProductNames] = useState({});
    const [userNames, setUserNames] = useState({});

    // Refund rejection modal state
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedRefundOrder, setSelectedRefundOrder] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processingRefund, setProcessingRefund] = useState(false);

    useEffect(() => {
        // Check if user is product manager OR sales manager
        if (!user || (user.userType !== 'PRODUCT_MANAGER' && user.userType !== 'SALES_MANAGER')) {
            navigate('/');
            return;
        }
        fetchOrders();
        fetchPendingReviews();
        fetchPendingRefunds();
    }, [user, navigate]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await orderService.getAllOrders();
            setOrders(data || []);

            // Fetch customer names for orders
            const orderUserIds = [...new Set((data || []).map(o => o.userId).filter(Boolean))];
            const orderUserData = {};
            for (const uid of orderUserIds) {
                try {
                    const fetchedUser = await authService.getUserById(uid);
                    const fullName = [fetchedUser?.firstName, fetchedUser?.lastName].filter(Boolean).join(' ').trim();
                    orderUserData[uid] = fullName || fetchedUser?.email || `Customer #${uid}`;
                } catch {
                    orderUserData[uid] = `Customer #${uid}`;
                }
            }
            setUserNames(prev => ({ ...prev, ...orderUserData }));

            // Fetch product names for order items
            const allProductIds = [...new Set(
                (data || []).flatMap(order =>
                    (order.items || []).map(item => item.productId)
                ).filter(Boolean)
            )];
            const orderProductData = {};
            for (const id of allProductIds) {
                try {
                    const product = await productService.getProductById(id);
                    orderProductData[id] = product?.name || `Product #${id}`;
                } catch {
                    orderProductData[id] = `Product #${id}`;
                }
            }
            setProductNames(prev => ({ ...prev, ...orderProductData }));
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

            // Fetch product names
            const productIds = [...new Set((data || []).map(r => r.productId))];
            const productData = {};
            for (const id of productIds) {
                try {
                    const product = await productService.getProductById(id);
                    productData[id] = product?.name || `Product #${id}`;
                } catch {
                    productData[id] = `Product #${id}`;
                }
            }
            setProductNames(prev => ({ ...prev, ...productData }));

            // Fetch user names
            const userIds = [...new Set((data || []).map(r => r.userId).filter(Boolean))];
            const userData = {};
            for (const uid of userIds) {
                try {
                    const user = await authService.getUserById(uid);
                    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
                    userData[uid] = fullName || user?.email || `User #${uid}`;
                } catch {
                    userData[uid] = `User #${uid}`;
                }
            }
            setUserNames(prev => ({ ...prev, ...userData }));
        } catch (error) {
            console.error('Failed to fetch pending reviews:', error);
        }
    };

    const fetchPendingRefunds = async () => {
        try {
            const data = await refundService.getPendingRefundRequests();
            setPendingRefunds(data || []);

            // Fetch user names for refund requests
            const userIds = [...new Set((data || []).map(r => r.userId).filter(Boolean))];
            const userData = {};
            for (const uid of userIds) {
                if (!userNames[uid]) {
                    try {
                        const fetchedUser = await authService.getUserById(uid);
                        const fullName = [fetchedUser?.firstName, fetchedUser?.lastName].filter(Boolean).join(' ').trim();
                        userData[uid] = fullName || fetchedUser?.email || `Customer #${uid}`;
                    } catch {
                        userData[uid] = `Customer #${uid}`;
                    }
                }
            }
            setUserNames(prev => ({ ...prev, ...userData }));

            // Fetch product names for refund items
            const allProductIds = [...new Set(
                (data || []).flatMap(order =>
                    (order.items || []).map(item => item.productId)
                ).filter(Boolean)
            )];
            const productData = {};
            for (const id of allProductIds) {
                if (!productNames[id]) {
                    try {
                        const product = await productService.getProductById(id);
                        productData[id] = product?.name || `Product #${id}`;
                    } catch {
                        productData[id] = `Product #${id}`;
                    }
                }
            }
            setProductNames(prev => ({ ...prev, ...productData }));
        } catch (error) {
            console.error('Failed to fetch pending refunds:', error);
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

    // ==================== REFUND HANDLERS ====================
    const handleApproveRefund = async (orderId) => {
        if (processingRefund) return;

        setProcessingRefund(true);
        try {
            await refundService.approveRefund(orderId);
            fetchPendingRefunds();
            fetchOrders();
            alert('Refund approved successfully! Stock has been restored and customer notified.');
        } catch (error) {
            console.error('Failed to approve refund:', error);
            alert('Failed to approve refund: ' + (error.response?.data?.message || error.message));
        } finally {
            setProcessingRefund(false);
        }
    };

    const openRejectModal = (order) => {
        setSelectedRefundOrder(order);
        setRejectionReason('');
        setRejectModalOpen(true);
    };

    const handleRejectRefund = async () => {
        if (!selectedRefundOrder || processingRefund) return;

        setProcessingRefund(true);
        try {
            await refundService.rejectRefund(selectedRefundOrder.id, rejectionReason || null);
            setRejectModalOpen(false);
            setSelectedRefundOrder(null);
            setRejectionReason('');
            fetchPendingRefunds();
            fetchOrders();
            alert('Refund request rejected. Customer has been notified.');
        } catch (error) {
            console.error('Failed to reject refund:', error);
            alert('Failed to reject refund: ' + (error.response?.data?.message || error.message));
        } finally {
            setProcessingRefund(false);
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
                        <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
                        <p className="text-gray-600 mt-2">Manage orders, reviews, and refund requests</p>
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
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
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
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-orange-200 border-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Pending Refunds</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {pendingRefunds.length}
                                </p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-orange-400" />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 flex-wrap">
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
                        onClick={() => setActiveTab('refunds')}
                        className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${activeTab === 'refunds'
                            ? 'bg-orange-600 text-white'
                            : 'bg-white text-gray-700 border border-orange-300'
                            }`}
                    >
                        <RotateCcw className="h-4 w-4" />
                        Pending Refunds ({pendingRefunds.length})
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

                {/* Pending Refunds List */}
                {activeTab === 'refunds' && (
                    <div className="space-y-4">
                        {pendingRefunds.length === 0 ? (
                            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
                                <RotateCcw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No pending refund requests</p>
                            </div>
                        ) : (
                            pendingRefunds.map(order => (
                                <div
                                    key={order.id}
                                    className="bg-white rounded-xl shadow-sm border border-orange-200 overflow-hidden"
                                >
                                    <div className="p-5 bg-orange-50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="font-bold text-lg">Order #{order.id}</span>
                                                    <span className="text-sm text-gray-500">
                                                        by {userNames[order.userId] || `Customer #${order.userId}`}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-orange-100 text-orange-800">
                                                        <Clock className="h-3 w-3" />
                                                        Refund Pending
                                                    </span>
                                                </div>

                                                <div className="text-sm text-gray-600 mb-3">
                                                    <p><span className="font-medium">Order Date:</span> {new Date(order.orderDate).toLocaleDateString()}</p>
                                                    <p><span className="font-medium">Total Amount:</span> ${order.totalPrice?.toFixed(2)}</p>
                                                    {order.refundRequestedAt && (
                                                        <p><span className="font-medium">Refund Requested:</span> {new Date(order.refundRequestedAt).toLocaleDateString()}</p>
                                                    )}
                                                </div>

                                                {/* Refund Reason */}
                                                {order.refundReason && (
                                                    <div className="bg-white rounded-lg p-3 border border-orange-200 mb-3">
                                                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Customer's Reason for Refund:</p>
                                                        <p className="text-gray-700">{order.refundReason}</p>
                                                    </div>
                                                )}

                                                {/* Order Items */}
                                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Order Items:</p>
                                                    <div className="space-y-2">
                                                        {order.items?.map((item, index) => (
                                                            <div key={index} className="flex justify-between text-sm">
                                                                <span>{productNames[item.productId] || `Product #${item.productId}`} x{item.quantity}</span>
                                                                <span className="font-medium">${item.price?.toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    onClick={() => handleApproveRefund(order.id)}
                                                    disabled={processingRefund}
                                                    className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                    Approve Refund
                                                </button>
                                                <button
                                                    onClick={() => openRejectModal(order)}
                                                    disabled={processingRefund}
                                                    className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Orders List - Only show when not in reviews or refunds tab */}
                {(activeTab === 'orders' || activeTab === 'pending') && (
                    <div className="space-y-4">
                        {orders
                            .filter(order => activeTab === 'orders' || order.status !== 'DELIVERED')
                            .sort((a, b) => b.id - a.id)
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
                                                        {userNames[order.userId] || `Customer #${order.userId}`} • {new Date(order.orderDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="font-bold">${order.totalPrice?.toFixed(2)}</p>
                                                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                                                    {getStatusIcon(order.status)}
                                                    {order.status}
                                                </span>
                                                {order.refundStatus === 'PENDING' && (
                                                    <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-orange-100 text-orange-800">
                                                        <AlertCircle className="h-3 w-3" />
                                                        Refund Pending
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Details */}
                                    {expandedOrderId === order.id && (
                                        <div className="border-t border-gray-200 bg-gray-50 p-5">
                                            {/* Delivery Address */}
                                            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-800">
                                                    <Truck className="h-4 w-4" />
                                                    Delivery Information
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <p className="text-gray-500 text-xs uppercase">Customer Name</p>
                                                        <p className="font-medium">{order.buyerName || userNames[order.userId] || `Customer #${order.userId}`}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 text-xs uppercase">Delivery Address</p>
                                                        <p className="font-medium">{order.buyerAddress || 'Address not provided'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Order Items */}
                                            <h4 className="font-semibold mb-3">Order Items</h4>
                                            <div className="space-y-2 mb-4">
                                                {order.items?.map((item, index) => (
                                                    <div key={index} className="flex justify-between bg-white p-3 rounded-lg border border-gray-100">
                                                        <div>
                                                            <p className="font-medium">{productNames[item.productId] || `Product #${item.productId}`}</p>
                                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                        </div>
                                                        <p className="font-medium">${item.price?.toFixed(2)}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Status Update */}
                                            <div className="border-t border-gray-200 pt-4 mt-4">
                                                <h4 className="font-semibold mb-3">Update Status</h4>
                                                <div className="flex gap-2 flex-wrap">
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

                {orders.length === 0 && (activeTab === 'orders' || activeTab === 'pending') && (
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
                                                <span className="font-semibold">{productNames[review.productId] || `Product #${review.productId}`}</span>
                                                <span className="text-sm text-gray-500">
                                                    by {userNames[review.userId] || review.userName || `User #${review.userId}`}
                                                </span>
                                            </div>
                                            {review.rating != null && review.rating > 0 && (
                                                <div className="flex items-center gap-1 mb-2">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <Star
                                                            key={star}
                                                            className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                            {review.comment && (
                                                <p className="text-gray-700">{review.comment}</p>
                                            )}
                                            {!review.rating && !review.comment && (
                                                <p className="text-gray-400 italic">No content</p>
                                            )}
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

            {/* Refund Rejection Modal */}
            {rejectModalOpen && selectedRefundOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
                        <h3 className="text-xl font-bold mb-4">Reject Refund Request</h3>
                        <p className="text-gray-600 mb-4">
                            You are about to reject the refund request for Order #{selectedRefundOrder.id}.
                            You may optionally provide a reason that will be sent to the customer.
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rejection Reason (optional)
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="E.g., Item was used, Outside of refund window, etc."
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                rows={4}
                                maxLength={1000}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {rejectionReason.length}/1000 characters
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleRejectRefund}
                                disabled={processingRefund}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processingRefund ? 'Processing...' : 'Confirm Rejection'}
                            </button>
                            <button
                                onClick={() => {
                                    setRejectModalOpen(false);
                                    setSelectedRefundOrder(null);
                                    setRejectionReason('');
                                }}
                                disabled={processingRefund}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PMDashboard;