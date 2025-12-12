import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { productService, reviewService, orderService, authService } from '../services/api';

const StarRating = ({ rating, onRate, interactive = false }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`text-2xl transition-colors ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            } ${star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'
            }`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

const ReviewCard = ({ review, reviewerNames }) => {
  const date = new Date(review.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const displayName =
    reviewerNames?.[review.userId] ||
    review.userName ||
    review.username ||
    review.reviewerName ||
    review.reviewerFullName ||
    (review.userId ? `User #${review.userId}` : 'User');
  const initials = displayName.trim().charAt(0).toUpperCase() || 'U';

  return (
    <div className="border-b border-gray-200 pb-4 last:border-none">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
            {initials}
          </div>
          <span className="font-semibold text-sm">{displayName}</span>
        </div>
        <span className="text-xs text-gray-500">{date}</span>
      </div>
      {review.rating != null && review.rating > 0 && (
        <StarRating rating={review.rating} />
      )}
      {review.comment && (
        <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
      )}
    </div>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart, user, cart } = useShop();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Calculate total quantity of this product already in cart (across all sizes)
  const getCartQuantityForProduct = (productId) => {
    return cart
      .filter(item => item.id === productId)
      .reduce((sum, item) => sum + (item.quantity || 1), 0);
  };

  // Review state
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, reviewCount: 0 });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [canReview, setCanReview] = useState(false); // User has DELIVERED order with this product
  const [reviewerNames, setReviewerNames] = useState({});
  const [reviewerTypes, setReviewerTypes] = useState({});
  const isProductManager = user?.userType === 'PRODUCT_MANAGER';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getProductById(id);
        setProduct(data);
        if (data?.images?.[0]?.url) {
          setSelectedImage(data.images[0].url);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const [reviewsData, statsData] = await Promise.all([
          reviewService.getProductReviews(id),
          reviewService.getProductReviewStats(id)
        ]);
        const safeReviews = reviewsData || [];
        setReviewStats(statsData || { averageRating: 0, reviewCount: 0 });

        // Fetch reviewer names for display, but tolerate failures
        const uniqueIds = Array.from(
          new Set(safeReviews.map((r) => r.userId).filter(Boolean))
        );
        if (uniqueIds.length > 0) {
          const entries = await Promise.all(
            uniqueIds.map(async (uid) => {
              try {
                const user = await authService.getUserById(uid);
                const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
                return [uid, fullName || user?.email || user?.username || `User #${uid}`, user?.userType];
              } catch {
                return [uid, `User #${uid}`, null];
              }
            })
          );
          const nameMap = {};
          const typeMap = {};
          entries.forEach(([uid, name, type]) => {
            nameMap[uid] = name;
            typeMap[uid] = type;
          });
          setReviewerNames((prev) => ({ ...prev, ...nameMap }));
          setReviewerTypes((prev) => ({ ...prev, ...typeMap }));
          const filteredReviews = safeReviews.filter((r) => typeMap[r.userId] !== 'PRODUCT_MANAGER');
          setReviews(filteredReviews);
        } else {
          setReviews(safeReviews);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews(safeReviews || []);
      }
    };

    // Check if user can review (has DELIVERED order with this product)
    const checkCanReview = async () => {
      console.log('checkCanReview called, user:', user);
      if (!user?.userId || isProductManager) {
        console.log('No userId, setting canReview to false');
        setCanReview(false);
        return;
      }
      try {
        console.log('Fetching orders for userId:', user.userId);
        const orders = await orderService.getOrders(user.userId);
        console.log('Orders received:', orders);
        console.log('Looking for productId:', parseInt(id));

        // Check if any DELIVERED order contains this product
        const hasDeliveredProduct = orders.some(
          (order) => {
            console.log('Checking order:', order.id, 'status:', order.status, 'items:', order.items);
            return order.status === 'DELIVERED' &&
              order.items?.some((item) => {
                console.log('Checking item productId:', item.productId, 'vs target:', parseInt(id));
                return item.productId === parseInt(id);
              });
          }
        );
        console.log('hasDeliveredProduct:', hasDeliveredProduct);
        setCanReview(hasDeliveredProduct);
      } catch (error) {
        console.error('Error checking order status:', error);
        setCanReview(false);
      }
    };

    if (id) {
      fetchProduct();
      fetchReviews();
      checkCanReview();
    }
  }, [id, user, isProductManager]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      setReviewError('Please login to submit a review');
      return;
    }

    if (isProductManager) {
      setReviewError('Product managers cannot submit reviews.');
      return;
    }

    // At least one of rating or comment must be provided
    const hasRating = newReview.rating > 0;
    const hasComment = newReview.comment.trim().length > 0;

    if (!hasRating && !hasComment) {
      setReviewError('Please provide at least a rating or a comment');
      return;
    }

    setReviewLoading(true);
    setReviewError('');

    try {
      // Build request - send null for empty fields
      const reviewRequest = {
        productId: parseInt(id),
        rating: hasRating ? newReview.rating : null,
        comment: hasComment ? newReview.comment.trim() : null
      };

      await reviewService.addReview(reviewRequest);

      // Show success message based on what was submitted
      let successMessage = '';
      if (hasRating && hasComment) {
        successMessage = 'Rating submitted! Your comment is pending approval.';
      } else if (hasRating) {
        successMessage = 'Rating submitted successfully!';
      } else {
        successMessage = 'Comment submitted! Pending Product Manager approval.';
      }
      alert(successMessage);

      // Refresh reviews after submission
      const [reviewsData, statsData] = await Promise.all([
        reviewService.getProductReviews(id),
        reviewService.getProductReviewStats(id)
      ]);
      setReviews(reviewsData || []);
      setReviewStats(statsData || { averageRating: 0, reviewCount: 0 });

      setNewReview({ rating: 0, comment: '' });
      setShowReviewForm(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      setReviewError(
        error.response?.data?.message ||
        'Failed to submit review. Please ensure you have purchased and received this product.'
      );
    } finally {
      setReviewLoading(false);
    }
  };

  const defaultImages = [
    { url: "https://placehold.co/600x800/f5f5f5/a3a3a3?text=No+Image", alt: "No Image Available" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  const displayProduct = product || {
    id: id,
    name: 'Product',
    price: 0,
    description: 'Loading...',
    stock: 0,
    sizes: ["S", "M", "L", "XL"],
    images: []
  };

  const images = displayProduct.images?.length > 0 ? displayProduct.images : defaultImages;
  const currentImage = selectedImage || images[0]?.url;

  // 🔥 Low-stock message logic
  const stock = displayProduct.stock ?? 0;
  let stockMessage = '';
  let stockClass = '';

  if (stock === 0) {
    stockMessage = 'Out of Stock';
    stockClass = 'text-red-600';
  } else if (stock > 0 && stock <= 3) {
    stockMessage = `Low stock – only ${stock} left`;
    stockClass = 'text-red-600';
  } else {
    stockMessage = `${stock} in stock`;
    stockClass = 'text-green-600';
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="p-4 md:p-10 lg:p-20">
        {/* Main Grid Container */}
        <div className="flex flex-col md:flex-row gap-10 max-w-7xl mx-auto">
          {/* LEFT: Thumbnails & Main Image */}
          <div className="flex-1 flex gap-6">
            {/* Vertical Thumbnails */}
            <div className="hidden md:flex flex-col gap-4 w-20">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-full aspect-[3/4] overflow-hidden border-2 transition-all ${currentImage === img.url ? 'border-black' : 'border-transparent'
                    }`}
                >
                  <img
                    src={img.url}
                    alt={img.alt || `View ${index + 1}`}
                    className="w-full h-full object-cover object-center hover:opacity-80 transition-opacity"
                  />
                </button>
              ))}
            </div>

            {/* Main Large Image */}
            <div className="flex-1 aspect-[3/4] bg-gray-100 relative overflow-hidden">
              <img
                src={currentImage}
                alt={displayProduct.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="md:w-1/3 flex flex-col gap-6 pt-4">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-black">
              {displayProduct.name}
            </h1>

            {/* Rating Badge */}
            {reviewStats.reviewCount > 0 && (
              <div className="flex items-center gap-2">
                <StarRating rating={Math.round(reviewStats.averageRating)} />
                <span className="text-sm text-gray-600">
                  ({reviewStats.averageRating.toFixed(1)}) • {reviewStats.reviewCount} reviews
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-2xl font-medium text-black">
                ${(displayProduct.price || 0).toFixed(2)}
              </span>
              <span className="text-xs text-gray-500 font-light">(Tax Included)</span>
            </div>

            {/* Stock Status with low-stock handling */}
            <div className={`text-sm font-semibold ${stockClass}`}>
              {stockMessage}
            </div>

            {/* Sizes */}
            <div>
              <div className="flex gap-3">
                {(displayProduct.sizes || ['S', 'M', 'L', 'XL']).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 flex items-center justify-center border border-black text-sm font-medium transition-colors ${selectedSize === size
                      ? 'bg-black text-white'
                      : 'bg-transparent text-black hover:bg-gray-100'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            {user?.userType !== 'PRODUCT_MANAGER' && displayProduct.stock > 0 && (() => {
              const inCartQuantity = getCartQuantityForProduct(displayProduct.id);
              const availableToAdd = displayProduct.stock - inCartQuantity;
              const maxQuantity = Math.max(0, availableToAdd);

              if (maxQuantity <= 0) {
                return (
                  <div className="text-sm text-red-600 font-medium">
                    All available stock is in your cart
                  </div>
                );
              }

              return (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center border border-black rounded-lg">
                    <button
                      onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                      disabled={selectedQuantity <= 1}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-bold"
                    >
                      −
                    </button>
                    <span className="w-12 text-center font-semibold text-lg">
                      {Math.min(selectedQuantity, maxQuantity)}
                    </span>
                    <button
                      onClick={() => setSelectedQuantity(Math.min(maxQuantity, selectedQuantity + 1))}
                      disabled={selectedQuantity >= maxQuantity}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">
                    ({inCartQuantity > 0 ? `${inCartQuantity} in cart, ` : ''}{maxQuantity} available)
                  </span>
                </div>
              );
            })()}

            {/* Add to Cart Button - Hidden for Product Manager */}
            {user?.userType !== 'PRODUCT_MANAGER' && (() => {
              const inCartQuantity = getCartQuantityForProduct(displayProduct.id);
              const availableToAdd = displayProduct.stock - inCartQuantity;
              const isDisabled = displayProduct.stock === 0 || availableToAdd <= 0;

              return (
                <button
                  onClick={() => {
                    const actualQty = Math.min(selectedQuantity, availableToAdd);
                    if (actualQty > 0) {
                      addToCart({ ...displayProduct, selectedSize }, actualQty);
                      setSelectedQuantity(1);
                    }
                  }}
                  disabled={isDisabled}
                  className={`w-48 py-3 px-8 text-sm font-bold uppercase tracking-wider shadow-lg transition-colors ${isDisabled
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800'
                    }`}
                >
                  {displayProduct.stock === 0 ? 'Out of Stock' : availableToAdd <= 0 ? 'Max in Cart' : `Add to Cart${selectedQuantity > 1 ? ` (${Math.min(selectedQuantity, availableToAdd)})` : ''}`}
                </button>
              );
            })()}
            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed mt-4">
              {displayProduct.description}
            </p>

            {/* Product Specifications */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Product Specifications</h3>
              <div className="flex flex-col gap-2 text-xs text-gray-600">
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-gray-400">Product ID:</span>
                  <span className="font-medium text-black">{displayProduct.id}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-gray-400">Model Code:</span>
                  <span className="font-medium text-black">{displayProduct.model || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-gray-400">Serial Number:</span>
                  <span className="font-medium text-black">{displayProduct.serialNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-gray-400">Brand:</span>
                  <span className="font-medium text-black">{displayProduct.brand || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-gray-400">Warranty:</span>
                  <span className="font-medium text-black">{displayProduct.warrantyStatus || 'N/A'}</span>
                </div>
                <div className="flex flex-col mt-1">
                  <span className="text-gray-400 mb-1">Distributor Info:</span>
                  <span className="font-medium text-black bg-gray-50 p-2 rounded text-[10px] leading-relaxed whitespace-pre-wrap border border-gray-100">
                    {displayProduct.distributorInfo || 'Information not available'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <div className="max-w-7xl mx-auto mt-16 border-t border-gray-300 pt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Customer Reviews ({reviewStats.reviewCount})
            </h2>
            {canReview ? (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                {showReviewForm ? 'Cancel' : 'Write a Review'}
              </button>
            ) : (
              user && (
                <span className="text-sm text-gray-500">
                  {isProductManager
                    ? 'Product managers cannot submit reviews.'
                    : 'You can review after ordering this product'}
                </span>
              )
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <form
              onSubmit={handleSubmitReview}
              className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200"
            >
              <h3 className="font-semibold mb-4">Your Review</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Rating <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  <StarRating
                    rating={newReview.rating}
                    onRate={(rating) => setNewReview({ ...newReview, rating })}
                    interactive
                  />
                  {newReview.rating > 0 && (
                    <button
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: 0 })}
                      className="text-xs text-gray-500 hover:text-red-500 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Rating submissions are displayed immediately.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Comment <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-black"
                  rows={4}
                  placeholder="Share your thoughts about this product..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  Comments require Product Manager approval before being displayed.
                </p>
              </div>

              {reviewError && (
                <p className="text-red-500 text-sm mb-4">{reviewError}</p>
              )}

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={reviewLoading || (newReview.rating === 0 && !newReview.comment.trim())}
                  className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
                </button>
                <span className="text-xs text-gray-500">
                  {newReview.rating > 0 && newReview.comment.trim()
                    ? 'Rating + Comment (comment needs approval)'
                    : newReview.rating > 0
                      ? 'Rating only (instant)'
                      : newReview.comment.trim()
                        ? 'Comment only (needs approval)'
                        : 'Enter rating or comment'}
                </span>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Note: You can only review products you have purchased and received.
              </p>
            </form>
          )}

          {/* Reviews List */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} reviewerNames={reviewerNames} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No reviews yet. Be the first to review this product!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
