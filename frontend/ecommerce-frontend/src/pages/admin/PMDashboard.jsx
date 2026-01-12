import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, ChevronDown, FileText, XCircle, RotateCcw, LogOut, Star, MessageSquare, AlertCircle, Plus, Edit, Trash2, Box, FolderPlus, Tag } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { orderService, reviewService, productService, authService, refundService, categoryService } from '../../services/api';

const DEFAULT_PRODUCT_TYPES = ['TSHIRT', 'SHIRT', 'SWEATER', 'HOODIE', 'JACKET', 'COAT', 'PANTS', 'JEANS', 'SKIRT', 'DRESS', 'SHORTS', 'UNDERWEAR', 'ACCESSORY', 'SHOES'];
const TARGET_AUDIENCES = ['MEN', 'WOMEN', 'KIDS'];
const WARRANTY_STATUSES = ['NONE', 'LIMITED', 'STANDARD', 'EXTENDED'];
const SEASONS = ['SPRING', 'SUMMER', 'FALL', 'WINTER', 'ALL_SEASON'];
const FITS = ['REGULAR', 'SLIM', 'OVERSIZE', 'LOOSE'];

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

    // Product management state
    const [products, setProducts] = useState([]);
    const [productModalOpen, setProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productFormData, setProductFormData] = useState({
        name: '', price: '', stock: '', model: '', serialNumber: '', description: '',
        brand: '', productType: 'TSHIRT', targetAudience: 'MEN', warrantyStatus: 'NONE',
        distributorInfo: '', season: '', fit: '', material: '', careInstructions: '', imageUrls: []
    });
    const [savingProduct, setSavingProduct] = useState(false);
    const [stockEditId, setStockEditId] = useState(null);
    const [stockEditValue, setStockEditValue] = useState('');

    // Delete validation state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    // Category management state
    const [categories, setCategories] = useState([]);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // Toast notification state
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        // Longer timeout for errors so users can read them
        const timeout = type === 'error' ? 8000 : 4000;
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), timeout);
    };

    useEffect(() => {
        // Check if user is product manager OR sales manager
        if (!user || (user.userType !== 'PRODUCT_MANAGER' && user.userType !== 'SALES_MANAGER')) {
            navigate('/');
            return;
        }
        fetchOrders();
        fetchPendingReviews();
        fetchPendingRefunds();
        fetchProducts();
        fetchCategories();
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

    // ==================== PRODUCT MANAGEMENT ====================
    const fetchProducts = async () => {
        try {
            const data = await productService.getProducts();
            setProducts(data || []);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await categoryService.getCategories();
            if (Array.isArray(data) && data.length > 0) {
                // Determine if data is strings or objects
                if (typeof data[0] === 'string') {
                    // Convert old string categories to objects for compatibility if necessary
                    // But backend is updated to return objects now.
                    // Fallback just in case backend revert didn't work or whatever.
                    setCategories(data.map(name => ({ id: Math.random(), name })));
                } else {
                    setCategories(data);
                }
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            // Fallback to defaults if fetch fails? No, better to show empty or error
        }
    };

    const openAddProductModal = () => {
        setEditingProduct(null);
        setProductFormData({
            name: '', price: '', stock: '', model: '', serialNumber: '', description: '',
            brand: '', productType: 'TSHIRT', targetAudience: 'MEN', warrantyStatus: 'NONE',
            distributorInfo: '', season: '', fit: '', material: '', careInstructions: '', imageUrls: []
        });
        setProductModalOpen(true);
    };

    const openEditProductModal = (product) => {
        setEditingProduct(product);
        setProductFormData({
            name: product.name || '',
            price: product.price?.toString() || '',
            stock: product.stock?.toString() || '',
            model: product.model || '',
            serialNumber: product.serialNumber || '',
            description: product.description || '',
            brand: product.brand || '',
            productType: product.productType || 'TSHIRT',
            targetAudience: product.targetAudience || 'MEN',
            warrantyStatus: product.warrantyStatus || 'NONE',
            distributorInfo: product.distributorInfo || '',
            season: product.season || '',
            fit: product.fit || '',
            material: product.material || '',
            careInstructions: product.careInstructions || '',
            imageUrls: product.images?.map(img => img.url) || []
        });
        setProductModalOpen(true);
    };

    const handleProductFormChange = (e) => {
        const { name, value } = e.target;
        setProductFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProduct = async () => {
        if (savingProduct) return;
        setSavingProduct(true);
        try {
            const payload = {
                ...productFormData,
                price: parseFloat(productFormData.price),
                stock: parseInt(productFormData.stock, 10),
                season: productFormData.season || null,
                fit: productFormData.fit || null
            };
            if (editingProduct) {
                await productService.updateProduct(editingProduct.id, payload);
                showToast('Product updated successfully!', 'success');
            } else {
                await productService.addProduct(payload);
                showToast('Product added successfully!', 'success');
            }
            setProductModalOpen(false);
            fetchProducts();
        } catch (error) {
            console.error('Failed to save product:', error);
            showToast('Failed to save product: ' + (error.response?.data?.message || error.message), 'error');
        } finally {
            setSavingProduct(false);
        }
    };

    const handleDeleteProduct = (productId) => {
        const product = products.find(p => p.id === productId);
        setProductToDelete(product);
        setDeleteModalOpen(true);
    };

    const confirmDeleteProduct = async () => {
        if (!productToDelete) return;
        try {
            await productService.deleteProduct(productToDelete.id);
            showToast('Product deleted successfully!', 'success');
            setDeleteModalOpen(false);
            setProductToDelete(null);
            fetchProducts();
        } catch (error) {
            console.error('Failed to delete product:', error);
            showToast('Failed to delete product: ' + (error.response?.data?.message || error.message), 'error');
        }
    };

    const handleStockUpdate = async (productId) => {
        const quantity = parseInt(stockEditValue, 10);
        if (isNaN(quantity) || quantity < 0) {
            showToast('Please enter a valid stock quantity', 'error');
            return;
        }
        try {
            await productService.updateStock(productId, quantity);
            setStockEditId(null);
            setStockEditValue('');
            fetchProducts();
            showToast('Stock updated successfully!', 'success');
        } catch (error) {
            console.error('Failed to update stock:', error);
            showToast('Failed to update stock', 'error');
        }
    };

    // ==================== CATEGORY MANAGEMENT ====================
    const handleAddCategory = async () => {
        const categoryName = newCategoryName.trim();
        if (!categoryName) {
            showToast('Please enter a category name', 'error');
            return;
        }

        try {
            const newCategory = await categoryService.addCategory(categoryName);
            setCategories([...categories, newCategory]);
            setNewCategoryName('');
            setCategoryModalOpen(false);
            showToast(`Category "${categoryName}" added successfully!`, 'success');
        } catch (error) {
            console.error('Failed to add category:', error);
            showToast(error.response?.data?.error || 'Failed to add category', 'error');
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        try {
            await categoryService.deleteCategory(categoryId);
            setCategories(categories.filter(c => c.id !== categoryId));
            showToast('Category deleted successfully', 'success');
        } catch (error) {
            console.error('Failed to delete category:', error);
            showToast('Failed to delete category', 'error');
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            fetchOrders();
            showToast(`Order status updated to ${newStatus}`, 'success');
        } catch (error) {
            console.error('Failed to update order status:', error);
            showToast('Failed to update order status', 'error');
        }
    };

    const handleApproveReview = async (reviewId) => {
        try {
            await reviewService.approveReview(reviewId);
            fetchPendingReviews();
            showToast('Review approved successfully!', 'success');
        } catch (error) {
            console.error('Failed to approve review:', error);
            showToast('Failed to approve review', 'error');
        }
    };

    const handleDisapproveReview = async (reviewId) => {
        try {
            await reviewService.disapproveReview(reviewId);
            fetchPendingReviews();
            showToast('Review rejected', 'success');
        } catch (error) {
            console.error('Failed to disapprove review:', error);
            showToast('Failed to disapprove review', 'error');
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
            fetchOrders();
            showToast('Refund request rejected. Customer notified.', 'success');
        } catch (error) {
            console.error('Failed to reject refund:', error);
            showToast('Failed to reject refund: ' + (error.response?.data?.message || error.message), 'error');
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
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${activeTab === 'products'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-gray-700 border border-indigo-300'
                            }`}
                    >
                        <Box className="h-4 w-4" />
                        Products ({products.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${activeTab === 'categories'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-700 border border-purple-300'
                            }`}
                    >
                        <FolderPlus className="h-4 w-4" />
                        Categories ({categories.length})
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

                {/* Products Management Tab */}
                {activeTab === 'products' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Product Management</h2>
                            <button
                                onClick={openAddProductModal}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                            >
                                <Plus className="h-4 w-4" />
                                Add Product
                            </button>
                        </div>

                        {products.length === 0 ? (
                            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
                                <Box className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No products yet</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Product</th>
                                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Category</th>
                                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Price</th>
                                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Stock</th>
                                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {products.map(product => (
                                            <tr key={product.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {product.images?.[0]?.url ? (
                                                            <img src={product.images[0].url} alt={product.name} className="w-10 h-10 rounded object-cover" />
                                                        ) : (
                                                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                                                <Package className="h-5 w-5 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-medium">{product.name}</p>
                                                            <p className="text-xs text-gray-500">{product.brand || 'No brand'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {product.productType?.replace('_', ' ')}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {product.discountedPrice ? (
                                                        <div>
                                                            <span className="font-medium text-green-600">${product.discountedPrice.toFixed(2)}</span>
                                                            <span className="text-xs text-gray-400 line-through ml-1">${product.price?.toFixed(2)}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="font-medium">${product.price?.toFixed(2)}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {stockEditId === product.id ? (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                value={stockEditValue}
                                                                onChange={(e) => setStockEditValue(e.target.value)}
                                                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                                                min="0"
                                                            />
                                                            <button
                                                                onClick={() => handleStockUpdate(product.id)}
                                                                className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() => { setStockEditId(null); setStockEditValue(''); }}
                                                                className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => { setStockEditId(product.id); setStockEditValue(product.stock?.toString() || '0'); }}
                                                            className={`px-2 py-1 rounded text-sm font-medium ${product.stock <= 0 ? 'bg-red-100 text-red-700' :
                                                                product.stock <= 10 ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-green-100 text-green-700'
                                                                } hover:opacity-80 transition`}
                                                        >
                                                            {product.stock} in stock
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => openEditProductModal(product)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                            title="Edit Product"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(product.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                            title="Delete Product"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Product Add/Edit Modal */}
            {productModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl my-8">
                        <h3 className="text-xl font-bold mb-4">
                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </h3>

                        <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={productFormData.name}
                                    onChange={handleProductFormChange}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={productFormData.price}
                                    onChange={handleProductFormChange}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={productFormData.stock}
                                    onChange={handleProductFormChange}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                    min="0"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                                <input
                                    type="text"
                                    name="model"
                                    value={productFormData.model}
                                    onChange={handleProductFormChange}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number *</label>
                                <input
                                    type="text"
                                    name="serialNumber"
                                    value={productFormData.serialNumber}
                                    onChange={handleProductFormChange}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={productFormData.brand}
                                    onChange={handleProductFormChange}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                <div className="flex gap-2">
                                    <select
                                        name="productType"
                                        value={productFormData.productType}
                                        onChange={handleProductFormChange}
                                        className="flex-1 border border-gray-300 rounded-lg p-2 text-sm"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.name}>{cat.name.replace('_', ' ')}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setCategoryModalOpen(true)}
                                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                                        title="Add New Category"
                                    >
                                        <FolderPlus className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience *</label>
                                <select
                                    name="targetAudience"
                                    value={productFormData.targetAudience}
                                    onChange={handleProductFormChange}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                >
                                    {TARGET_AUDIENCES.map(aud => (
                                        <option key={aud} value={aud}>{aud}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Warranty *</label>
                                <select
                                    name="warrantyStatus"
                                    value={productFormData.warrantyStatus}
                                    onChange={handleProductFormChange}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                >
                                    {WARRANTY_STATUSES.map(w => (
                                        <option key={w} value={w}>{w.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
                                <select
                                    name="season"
                                    value={productFormData.season}
                                    onChange={handleProductFormChange}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                >
                                    <option value="">Select season</option>
                                    {SEASONS.map(s => (
                                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fit</label>
                                <select
                                    name="fit"
                                    value={productFormData.fit}
                                    onChange={handleProductFormChange}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                >
                                    <option value="">Select fit</option>
                                    {FITS.map(f => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                                <input
                                    type="text"
                                    name="material"
                                    value={productFormData.material}
                                    onChange={handleProductFormChange}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Distributor Info *</label>
                                <input
                                    type="text"
                                    name="distributorInfo"
                                    value={productFormData.distributorInfo}
                                    onChange={handleProductFormChange}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                    required
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                                <textarea
                                    name="description"
                                    value={productFormData.description}
                                    onChange={handleProductFormChange}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                    rows={3}
                                    required
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Care Instructions</label>
                                <textarea
                                    name="careInstructions"
                                    value={productFormData.careInstructions}
                                    onChange={handleProductFormChange}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                    rows={2}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
                                <div className="space-y-3">
                                    {/* Existing images */}
                                    {(productFormData.imageUrls || []).length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {productFormData.imageUrls.map((url, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={url}
                                                        alt={`Product ${index + 1}`}
                                                        className="w-20 h-20 object-cover rounded-lg border"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newUrls = productFormData.imageUrls.filter((_, i) => i !== index);
                                                            setProductFormData(prev => ({ ...prev, imageUrls: newUrls }));
                                                        }}
                                                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* File upload */}
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={async (e) => {
                                                const files = Array.from(e.target.files || []);
                                                for (const file of files) {
                                                    try {
                                                        showToast(`Uploading ${file.name}...`, 'success');
                                                        const result = await productService.uploadImage(file);
                                                        if (result.url) {
                                                            setProductFormData(prev => ({
                                                                ...prev,
                                                                imageUrls: [...(prev.imageUrls || []), result.url]
                                                            }));
                                                            showToast(`Image uploaded successfully!`, 'success');
                                                        }
                                                    } catch (error) {
                                                        showToast(`Failed to upload ${file.name}`, 'error');
                                                    }
                                                }
                                                e.target.value = '';
                                            }}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label htmlFor="image-upload" className="cursor-pointer">
                                            <div className="text-gray-500">
                                                <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="mt-1 text-sm">Click to upload images</p>
                                                <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleSaveProduct}
                                disabled={savingProduct}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {savingProduct ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                            </button>
                            <button
                                onClick={() => setProductModalOpen(false)}
                                disabled={savingProduct}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
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

            {/* Categories Tab Content */}
            {activeTab === 'categories' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-purple-200 overflow-hidden">
                        <div className="p-6 border-b border-purple-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-800">Category Management</h3>
                            <button
                                onClick={() => setCategoryModalOpen(true)}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add New Category
                            </button>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {categories.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <FolderPlus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <p>No categories found. Start by adding one!</p>
                                </div>
                            ) : (
                                categories.map((cat) => (
                                    <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                                                <Tag className="h-5 w-5" />
                                            </div>
                                            <span className="font-medium text-gray-700">{cat.name.replace('_', ' ')}</span>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteCategory(cat.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                            title="Delete Category"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && productToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 p-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Product?</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Are you sure you want to delete <span className="font-semibold text-gray-800">"{productToDelete.name}"</span>?
                                This action cannot be undone.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setDeleteModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDeleteProduct}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Category Modal */}
            {categoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <FolderPlus className="h-5 w-5 text-indigo-600" />
                            Add New Category
                        </h2>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="e.g., POLO_SHIRT"
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Category will be converted to uppercase. Spaces will become underscores.
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Existing Categories ({categories.length})
                            </label>
                            <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                                <div className="flex flex-wrap gap-1">
                                    {categories.map(cat => (
                                        <span key={cat.id} className="px-2 py-1 bg-gray-100 rounded text-xs">
                                            {cat.name.replace('_', ' ')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleAddCategory}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                            >
                                Add Category
                            </button>
                            <button
                                onClick={() => {
                                    setCategoryModalOpen(false);
                                    setNewCategoryName('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
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