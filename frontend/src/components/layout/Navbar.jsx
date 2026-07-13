import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import {
    FiShoppingCart,
    FiHeart,
    FiUser,
    FiSearch,
    FiMenu,
    FiX,
    FiLogOut,
    FiGift,
    FiBell,
    FiPackage,
} from 'react-icons/fi';
import logoImg from '../../assets/images/PNG.png';
import { selectCartItemsCount, openCart } from '../../store/slices/cartSlice';
import { selectCurrentUser, logout } from '../../store/slices/authSlice';
import { useGetWishlistQuery } from '../../store/api/authApi';


const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Secret Admin Login State
    const [clickCount, setClickCount] = useState(0);
    const [clickTimer, setClickTimer] = useState(null);

    const handleLogoClick = (e) => {
        setClickCount(prev => prev + 1);

        if (clickTimer) {
            clearTimeout(clickTimer);
        }

        const timer = setTimeout(() => {
            setClickCount(0);
        }, 2000);
        setClickTimer(timer);
    };

    useEffect(() => {
        if (clickCount >= 3) {
            setClickCount(0);
            if (clickTimer) clearTimeout(clickTimer);
            navigate('/admin/auth');
        }
    }, [clickCount, clickTimer, navigate]);

    const cartItemsCount = useSelector(selectCartItemsCount);
    const user = useSelector(selectCurrentUser);

    const { data: wishlistData } = useGetWishlistQuery(undefined, {
        skip: !user,
    });

    const wishlistCount = wishlistData?.data?.length || 0;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
            setIsSearchOpen(false);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Shop Gifts', path: '/products' },
        { name: 'Categories', path: '/products?view=categories' },
    ];

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={`
                    fixed top-0 left-0 right-0 z-50 transition-all duration-300
                    ${isScrolled 
                        ? 'bg-white/85 blur-backdrop shadow-soft-lg border-b border-primary-100/50' 
                        : 'bg-white/60 blur-backdrop border-b border-transparent'
                    }
                `}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Desktop Layout */}
                    <div className="hidden md:flex items-center justify-between h-20 gap-8">
                        {/* Logo & Nav Links */}
                        <div className="flex items-center gap-8">
                            <Link to="/" className="flex items-center">
                                <motion.div whileHover={{ scale: 1.05 }} onClick={handleLogoClick}>
                                    <img src={logoImg} alt="Glitz Creativez" className="h-16 w-auto" />
                                </motion.div>
                            </Link>

                            <div className="hidden lg:flex items-center gap-6">
                                {navLinks.map((link) => (
                                    <Link 
                                        key={link.name} 
                                        to={link.path}
                                        className="text-gray-600 font-medium hover:text-primary-500 transition-colors relative group"
                                    >
                                        {link.name}
                                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-400 to-accent-gold transition-all duration-300 group-hover:w-full rounded-full"></span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Search Bar - Center/Right */}
                        <div className="flex-1 max-w-md">
                            <form onSubmit={handleSearch} className="relative group">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for the perfect gift..."
                                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border-2 border-gray-100 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-300 focus:bg-white focus:ring-4 focus:ring-primary-400/10 transition-all shadow-inner"
                                />
                            </form>
                        </div>

                        {/* Right Icons */}
                        <div className="flex items-center gap-3">
                            {user && (
                                <Link to="/wishlist" className="relative p-2.5 text-gray-500 hover:text-primary-500 hover:bg-primary-50 rounded-full transition-all group">
                                    <FiHeart size={22} className="group-hover:scale-110 transition-transform" />
                                    {wishlistCount > 0 && (
                                        <span className="absolute 0 top-0 right-0 w-5 h-5 bg-primary-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white shadow-gold animate-pulse-gold">
                                            {wishlistCount}
                                        </span>
                                    )}
                                </Link>
                            )}

                            <Link to="/cart" className="relative p-2.5 text-gray-500 hover:text-primary-500 hover:bg-primary-50 rounded-full transition-all group">
                                <FiShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
                                {cartItemsCount > 0 && (
                                    <span className="absolute top-0 right-0 w-5 h-5 bg-primary-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white shadow-gold">
                                        {cartItemsCount}
                                    </span>
                                )}
                            </Link>

                            {/* User Menu */}
                            {user ? (
                                <div className="relative group ml-1">
                                    <button className="p-2.5 text-gray-500 hover:text-primary-500 hover:bg-primary-50 rounded-full transition-all">
                                        <FiUser size={22} className="group-hover:scale-110 transition-transform" />
                                    </button>

                                    <div className="absolute right-0 mt-1 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-[60]">
                                        <div className="bg-white/95 blur-backdrop rounded-2xl shadow-soft-xl border border-primary-100 p-2 overflow-hidden">
                                            <div className="px-4 py-3 border-b border-gray-100 mb-2">
                                                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                            {user.isAdmin && (
                                                <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-600 font-medium hover:bg-primary-50 rounded-xl transition-colors">
                                                    <FiGift size={16} /> Admin Dashboard
                                                </Link>
                                            )}
                                            <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors">
                                                <FiUser size={16} /> My Profile
                                            </Link>
                                            <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors">
                                                <FiPackage size={16} /> Order History
                                            </Link>
                                            <div className="h-px bg-gray-100 my-1"></div>
                                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error-dark hover:bg-error-light hover:text-error rounded-xl transition-colors">
                                                <FiLogOut size={16} /> Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Link to="/auth" className="ml-2">
                                    <button className="btn-primary text-sm px-5 py-2">
                                        Sign In
                                    </button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className={`md:hidden flex flex-col ${location.pathname === '/profile' ? 'py-5' : 'py-3 space-y-3'}`}>
                        {/* Top Row: Centered Logo */}
                        <div className="flex items-center justify-center w-full">
                            <Link to="/" className="flex items-center gap-2">
                                <img src={logoImg} alt="Glitz Creativez" className="h-12 w-auto" />
                            </Link>
                        </div>

                        {/* Bottom Row: Search Bar + Action Icons - Hidden on Profile page */}
                        {location.pathname !== '/profile' && (
                            <div className="flex items-center gap-2">
                                {/* Search Bar */}
                                <form onSubmit={handleSearch} className="flex-1 relative group">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search 'Products'"
                                        className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 caret-primary-600 transition-all text-sm"
                                    />
                                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors">
                                        <FiSearch size={18} />
                                    </button>
                                </form>

                                {/* Right Action Icons */}
                                {!['/'].includes(location.pathname) &&
                                    !location.pathname.startsWith('/wishlist') &&
                                    !location.pathname.startsWith('/cart') &&
                                    !location.pathname.startsWith('/orders') && (
                                        <div className="flex items-center gap-1">
                                            {/* Cart Icon */}
                                            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
                                                <FiShoppingCart size={20} />
                                                {cartItemsCount > 0 && (
                                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white shadow-sm">
                                                        {cartItemsCount > 9 ? '9+' : cartItemsCount}
                                                    </span>
                                                )}
                                            </Link>

                                            {/* Wishlist Icon */}
                                            <Link to={user ? "/wishlist" : "/auth"} className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
                                                <FiHeart size={20} />
                                                {user && wishlistCount > 0 && (
                                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white shadow-sm">
                                                        {wishlistCount > 9 ? '9+' : wishlistCount}
                                                    </span>
                                                )}
                                            </Link>

                                            {/* Profile Icon */}
                                            <Link to={user ? "/profile" : "/auth"} className="p-2 text-gray-600 hover:text-primary-600 transition-colors">
                                                <FiUser size={20} />
                                            </Link>
                                        </div>
                                    )}
                            </div>
                        )}
                    </div>
                </div>
            </motion.nav>

            {/* Desktop Search Modal */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-start justify-center pt-32"
                        onClick={() => setIsSearchOpen(false)}
                    >
                        <motion.form
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            onSubmit={handleSearch}
                            className="w-full max-w-2xl mx-4"
                        >
                            <div className="relative">
                                <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-400" size={24} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for the perfect gift..."
                                    autoFocus
                                    className="w-full pl-16 pr-6 py-5 text-xl bg-white border border-primary-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 shadow-gold-lg transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsSearchOpen(false)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <FiX size={24} />
                                </button>
                            </div>
                        </motion.form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
