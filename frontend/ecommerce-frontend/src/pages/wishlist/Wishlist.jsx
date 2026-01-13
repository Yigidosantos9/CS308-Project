import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag, Tag } from 'lucide-react';
import { wishlistService } from '../../services/api';
import { useShop } from '../../context/ShopContext';

const Wishlist = () => {
    const { user, addToCart } = useShop();
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addingToCart, setAddingToCart] = useState({});

    // Redirect support agents away from wishlist
    useEffect(() => {
        if (user?. userType === 'SUPPORT_AGENT') {
            navigate('/support/queue');
        }
    }, [user, navigate]);

    useEffect(() => {
        const loadWishlist = async () => {
            if (! user || user?. userType === 'SUPPORT_AGENT') {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await wishlistService.getWishlist();
                setWishlist(data);
            } catch (err) {
                console.error("Error loading wishlist:", err);
                setError("Failed to load wishlist. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        loadWishlist();
    }, [user]);

    const handleRemoveFromWishlist = async (productId) => {
        try {
            const updatedWishlist = await wishlistService.removeFromWishlist(productId);
            setWishlist(updatedWishlist);
        } catch (err) {
            console. error("Error removing from wishlist:", err);
            setError("Failed to remove item.  Please try again.");
        }
    };

    const handleAddToCart = async (item) => {
        const itemSize = item.size;

        if (item.product.stock === 0) {
            alert('This product is out of stock');
            return;
        }

        try {
            setAddingToCart(prev => ({ ...prev, [item.id]: true }));

            const productToAdd = {
                id: item.product.id,
                name: item.product.name,
                price: item.product. discountedPrice || item.product.price,
                stock: item.product.stock,
                images: item.product. images,
                brand: item.product. brand,
                selectedSize: itemSize
            };

            await addToCart(productToAdd, 1);
            alert('Added to cart successfully!');

        } catch (err) {
            console. error("Error adding to cart:", err);
            alert("Failed to add to cart. Please try again.");
        } finally {
            setAddingToCart(prev => ({ ...prev, [item.id]:  false }));
        }
    };

    // Helper function to check if product has a discount
    const hasDiscount = (product) => {
        return product.discountRate > 0 && product.discountedPrice && product.discountedPrice < product.price;
    };

    // Helper function to get display price
    const getDisplayPrice = (product) => {
        if (hasDiscount(product)) {
            return product.discountedPrice;
        }
        return product.price;
    };

    // Not logged in
    if (!user) {
        return (
            <div className="min-h-screen bg-[#F5F5F5] py-12 px-4 md:px-12">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mt-20">
                        <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h2 className="text-2xl font-bold mb-4">Please log in to view your wishlist</h2>
                        <Link to="/login" className="text-blue-500 underline">Go to Login</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F5F5] py-12 px-4 md:px-12">
            <div className="container mx-auto max-w-6xl">

                {/* Header */}
                <div className="flex justify-between items-end mb-8 border-b border-gray-300 pb-4">
                    <div>
                        <h1 className="text-3xl font-bold uppercase tracking-tight flex items-center gap-3">
                            <Heart className="w-8 h-8" /> My Wishlist
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {wishlist?. items?.length || 0} Items
                        </p>
                    </div>
                </div>

                {/* Content */}
                {loading ?  (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="aspect-[3/4] bg-gray-200 animate-pulse rounded-lg"></div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-gray-500">
                        <p>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 text-black underline hover:no-underline"
                        >
                            Try Again
                        </button>
                    </div>
                ) : !wishlist?. items || wishlist. items.length === 0 ? (
                    <div className="text-center mt-20">
                        <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h2 className="text-2xl font-bold mb-4">Your wishlist is empty. </h2>
                        <p className="text-gray-500 mb-4">Add items you love to your wishlist. </p>
                        <Link to="/shop" className="text-blue-500 underline">Go to Shop</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                        {wishlist.items. map((item) => (
                            <div key={item. id} className="group bg-white rounded-lg p-4 shadow-sm relative">
                                {/* Discount Badge */}
                                {hasDiscount(item. product) && (
                                    <div className="absolute top-2 right-2 z-10">
                                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                            <Tag size={12} />
                                            -{item.product.discountRate}%
                                        </span>
                                    </div>
                                )}

                                {/* Product Image */}
                                <Link to={`/product/${item.product. id}`}>
                                    <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-100 mb-4 relative">
                                        <img
                                            src={item. product.images && item.product.images. length > 0
                                                ? item.product.images[0]. url
                                                : "https://placehold.co/600x800/f5f5f5/a3a3a3? text=No+Image"}
                                            alt={item.product.name}
                                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                        />

                                        {/* Stock Badge */}
                                        {item. product.stock > 0 && item.product.stock < 5 && (
                                            <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded">
                                                Low Stock
                                            </span>
                                        )}
                                        {item. product.stock === 0 && (
                                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                                <span className="bg-black text-white text-xs font-bold px-3 py-1 uppercase">Out of Stock</span>
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                {/* Product Info */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <Link to={`/product/${item. product.id}`}>
                                            <h3 className="font-bold text-sm text-black group-hover:text-gray-600 transition-colors truncate">
                                                {item.product.name}
                                            </h3>
                                        </Link>
                                        <p className="text-xs text-gray-500 mt-1 uppercase">
                                            {item.product. brand || "RAWCTRL"}
                                        </p>
                                    </div>
                                    
                                    {/* Price Display with Discount Support */}
                                    <div className="text-right flex-shrink-0">
                                        {hasDiscount(item. product) ? (
                                            <div className="flex flex-col items-end">
                                                <span className="font-bold text-sm text-red-600">
                                                    ${item.product.discountedPrice?.toFixed(2)}
                                                </span>
                                                <span className="text-xs text-gray-400 line-through">
                                                    ${item.product.price?. toFixed(2)}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="font-medium text-sm">
                                                ${item.product.price?. toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Savings Badge */}
                                {hasDiscount(item.product) && (
                                    <div className="mb-3">
                                        <span className="inline-block bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded">
                                            You save ${(item.product.price - item.product.discountedPrice).toFixed(2)}
                                        </span>
                                    </div>
                                )}

                                {/* Selected Size Display */}
                                <div className="mb-4">
                                    <span className="text-xs text-gray-600">Size: </span>
                                    <span className="inline-block bg-black text-white text-xs font-bold px-3 py-1 rounded">
                                        {item.size || 'N/A'}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAddToCart(item)}
                                        disabled={item.product. stock === 0 || addingToCart[item.id]}
                                        className={`flex-1 text-xs font-bold py-3 px-3 rounded-md transition-colors flex items-center justify-center gap-2 ${item. product.stock === 0
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-black text-white hover:bg-gray-800 disabled:bg-gray-400'
                                            }`}
                                    >
                                        <ShoppingBag size={14} />
                                        {item.product. stock === 0
                                            ? 'Out of Stock'
                                            :  addingToCart[item.id]
                                                ? 'Adding...'
                                                : hasDiscount(item. product)
                                                    ? `Add to Cart - $${item.product.discountedPrice?.toFixed(2)}`
                                                    :  'Add to Cart'}
                                    </button>
                                    <button
                                        onClick={() => handleRemoveFromWishlist(item.product.id)}
                                        className="p-3 border border-gray-300 rounded-md hover: bg-red-50 hover:border-red-300 transition-colors"
                                        title="Remove from wishlist"
                                    >
                                        <Trash2 size={16} className="text-red-500" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;