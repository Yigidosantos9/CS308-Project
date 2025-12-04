import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { productService } from '../services/api';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1559551409-dadc959f76b8?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1520975954732-35dd22299614?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1514996937319-344454492b37?q=80&w=1000&auto=format&fit=crop',
];

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL'];

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useShop();

  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [sizeError, setSizeError] = useState(false);

  // Load product from backend
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await productService.getProductById(id);
        setProduct(data);

        const imgList = [];
        if (data.imageUrl) {
          imgList.push({ url: data.imageUrl, alt: data.name });
        }
        FALLBACK_IMAGES.forEach((url, idx) => {
          imgList.push({ url, alt: `${data.name || 'Product'} view ${idx + 1}` });
        });

        setImages(imgList);
        if (imgList[0]) {
          setSelectedImage(imgList[0].url);
        }
      } catch (err) {
        console.error('Failed to load product details', err);
        setError('Failed to load product. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setSizeError(false);
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (!selectedSize) {
      setSizeError(true);
      return;
    }

    try {
      setAdding(true);
      setError('');
      await addToCart({ ...product, selectedSize });
    } catch (err) {
      console.error('Failed to add to cart', err);
      const backendMessage =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null);
      const code = err.code || err?.response?.data?.error;

      if (code === 'out_of_stock') {
        setError('This product is out of stock and cannot be added to the cart.');
      } else {
        setError(backendMessage || 'Failed to add to cart. Please try again.');
      }
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-10 lg:p-20 min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading product...</div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="p-4 md:p-10 lg:p-20 min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600 text-sm">Please go back and try another product.</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const stock = product.stock ?? 0;
  const sizes =
    product.sizes && product.sizes.length > 0 ? product.sizes : DEFAULT_SIZES;

  return (
    <div className="p-4 md:p-10 lg:p-20 min-h-screen bg-[#F5F5F5]">
      <div className="flex flex-col md:flex-row gap-10 max-w-7xl mx-auto">
        {/* LEFT: Thumbnails & Main Image */}
        <div className="flex-1 flex gap-6">
          <div className="hidden md:flex flex-col gap-4 w-20">
            {images.map((img, index) => (
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

          <div className="flex-1 aspect-[3/4] bg-gray-100 relative overflow-hidden">
            {selectedImage && (
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            )}
          </div>
        </div>

        {/* RIGHT: Product Info */}
        <div className="md:w-1/3 flex flex-col gap-8 pt-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-black">
            {product.name}
          </h1>

          <div className="flex items-baseline gap-4">
            <span className="text-2xl font-medium text-black">
              {(product.price ?? 0).toFixed(2)} TL
            </span>
            <span className="text-xs text-gray-500 font-light">
              (Tax Included)
            </span>
          </div>

          <div>
            <div className="flex gap-3 flex-wrap">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size)}
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
            {sizeError && (
              <p className="text-red-500 text-xs mt-2">
                Please select a size before adding to cart.
              </p>
            )}
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={stock === 0 || adding}
            className={`w-48 py-3 px-8 text-sm font-bold uppercase tracking-wider shadow-lg transition-colors
              ${
                stock === 0 || adding
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
          >
            {stock === 0 ? 'Out of Stock' : adding ? 'Adding...' : 'Add to Cart'}
          </button>

          <p className="text-gray-600 text-sm leading-relaxed mt-4">
            {product.description || 'No description available for this product.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
