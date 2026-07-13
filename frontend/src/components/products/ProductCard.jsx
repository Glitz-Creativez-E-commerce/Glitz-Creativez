import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart, FiShoppingBag, FiStar } from 'react-icons/fi';
import placeholderImg from '../../assets/images/PNG.png';
import { addItem, openCart } from '../../store/slices/cartSlice';
import { addToast } from '../../store/slices/uiSlice';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { useToggleWishlistMutation } from '../../store/api/authApi';

const ProductCard = ({ product, index = 0, wishlist = [] }) => {
    const dispatch = useDispatch();
    const [isHovered, setIsHovered] = useState(false);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const [toggleWishlist] = useToggleWishlistMutation();

    const isInWishlist = wishlist?.some(item =>
        (typeof item === 'object' ? item._id : item) === product._id
    );

    const navigate = useNavigate();
    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            navigate('/auth');
            return;
        }

        dispatch(addItem({
            product: {
                _id: product._id,
                name: product.name,
                price: product.price,
                images: product.images,
            },
            quantity: 1,
        }));
        dispatch(openCart());
        dispatch(addToast({ type: 'success', message: `Added to bag` }));
    };

    const handleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            navigate('/auth');
            return;
        }
        try {
            await toggleWishlist(product._id).unwrap();
            if (isInWishlist) {
                dispatch(addToast({ type: 'info', message: 'Removed from wishlist' }));
            } else {
                dispatch(addToast({ type: 'success', message: 'Added to wishlist' }));
            }
        } catch {
            dispatch(addToast({ type: 'error', message: 'Failed to update wishlist' }));
        }
    };

    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="group relative h-full"
        >
            <Link to={`/products/${product._id}`} className="block h-full outline-none">
                <div className="card card-hover h-full flex flex-col relative overflow-hidden rounded-2xl group outline-none">
                    
                    {/* Image Section */}
                    <div className="relative aspect-square sm:aspect-[4/3] bg-light-bg overflow-hidden">
                        <img
                            src={product.images?.[0]?.startsWith('http') ? product.images[0] : (product.images?.[0] ? `http://localhost:5000${product.images[0]}` : placeholderImg)}
                            alt={product.name}
                            className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${product.stock <= 0 ? 'grayscale' : ''}`}
                            onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                        />

                        {/* Gradient Overlay for badges & heart */}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1.5 sm:gap-2">
                            {product.stock <= 0 ? (
                                <span className="badge bg-error-light text-error-dark border-error-light/50">
                                    Out of Stock
                                </span>
                            ) : product.featured ? (
                                <span className="badge bg-secondary-100 text-secondary-700 border-secondary-200">
                                    Best Selling
                                </span>
                            ) : null}
                        </div>

                        {/* Wishlist Heart Icon */}
                        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
                            <button
                                onClick={handleWishlist}
                                className={`p-2 backdrop-blur-md rounded-full shadow-soft transition-all duration-300 hover:scale-110 ${
                                    isInWishlist ? 'bg-primary-50 border border-primary-200' : 'bg-white/80 hover:bg-white border border-transparent hover:border-primary-100'
                                }`}
                                aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                            >
                                <FiHeart
                                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
                                        isInWishlist
                                        ? 'text-primary-500 fill-primary-500 scale-110'
                                        : 'text-gray-400'
                                    }`}
                                />
                            </button>
                        </div>
                        
                        {/* Mobile: Rating Badge on Image */}
                        {product.rating > 0 && (
                            <div className="sm:hidden absolute bottom-2 left-2">
                                <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm">
                                    <span className="text-[10px] font-bold text-gray-800">
                                        {product.rating.toFixed(1)}
                                    </span>
                                    <FiStar className="w-2.5 h-2.5 text-primary-500 fill-primary-500" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="p-3 sm:p-5 flex-1 flex flex-col relative bg-white">
                        <h3 className="text-base sm:text-lg font-bold text-gray-800 capitalize leading-tight line-clamp-1 sm:line-clamp-2 mb-1 group-hover:text-primary-600 transition-colors">
                            {product.name}
                        </h3>
                        
                        {product.rating > 0 && (
                            <div className="hidden sm:flex items-center gap-2 mb-3">
                                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-success-light text-success-dark rounded shadow-sm">
                                    <span className="text-[11px] font-bold leading-none">{product.rating}</span>
                                    <FiStar size={10} className="fill-current" />
                                </div>
                                <span className="text-[12px] text-gray-400 font-medium">
                                    ({product.numReviews?.toLocaleString() || 0})
                                </span>
                            </div>
                        )}

                        <div className="flex flex-col gap-4 mt-auto pt-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-lg sm:text-xl font-black text-gray-900">
                                    ₹{product.price?.toFixed(2)}
                                </span>

                                {product.originalPrice > product.price && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[12px] text-gray-400 line-through font-medium">
                                            ₹{product.originalPrice?.toFixed(0)}
                                        </span>
                                        <span className="text-[11px] font-bold text-success uppercase tracking-tight">
                                            ({discount}% OFF)
                                        </span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock <= 0}
                                className={`w-full py-2.5 rounded-xl font-bold transition-all duration-300 ${
                                    product.stock <= 0 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                                    : 'btn-primary'
                                }`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <FiShoppingBag size={18} />
                                    {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default ProductCard;
