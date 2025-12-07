import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const ProductCard = ({ product }) => {
  // Helper: Use backend image if available, otherwise generate a consistent mock
  const getImage = () => {
    if (product.imageUrl) return product.imageUrl;

    const images = [
      "https://images.unsplash.com/photo-1551028919-ac7bcb9916b9?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515347619252-60a6bf4fffce?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=800&auto=format&fit=crop"
    ];
    return images[product.id % images.length];
  };

  return (
    <Link to={`/product/${product.id}`} className="group block">
      {/* Image Container */}
      <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-100 mb-4 relative">
        <img
          src={getImage()}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Stock Logic based on your Product.java 'stock' field */}
        {product.stock > 0 && product.stock < 5 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
            Low Stock
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-black text-white text-xs font-bold px-3 py-1 uppercase">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-sm text-black group-hover:text-gray-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1 uppercase">
            {product.brand || "RAWCTRL"}
          </p>
        </div>
        <p className="font-medium text-sm">
          ${product.price?.toFixed(2)}
        </p>
      </div>
    </Link>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number,
    stock: PropTypes.number,
    brand: PropTypes.string,
    imageUrl: PropTypes.string, // Added support for this
  }).isRequired,
};

export default ProductCard;