import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { productService } from '../services/api';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useShop();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState('');

  // Helper to generate consistent mock images if no real image exists
  const getFallbackImages = (productId) => {
    // Curated sets of high-quality fashion images (3 images per set)
    const imageSets = [
      // Set 0: Leather/Urban (The original set)
      [
        "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1000&auto=format&fit=crop", // Front
        "https://images.unsplash.com/photo-1551028919-ac7bcb9916b9?q=80&w=1000&auto=format&fit=crop", // Side/Detail
        "https://images.unsplash.com/photo-1520975954732-35dd22299614?q=80&w=1000&auto=format&fit=crop"  // Lifestyle
      ],
      // Set 1: Denim/Casual
      [
        "https://images.unsplash.com/photo-1542272617-08f08630329e?q=80&w=1000&auto=format&fit=crop", // Denim Jacket
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1000&auto=format&fit=crop", // Full body
        "https://images.unsplash.com/photo-1475178626620-a4d074967452?q=80&w=1000&auto=format&fit=crop"  // Detail
      ],
      // Set 2: Minimalist/Coats
      [
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop", // Coat
        "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1000&auto=format&fit=crop", // Pose
        "https://images.unsplash.com/photo-1515347619252-60a6bf4fffce?q=80&w=1000&auto=format&fit=crop"  // Vibe
      ],
      // Set 3: Street/Active
      [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop", // Model
        "https://images.unsplash.com/photo-1483721310020-03333e577078?q=80&w=1000&auto=format&fit=crop", // Hoodie
        "https://images.unsplash.com/photo-1529139574466-a302c27e3844?q=80&w=1000&auto=format&fit=crop"  // Close up
      ]
    ];

    const selectedSet = imageSets[productId % imageSets.length];

    return selectedSet.map((url, index) => ({
      url: url,
      alt: `Product View ${index + 1}`
    }));
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productService.getProductById(id);

        // Transform backend data to match component expectation
        // If backend has imageUrl, use it. Otherwise use fallback.
        const images = data.imageUrl
          ? [{ url: data.imageUrl, alt: data.name }]
          : getFallbackImages(data.id);

        const transformedProduct = {
          ...data,
          // Default sizes/colors since backend doesn't seem to have them in Product.java yet (only ProductVariant)
          // For now, hardcoding or extracting from variants if available. 
          // Assuming variants might be loaded or we just show generic sizes.
          sizes: ["S", "M", "L", "XL"],
          colors: ["Standard"],
          images: images
        };

        setProduct(transformedProduct);
        setSelectedImage(images[0].url);
      } catch (err) {
        console.error("Failed to load product", err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  return (
    <div className="p-4 md:p-10 lg:p-20 min-h-screen bg-[#F5F5F5]">
      {/* Main Grid Container */}
      <div className="flex flex-col md:flex-row gap-10 max-w-7xl mx-auto">

        {/* LEFT: Thumbnails & Main Image */}
        <div className="flex-1 flex gap-6">

          {/* Vertical Thumbnails */}
          <div className="hidden md:flex flex-col gap-4 w-20">
            {product.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(img.url)}
                className={`w-full aspect-[3/4] overflow-hidden border-2 transition-all ${selectedImage === img.url ? "border-black" : "border-transparent"
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
              src={selectedImage}
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
              {product.sizes.map((size) => (
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
            {!selectedSize && (
              <p className="text-red-500 text-xs mt-2 hidden">Please select a size</p>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={() => addToCart({ ...product, selectedSize })}
            disabled={product.stock === 0}
            className={`w-48 py-3 px-8 text-sm font-bold uppercase tracking-wider shadow-lg transition-colors
              ${product.stock === 0
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
              }`}
          >
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed mt-4">
            {product.description}
          </p>
        </div>

      </div>
    </div>
  );
};

export default ProductDetails;