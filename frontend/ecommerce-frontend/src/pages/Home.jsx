import { useState, useEffect } from 'react';
import { ArrowRight, ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { reviewService, productService, authService } from '../services/api';

const categories = [
  {
    id: 1,
    title: 'CASUAL',
    image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=800&q=80', // Man in blue shirt/baggy pants
    link: '/shop?category=casual'
  },
  {
    id: 2,
    title: 'STREETWEAR',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80', // Woman in grey sweats
    link: '/shop?category=streetwear'
  },
  {
    id: 3,
    title: 'PARTY',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80', // Fashion edgy look
    link: '/shop?category=party'
  }
];

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ))}
  </div>
);

const Home = () => {
  const [recentReviews, setRecentReviews] = useState([]);
  const [products, setProducts] = useState({});
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewerNames, setReviewerNames] = useState({});
  const [reviewerTypes, setReviewerTypes] = useState({});

  useEffect(() => {
    const fetchRecentReviews = async () => {
      try {
        const reviews = (await reviewService.getRecentReviews()) || [];

        // Fetch product names for reviews
        const productIds = [...new Set(reviews.map(r => r.productId))];
        const productData = {};
        for (const id of productIds) {
          try {
            const product = await productService.getProductById(id);
            productData[id] = product;
          } catch (e) {
            productData[id] = { name: `Product #${id}` };
          }
        }
        setProducts(productData);

        // Fetch reviewer names
        const uniqueUserIds = [...new Set(reviews.map((r) => r.userId).filter(Boolean))];
        if (uniqueUserIds.length > 0) {
          const nameEntries = await Promise.all(
            uniqueUserIds.map(async (uid) => {
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
          nameEntries.forEach(([uid, name, type]) => {
            nameMap[uid] = name;
            typeMap[uid] = type;
          });
          setReviewerNames(nameMap);
          setReviewerTypes(typeMap);
          setRecentReviews(reviews.filter((r) => typeMap[r.userId] !== 'PRODUCT_MANAGER'));
        } else {
          setRecentReviews(reviews);
        }
      } catch (error) {
        console.error('Error fetching recent reviews:', error);
        setRecentReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchRecentReviews();
  }, []);

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <div className="container mx-auto px-4 md:px-12 pb-20">

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative items-center">

          {categories.map((cat) => (
            <Link to={cat.link} key={cat.id} className="group block relative">

              {/* Image Container */}
              <div className="aspect-[3/4] w-full overflow-hidden rounded-t-xl bg-gray-200">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Label Box */}
              <div className="bg-white py-5 px-6 rounded-b-xl flex justify-between items-center shadow-sm group-hover:shadow-md transition-shadow">
                <span className="font-bold text-xl tracking-wide">{cat.title}</span>
                <ArrowRight className="w-6 h-6 text-black group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </Link>
          ))}

          {/* Floating Right Arrow (Decorative based on screenshot) */}
          <button className="absolute -right-6 top-1/2 -translate-y-1/2 hidden xl:flex bg-white p-3 rounded-full shadow-lg hover:bg-gray-50">
            <ChevronRight className="w-6 h-6" />
          </button>

        </div>

        {/* Recent Reviews Section */}
        {recentReviews.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8 tracking-tight">
              Customer Reviews
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentReviews.slice(0, 6).map((review) => (
                <Link
                  key={review.id}
                  to={`/product/${review.productId}`}
                  className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {products[review.productId]?.name || `Product #${review.productId}`}
                    </span>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    "{review.comment}"
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                    <span>
                      {reviewerNames[review.userId] ||
                        review.userName ||
                        review.username ||
                        review.reviewerName ||
                        review.reviewerFullName ||
                        (review.userId ? `User #${review.userId}` : 'User')}
                    </span>
                    <span>
                      {new Date(review.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Loading State for Reviews */}
        {loadingReviews && (
          <div className="mt-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
