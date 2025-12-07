import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { productService, reviewService, orderService } from '../services/api';

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

const ReviewCard = ({ review }) => {
  const date = new Date(review.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="border-b border-gray-200 pb-4 last:border-none">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
            U
          </div>
          <span className="font-semibold text-sm">User #{review.userId}</span>
        </div>
        <span className="text-xs text-gray-500">{date}</span>
      </div>
      <StarRating rating={review.rating} />
      <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
    </div>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart, user } = useShop();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);

  // Review state
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, reviewCount: 0 });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [canReview, setCanReview] = useState(false); // User has DELIVERED order with this product

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
        setReviews(reviewsData || []);
        setReviewStats(statsData || { averageRating: 0, reviewCount: 0 });
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    // Check if user can review (has DELIVERED order with this product)
    const checkCanReview = async () => {
      if (!user?.userId) {
        setCanReview(false);
        return;
      }
      try {
        const orders = await orderService.getOrders(user.userId);
        // Check if any DELIVERED order contains this product
        const hasDeliveredProduct = orders.some(order =>
          order.status === 'DELIVERED' &&
          order.items?.some(item => item.productId === parseInt(id))
        );
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
  }, [id, user]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      setReviewError('Please login to submit a review');
      return;
    }
    if (newReview.rating === 0) {
      setReviewError('Please select a rating');
      return;
    }
    if (!newReview.comment.trim()) {
      setReviewError('Please enter a comment');
      return;
    }

    setReviewLoading(true);
    setReviewError('');

    try {
      await reviewService.addReview({
        productId: parseInt(id),
        rating: newReview.rating,
        comment: newReview.comment
      });

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
      setReviewError(error.response?.data?.message || 'Failed to submit review. Please ensure you have purchased and received this product.');
    } finally {
      setReviewLoading(false);
    }
  };

  // Default product images for demo
  const defaultImages = [
    { url: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1000&auto=format&fit=crop", alt: "Front View" },
    { url: "https://images.unsplash.com/photo-1559551409-dadc959f76b8?q=80&w=1000&auto=format&fit=crop", alt: "Detail View" },
    { url: "https://images.unsplash.com/photo-1520975954732-35dd22299614?q=80&w=1000&auto=format&fit=crop", alt: "Lifestyle View" }
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
    name: "Product",
    price: 0,
    description: "Loading...",
    stock: 0,
    sizes: ["S", "M", "L", "XL"],
    images: defaultImages
  };

  const images = displayProduct.images?.length > 0 ? displayProduct.images : defaultImages;
  const currentImage = selectedImage || images[0]?.url;

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
                  className={`w-full aspect-[3/4] overflow-hidden border-2 transition-all ${currentImage === img.url ? "border-black" : "border-transparent"
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
              <span className="text-xs text-gray-500 font-light">
                (Tax Included)
              </span>
            </div>

            {/* Stock Status */}
            <div className={`text-sm font-semibold ${displayProduct.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {displayProduct.stock > 0 ? `${displayProduct.stock} in stock` : 'Out of Stock'}
            </div>

            {/* Sizes */}
            <div>
              <div className="flex gap-3">
                {(displayProduct.sizes || ["S", "M", "L", "XL"]).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 flex items-center justify-center border border-black text-sm font-medium transition-colors
                      ${selectedSize === size
                        ? "bg-black text-white"
                        : "bg-transparent text-black hover:bg-gray-100"
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart Button - Hidden for Product Manager */}
            {user?.userType !== 'PRODUCT_MANAGER' && (
              <button
                onClick={() => addToCart({ ...displayProduct, selectedSize })}
                disabled={displayProduct.stock === 0}
                className={`w-48 py-3 px-8 text-sm font-bold uppercase tracking-wider shadow-lg transition-colors
                  ${displayProduct.stock === 0
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800"
                  }`}
              >
                {displayProduct.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
            )}

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed mt-4">
              {displayProduct.description}
            </p>
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
            ) : user && (
              <span className="text-sm text-gray-500">
                You can review after ordering this product
              </span>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold mb-4">Your Review</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Rating</label>
                <StarRating
                  rating={newReview.rating}
                  onRate={(rating) => setNewReview({ ...newReview, rating })}
                  interactive
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Comment</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-black"
                  rows={4}
                  placeholder="Share your thoughts about this product..."
                />
              </div>

              {reviewError && (
                <p className="text-red-500 text-sm mb-4">{reviewError}</p>
              )}

              <button
                type="submit"
                disabled={reviewLoading}
                className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {reviewLoading ? 'Submitting...' : 'Submit Review'}
              </button>

              <p className="text-xs text-gray-500 mt-2">
                Note: You can only review products you have purchased and received.
              </p>
            </form>
          )}

          {/* Reviews List */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
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