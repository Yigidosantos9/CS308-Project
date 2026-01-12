import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Calendar, Search, LogOut, DollarSign, TrendingUp, RefreshCw, Tag, Percent, BarChart3, RotateCcw, CheckCircle, XCircle, Clock, AlertCircle, Package } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { salesManagerService, refundService, productService, authService, orderService } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SalesManagerDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useShop();

    // Active tab state
    const [activeTab, setActiveTab] = useState('invoices');

    // Date range state - default to last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const formatDateForInput = (date) => date.toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(formatDateForInput(thirtyDaysAgo));
    const [endDate, setEndDate] = useState(formatDateForInput(today));
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Stats
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [orderCount, setOrderCount] = useState(0);

    // Discount management state
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [discountRates, setDiscountRates] = useState({});
    const [applyingDiscount, setApplyingDiscount] = useState(null);
    const [discountSuccess, setDiscountSuccess] = useState(null);
    const [productSearch, setProductSearch] = useState('');

    // Revenue chart state
    const [revenueStats, setRevenueStats] = useState(null);
    const [revenueLoading, setRevenueLoading] = useState(false);

    // ==================== REFUND MANAGEMENT STATE ====================
    const [pendingRefunds, setPendingRefunds] = useState([]);
    const [refundsLoading, setRefundsLoading] = useState(false);
    const [processingRefund, setProcessingRefund] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedRefundOrder, setSelectedRefundOrder] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [productNames, setProductNames] = useState({});
    const [userNames, setUserNames] = useState({});

    // Toast notification state
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        const timeout = type === 'error' ? 8000 : 4000;
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), timeout);
    };

    // Check authorization
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.userType !== 'SALES_MANAGER') {
            navigate('/');
            return;
        }
    }, [user, navigate]);

    // Fetch invoices on load and when dates change
    const fetchInvoices = useCallback(async () => {
        if (!startDate || !endDate) return;

        setLoading(true);
        setError(null);

        try {
            const data = await salesManagerService.getInvoices(startDate, endDate);
            setInvoices(data || []);

            // Calculate stats
            const revenue = (data || []).reduce((sum, order) => sum + (order.totalPrice || 0), 0);
            setTotalRevenue(revenue);
            setOrderCount((data || []).length);
        } catch (err) {
            console.error('Failed to fetch invoices:', err);
            setError('Failed to fetch invoices. Please try again.');
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    // Fetch products for discount management
    const fetchProducts = useCallback(async () => {
        setProductsLoading(true);
        try {
            const data = await salesManagerService.getAllProducts();
            setProducts(data || []);
        } catch (err) {
            console.error('Failed to fetch products:', err);
        } finally {
            setProductsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'discounts') {
            fetchProducts();
        }
    }, [activeTab, fetchProducts]);

    // Fetch revenue stats
    const fetchRevenueStats = useCallback(async () => {
        setRevenueLoading(true);
        try {
            const data = await salesManagerService.getRevenueStats(startDate, endDate);
            setRevenueStats(data);
        } catch (err) {
            console.error('Failed to fetch revenue stats:', err);
        } finally {
            setRevenueLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        if (activeTab === 'revenue') {
            fetchRevenueStats();
        }
    }, [activeTab, fetchRevenueStats]);

    // ==================== REFUND MANAGEMENT ====================
    const fetchPendingRefunds = useCallback(async () => {
        setRefundsLoading(true);
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
        } finally {
            setRefundsLoading(false);
        }
    }, [userNames, productNames]);

    useEffect(() => {
        if (activeTab === 'refunds') {
            fetchPendingRefunds();
        }
    }, [activeTab]);

    // Also fetch refund count on initial load for the badge
    useEffect(() => {
        const fetchRefundCount = async () => {
            try {
                const data = await refundService.getPendingRefundRequests();
                setPendingRefunds(data || []);
            } catch (error) {
                console.error('Failed to fetch pending refunds:', error);
            }
        };
        fetchRefundCount();
    }, []);

    const handleApproveRefund = async (orderId) => {
        if (processingRefund) return;

        setProcessingRefund(true);
        try {
            await refundService.approveRefund(orderId);
            fetchPendingRefunds();
            showToast('Refund approved! Stock restored and customer notified.', 'success');
        } catch (error) {
            console.error('Failed to approve refund:', error);
            showToast('Failed to approve refund: ' + (error.response?.data?.message || error.message), 'error');
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
            showToast('Refund request rejected. Customer notified.', 'success');
        } catch (error) {
            console.error('Failed to reject refund:', error);
            showToast('Failed to reject refund: ' + (error.response?.data?.message || error.message), 'error');
        } finally {
            setProcessingRefund(false);
        }
    };

    // Handle discount rate change
    const handleDiscountRateChange = (productId, value) => {
        setDiscountRates(prev => ({
            ...prev,
            [productId]: value
        }));
    };

    // Apply discount to a product
    const handleApplyDiscount = async (productId) => {
        const rate = parseFloat(discountRates[productId]);
        if (isNaN(rate) || rate < 0 || rate > 100) {
            alert('Please enter a valid discount rate between 0 and 100');
            return;
        }

        setApplyingDiscount(productId);
        try {
            const updatedProduct = await salesManagerService.setProductDiscount(productId, rate);
            setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
            setDiscountSuccess(productId);
            setTimeout(() => setDiscountSuccess(null), 3000);
        } catch (err) {
            console.error('Failed to apply discount:', err);
            alert('Failed to apply discount. Please try again.');
        } finally {
            setApplyingDiscount(null);
        }
    };

    // Remove discount from a product
    const handleRemoveDiscount = async (productId) => {
        setApplyingDiscount(productId);
        try {
            const updatedProduct = await salesManagerService.setProductDiscount(productId, 0);
            setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
            setDiscountRates(prev => ({ ...prev, [productId]: '' }));
            setDiscountSuccess(productId);
            setTimeout(() => setDiscountSuccess(null), 3000);
        } catch (err) {
            console.error('Failed to remove discount:', err);
            alert('Failed to remove discount. Please try again.');
        } finally {
            setApplyingDiscount(null);
        }
    };

    // Download individual PDF
const handleDownloadPdf = async (order) => {
    try {
        await orderService.getInvoice(
            order.id,
            order.buyerName,
            order.buyerAddress,
            order.paymentMethod
        );
    } catch (err) {
        console.error('Failed to download invoice:', err);
        alert('Failed to download invoice PDF');
    }
};

    // Logout handler
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'DELIVERED': return 'bg-green-100 text-green-800';
            case 'IN_TRANSIT': return 'bg-blue-100 text-blue-800';
            case 'PREPARING': return 'bg-yellow-100 text-yellow-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            case 'REFUNDED': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Filter products based on search
    const filteredProducts = products.filter(product =>
        product.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.model?.toLowerCase().includes(productSearch.toLowerCase())
    );

    if (!user || user.userType !== 'SALES_MANAGER') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 transform transition-all duration-300 ${toast.type === 'success'
                    ? 'bg-green-600 text-white'
                    : 'bg-red-600 text-white'
                    }`}>
                    {toast.type === 'success' ? (
                        <CheckCircle className="h-5 w-5" />
                    ) : (
                        <XCircle className="h-5 w-5" />
                    )}
                    <span className="font-medium">{toast.message}</span>
                    <button
                        onClick={() => setToast({ show: false, message: '', type: 'success' })}
                        className="ml-2 hover:opacity-75"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Header */}
            <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">Sales Manager Dashboard</h1>
                            <p className="text-emerald-100 mt-1">Welcome, {user?.firstName || 'Sales Manager'}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="max-w-7xl mx-auto px-4 mt-6">
                <div className="flex gap-2 border-b border-gray-200 flex-wrap">
                    <button
                        onClick={() => setActiveTab('invoices')}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'invoices'
                            ? 'text-emerald-600 border-b-2 border-emerald-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <FileText size={18} />
                            Invoices
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('refunds')}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'refunds'
                            ? 'text-orange-600 border-b-2 border-orange-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <RotateCcw size={18} />
                            Pending Refunds
                            {pendingRefunds.length > 0 && (
                                <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                                    {pendingRefunds.length}
                                </span>
                            )}
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('discounts')}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'discounts'
                            ? 'text-emerald-600 border-b-2 border-emerald-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Tag size={18} />
                            Product Discounts
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('revenue')}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'revenue'
                            ? 'text-emerald-600 border-b-2 border-emerald-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <BarChart3 size={18} />
                            Revenue Chart
                        </div>
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* ==================== REFUNDS TAB ==================== */}
                {activeTab === 'refunds' && (
                    <>
                        {/* Refund Stats Card */}
                        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-orange-200">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-orange-100 rounded-lg">
                                    <AlertCircle className="text-orange-600" size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Pending Refund Requests</p>
                                    <p className="text-2xl font-bold text-orange-600">{pendingRefunds.length}</p>
                                </div>
                            </div>
                        </div>

                        {/* Pending Refunds List */}
                        <div className="space-y-4">
                            {refundsLoading ? (
                                <div className="p-12 text-center bg-white rounded-xl">
                                    <RefreshCw size={32} className="animate-spin mx-auto text-orange-500 mb-4" />
                                    <p className="text-gray-500">Loading refund requests...</p>
                                </div>
                            ) : pendingRefunds.length === 0 ? (
                                <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
                                    <RotateCcw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">No pending refund requests</p>
                                    <p className="text-sm text-gray-400 mt-2">All refund requests have been processed</p>
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
                    </>
                )}

                {activeTab === 'invoices' && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-100 rounded-lg">
                                        <DollarSign className="text-emerald-600" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total Revenue</p>
                                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <FileText className="text-blue-600" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Invoice Count</p>
                                        <p className="text-2xl font-bold text-gray-900">{orderCount}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <TrendingUp className="text-purple-600" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Avg Order Value</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {formatCurrency(orderCount > 0 ? totalRevenue / orderCount : 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filter Section */}
                        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar size={20} />
                                Filter Invoices by Date Range
                            </h2>

                            <div className="flex flex-wrap gap-4 items-end">
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                <button
                                    onClick={fetchInvoices}
                                    disabled={loading}
                                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCw size={18} className="animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <Search size={18} />
                                            Search
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        {/* Invoices Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Invoices ({invoices.length})
                                </h2>
                            </div>

                            {loading ? (
                                <div className="p-12 text-center">
                                    <RefreshCw size={32} className="animate-spin mx-auto text-emerald-500 mb-4" />
                                    <p className="text-gray-500">Loading invoices...</p>
                                </div>
                            ) : invoices.length === 0 ? (
                                <div className="p-12 text-center">
                                    <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500">No invoices found for the selected date range.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Invoice #
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Order Date
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Customer
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Amount
                                                </th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {invoices.map((order) => (
                                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="font-medium text-gray-900">
                                                            {order.invoiceNumber || `INV-${order.id}`}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                        {formatDate(order.orderDate)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                        {order.buyerName || `Customer #${order.userId}`}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                                                        {formatCurrency(order.totalPrice)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <button
                                                            onClick={() => handleDownloadPdf(order)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium"
                                                        >
                                                            <Download size={14} />
                                                            PDF
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'discounts' && (
                    <>
                        {/* Discount Management Header */}
                        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Tag size={20} />
                                        Manage Product Discounts
                                    </h2>
                                    <p className="text-gray-500 text-sm mt-1">
                                        Set discount rates (0-100%) on products. Discounted prices will be shown to customers.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Search size={18} className="text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-64"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Products Grid */}
                        {productsLoading ? (
                            <div className="p-12 text-center bg-white rounded-xl">
                                <RefreshCw size={32} className="animate-spin mx-auto text-emerald-500 mb-4" />
                                <p className="text-gray-500">Loading products...</p>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="p-12 text-center bg-white rounded-xl">
                                <Tag size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500">No products found.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className={`bg-white rounded-xl shadow-sm border p-6 ${product.discountRate ? 'border-emerald-300 bg-emerald-50/30' : 'border-gray-100'
                                            } ${discountSuccess === product.id ? 'ring-2 ring-emerald-500' : ''}`}
                                    >
                                        {/* Product Info - Clickable */}
                                        <div
                                            className="flex items-start gap-4 mb-4 cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => navigate(`/product/${product.id}`)}
                                        >
                                            {product.images?.[0]?.url ? (
                                                <img
                                                    src={product.images[0].url}
                                                    alt={product.name}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <Tag size={24} className="text-gray-400" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate hover:text-emerald-600 transition-colors">{product.name}</h3>
                                                <p className="text-sm text-gray-500">{product.model}</p>
                                                <p className="text-xs text-emerald-600 mt-1">Click to view product →</p>
                                            </div>
                                        </div>

                                        {/* Price Info */}
                                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Original Price:</span>
                                                <span className={`font-medium ${product.discountRate ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                                    {formatCurrency(product.price)}
                                                </span>
                                            </div>
                                            {product.discountRate > 0 && (
                                                <>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <span className="text-sm text-emerald-600 font-medium">Discounted:</span>
                                                        <span className="font-bold text-emerald-600">
                                                            {formatCurrency(product.discountedPrice)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-center mt-2">
                                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                                            {product.discountRate}% OFF
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Discount Controls */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="relative flex-1">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        placeholder="Discount %"
                                                        value={discountRates[product.id] ?? (product.discountRate || '')}
                                                        onChange={(e) => handleDiscountRateChange(product.id, e.target.value)}
                                                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                    />
                                                    <Percent size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApplyDiscount(product.id)}
                                                    disabled={applyingDiscount === product.id}
                                                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    {applyingDiscount === product.id ? (
                                                        <RefreshCw size={14} className="animate-spin" />
                                                    ) : (
                                                        <Tag size={14} />
                                                    )}
                                                    Apply
                                                </button>
                                                {product.discountRate > 0 && (
                                                    <button
                                                        onClick={() => handleRemoveDiscount(product.id)}
                                                        disabled={applyingDiscount === product.id}
                                                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'revenue' && (
                    <>
                        {/* Revenue Date Range */}
                        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <BarChart3 size={20} />
                                        Revenue & Profit Chart
                                    </h2>
                                    <p className="text-gray-500 text-sm mt-1">
                                        View revenue, cost (50% of revenue), and profit by date range.
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={18} className="text-gray-400" />
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                        <span className="text-gray-500">to</span>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                    <button
                                        onClick={fetchRevenueStats}
                                        disabled={revenueLoading}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                    >
                                        <RefreshCw size={16} className={revenueLoading ? 'animate-spin' : ''} />
                                        Refresh
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Revenue Summary Cards */}
                        {revenueStats && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-100 rounded-lg">
                                            <DollarSign className="text-blue-600" size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Total Revenue</p>
                                            <p className="text-2xl font-bold text-blue-600">${revenueStats.totalRevenue?.toFixed(2) || '0.00'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-red-100 rounded-lg">
                                            <TrendingUp className="text-red-600" size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Total Cost (50%)</p>
                                            <p className="text-2xl font-bold text-red-600">${revenueStats.totalCost?.toFixed(2) || '0.00'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-emerald-100 rounded-lg">
                                            <TrendingUp className="text-emerald-600" size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Total Profit</p>
                                            <p className="text-2xl font-bold text-emerald-600">${revenueStats.totalProfit?.toFixed(2) || '0.00'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-purple-100 rounded-lg">
                                            <FileText className="text-purple-600" size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Orders</p>
                                            <p className="text-2xl font-bold text-purple-600">{revenueStats.orderCount || 0}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Revenue Chart */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h3 className="text-lg font-semibold mb-4">Daily Revenue & Profit</h3>
                            {revenueLoading ? (
                                <div className="h-80 flex items-center justify-center">
                                    <RefreshCw size={32} className="animate-spin text-emerald-500" />
                                </div>
                            ) : revenueStats?.dailyData?.length > 0 ? (
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={revenueStats.dailyData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            formatter={(value) => `$${value.toFixed(2)}`}
                                            labelFormatter={(label) => `Date: ${label}`}
                                        />
                                        <Legend />
                                        <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" />
                                        <Bar dataKey="cost" name="Cost (50%)" fill="#EF4444" />
                                        <Bar dataKey="profit" name="Profit" fill="#10B981" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-80 flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
                                        <p>No revenue data for selected date range.</p>
                                        <p className="text-sm">Try selecting a different date range.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>

            {/* Reject Refund Modal */}
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

export default SalesManagerDashboard;