import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useShop();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState('');

  // Updated Mock Data with reliable Leather Jacket images
  const product = {
    id: 1,
    name: "Tyler Durden Ceketi.",
    price: 599.90,
    originalPrice: 599.90,
    description: "The iconic leather jacket featuring distinctive details and a slim fit cut. Perfect for a rebellious streetwear look.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Brown"],
    images: [
      {
        // Main: Man in leather jacket (Front/Side pose)
        url: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1000&auto=format&fit=crop",
        alt: "Front View"
      },
      {
        // Detail: Close up of leather texture/zipper
        url: "https://images.unsplash.com/photo-1559551409-dadc959f76b8?q=80&w=1000&auto=format&fit=crop",
        alt: "Detail View" 
      },
      {
        // Detail: Texture close-up
        url: "https://images.unsplash.com/photo-1559551409-dadc959f76b8?q=80&w=1000&auto=format&fit=crop",
        alt: "Detail View"
      },
      {
        // Back/Lifestyle: Model sitting
        url: "https://images.unsplash.com/photo-1520975954732-35dd22299614?q=80&w=1000&auto=format&fit=crop",
        alt: "Lifestyle View"
      }
    ]
  };

  useEffect(() => {
    if (product) {
      setSelectedImage(product.images[0].url);
    }
  }, []);

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
                className={`w-full aspect-[3/4] overflow-hidden border-2 transition-all ${
                  selectedImage === img.url ? "border-black" : "border-transparent"
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
              {product.price.toFixed(2)} TL
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
            className="w-48 bg-black text-white py-3 px-8 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors shadow-lg"
          >
            Add to Cart
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