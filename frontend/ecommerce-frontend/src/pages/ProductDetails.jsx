// frontend/src/pages/ProductDetails.jsx
import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { productService } from '../services/api';

// Fallback images (since backend doesn't provide image URLs)
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1559551409-dadc959f76b8?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1559551409-dadc959f76b8?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1520975954732-35dd22299614?q=80&w=1000&auto=format&fit=crop",
];

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useShop();

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // If later you store sizes per product in backend, wire them here.
  const availableSizes = useMemo(
    () => ['S', 'M', 'L', 'XL'],
    []
  );

  // Derive image list for gallery (backend has no images → use fallbacks)
  const galleryImages = useMemo(() => {
    return FALLBACK_IMAGES.map((url, idx) => ({
      url,
      alt: `Product image ${idx + 1}`,
    }));
  }, []);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getProductById(id);
        setProduct(data);
        // Default to first image
        if (galleryImages.length > 0) {
          setSelectedImage(galleryImages[0].url);
        }
      } catch (err) {
        console.error('Failed to load product', err);
        setError('Failed to load product. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id, galleryImages]);

  const handleAddToCart = () => {
    if (!product) return;

    if (!selectedSize) {
      alert('Please select a size before adding to cart.');
      return;
    }

    // Pass product + selectedSize to context (context will call backend)
    addToCart({
      ...product,
      selectedSize,
    });
  };

  if (loading) {
    return (
      <div className="p-4 md:p-10 lg:p-20 min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <p className="text-gray-600">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-4 md:p-10 lg:p-20 min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <p className="text-gray-600">{error || 'Product not found.'}</p>
      </div>
    );
  }

  const isOutOfStock =
    typeof product.stock === 'number' ? product.stock === 0 : false;

  return (
    <div className="p-4 md:p-10 lg:p-20 min-h-screen bg-[#F5F5F5]">
      {/* Main Grid Container */}
      <div className="flex flex-col md:flex-row gap-10 max-w-7xl mx-auto">
        
        {/* LEFT: Thumbnails & Main Image */}
        <div className="flex-1 flex gap-6">
          
          {/* Vertical Thumbnails */}
          <div className="hidden md:flex flex-col gap-4 w-20">
            {galleryImages.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(img.url)}
                className={`w-full aspect-[3/4] overflow-hidden border-2 transition-all ${
                  selectedImage === img.url ? 'border-black' : 'border-transparent'
                }`}
              >
                <img 
                  src={img.url} 
                  alt={img.alt} 
                  className="w-full h-full object-cover object-center hover:opacity-80 transition-opacity"
                />
              </button>
            ))}
          </div>

          {/* Main Large Image */}
          <div className="flex-1 aspect-[3/4] bg-gray-100 relative overflow-hidden">
            <img 
              src={selectedImage || galleryImages[0]?.url} 
              alt={product.name} 
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>

        {/* RIGHT: Product Info */}
        <div className="md:w-1/3 flex flex-col gap-8 pt-4">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-black">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-4">
            <span className="text-2xl font-medium text-black">
              {product.price?.toFixed(2)} TL
            </span>
            <span className="text-xs text-gray-500 font-light">
              (Tax Included)
            </span>
          </div>

          {/* Sizes */}
          <div>
            <div className="flex gap-3">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 flex items-center justify-center border border-black text-sm font-medium transition-colors
                    ${
                      selectedSize === size
                        ? 'bg-black text-white'
                        : 'bg-transparent text-black hover:bg-gray-100'
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {!selectedSize && (
              <p className="text-red-500 text-xs mt-2">
                Please select a size
              </p>
            )}
          </div>

          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-48 py-3 px-8 text-sm font-bold uppercase tracking-wider shadow-lg transition-colors
              ${
                isOutOfStock
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed mt-4">
            {product.description || 'No description available for this product.'}
          </p>
        </div>

      </div>
    </div>
  );
};

export default ProductDetails;
