import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiGift, FiPackage, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useGetFeaturedProductsQuery, useGetCategoriesQuery } from '../store/api/productsApi';
import ProductSlider from '../components/products/ProductSlider';
import Button from '../components/common/Button';

const defaultBanners = [
    {
        id: 1,
        image: '/images/banner1.png',
        title: 'Curated Gifts for Every Occasion',
        subtitle: 'New Collection',
        description: 'Discover our premium selection of handcrafted and exclusive items designed to make every moment unforgettable.',
        link: '/products',
        buttonText: 'Shop Now',
        accentText: 'bg-gradient-to-r from-[#FF64B4] to-[#4cc9f0]'
    },
    {
        id: 2,
        image: '/images/banner2.png',
        title: 'Aesthetic Finds',
        subtitle: 'Minimalist Styles',
        description: 'Explore the modern aesthetic collection featuring clean lines and vibrant minimalist colors.',
        link: '/products',
        buttonText: 'Explore Collection',
        accentText: 'bg-gradient-to-r from-[#4cc9f0] to-[#FF64B4]'
    },
    {
        id: 3,
        image: '/images/banner3.png',
        title: 'Luxury Collection',
        subtitle: 'Premium Selection',
        description: 'Unveil the elegance with our luxury watches, jewelry, and exclusive gift boxes.',
        link: '/products',
        buttonText: 'Discover Luxury',
        accentText: 'bg-gradient-to-r from-yellow-400 to-yellow-600'
    }
];

const Home = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const [currentSlide, setCurrentSlide] = useState(0);
    const [homeBanners, setHomeBanners] = useState(defaultBanners);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const res = await fetch(`${API_URL}/api/banners`);
                const json = await res.json();
                if (json.success && json.data && json.data.length > 0) {
                    const defaultAccents = [
                        'bg-gradient-to-r from-[#FF64B4] to-[#4cc9f0]',
                        'bg-gradient-to-r from-[#4cc9f0] to-[#FF64B4]',
                        'bg-gradient-to-r from-yellow-400 to-yellow-600'
                    ];
                    const mapped = json.data.map((b, idx) => ({
                        ...b,
                        accentText: defaultAccents[idx % defaultAccents.length]
                    }));
                    setHomeBanners(mapped);
                }
            } catch (err) {
                console.error('Error fetching banners:', err);
            }
        };
        fetchBanners();
    }, []);

    useEffect(() => {
        if (homeBanners.length === 0) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === homeBanners.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, [homeBanners.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === homeBanners.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? homeBanners.length - 1 : prev - 1));
    };

    const { data: popularData, isLoading: popularLoading } = useGetFeaturedProductsQuery(8);
    const { data: categoriesData } = useGetCategoriesQuery();

    return (
        <div className="min-h-screen bg-white">

            {/* Hero Carousel Section */}
            <section className="pt-24 md:pt-28 pb-8">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[400px] md:h-[500px] lg:h-[600px] group">
                        <AnimatePresence>
                            {homeBanners.length > 0 && (
                                <motion.div
                                    key={currentSlide}
                                    initial={{ opacity: 0, scale: 1.05 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.7 }}
                                    className="absolute inset-0"
                                >
                                    <img 
                                        src={homeBanners[currentSlide].image?.startsWith('http') ? homeBanners[currentSlide].image : `${API_URL}${homeBanners[currentSlide].image}`} 
                                        alt={homeBanners[currentSlide].title} 
                                        className="w-full h-full object-cover" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent md:bg-gradient-to-r md:from-black/80 md:via-black/40 md:to-transparent"></div>
                                    <div className="absolute inset-0 flex flex-col justify-end md:justify-center p-8 md:p-16 w-full md:w-2/3 lg:w-1/2 z-10">
                                        <motion.span 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className={`inline-block px-4 py-1.5 text-white text-xs md:text-sm font-bold rounded-full mb-4 uppercase tracking-wider shadow-md w-fit ${homeBanners[currentSlide].accentText}`}
                                        >
                                            {homeBanners[currentSlide].subtitle}
                                        </motion.span>
                                        <motion.h2 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight drop-shadow-lg"
                                        >
                                            {homeBanners[currentSlide].title}
                                        </motion.h2>
                                        <motion.p 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.7 }}
                                            className="text-gray-200 mb-8 text-base md:text-xl drop-shadow-md hidden sm:block"
                                        >
                                            {homeBanners[currentSlide].description}
                                        </motion.p>
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.9 }}
                                        >
                                            <Link to={homeBanners[currentSlide].link}>
                                                <button className="bg-white text-black hover:bg-gray-100 hover:-translate-y-1 transition-transform shadow-2xl rounded-full px-8 py-3 md:px-10 md:py-4 font-bold text-lg flex items-center group/btn">
                                                    {homeBanners[currentSlide].buttonText || 'Shop Now'}
                                                    <FiArrowRight className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
                                            </Link>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Navigation Arrows */}
                        <button 
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 md:p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
                        >
                            <FiChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                        </button>
                        <button 
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 md:p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
                        >
                            <FiChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                        </button>

                        {/* Pagination Dots */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
                            {homeBanners.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`transition-all duration-300 rounded-full ${
                                        currentSlide === index ? 'w-8 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Gift Categories Section - Modern Editorial Layout */}
            <section className="py-12 bg-[#fafcff]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">
                            <span className="text-[#FF64B4]">Shop by</span> <span className="text-[#4cc9f0]">Category</span>
                        </h2>
                        <p className="text-gray-500 text-sm md:text-base">Find the perfect gift curated for your loved ones</p>
                    </div>

                    {categoriesData?.data && categoriesData.data.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {categoriesData.data
                                .filter(cat => cat.isActive !== false)
                                .map((category, index) => {
                                    const isFirst = index === 0;
                                    const imageUrl = category.image?.startsWith('http') 
                                        ? category.image 
                                        : `http://localhost:5000${category.image}`;

                                    return (
                                        <motion.div
                                            key={category._id}
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5, delay: index * 0.05 }}
                                            className={`group relative overflow-hidden rounded-2xl shadow-soft border border-primary-100/50 cursor-pointer ${
                                                isFirst ? 'md:col-span-2 h-[350px] md:h-[450px]' : 'h-[250px] md:h-[320px]'
                                            }`}
                                        >
                                            <Link to={`/products?category=${category._id}`} className="absolute inset-0">
                                                {/* Background Image */}
                                                <img
                                                    src={imageUrl}
                                                    alt={category.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.png'; }}
                                                />
                                                
                                                {/* Dark Gradient Overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent transition-opacity duration-300 group-hover:via-black/45" />

                                                {/* Content */}
                                                <div className={`absolute inset-0 flex flex-col justify-end p-6 md:p-10 text-white ${
                                                    isFirst ? 'md:justify-center md:items-start md:max-w-xl' : ''
                                                }`}>
                                                    <span className="badge bg-white/20 text-white border-white/20 backdrop-blur-md mb-2 w-fit">
                                                        Collection
                                                    </span>
                                                    <h3 className={`font-black tracking-tight mb-2 uppercase ${
                                                        isFirst ? 'text-3xl md:text-5xl leading-tight' : 'text-2xl md:text-3xl'
                                                    }`}>
                                                        {category.name}
                                                    </h3>
                                                    <p className={`text-gray-200 mb-4 text-xs md:text-sm line-clamp-2 ${
                                                        isFirst ? 'block' : 'hidden md:block'
                                                    }`}>
                                                        {category.description || `Explore our handpicked collection of items for ${category.name}.`}
                                                    </p>
                                                    <span className="inline-flex items-center text-sm font-bold text-[#4cc9f0] group-hover:text-primary-300 transition-colors duration-300">
                                                        Shop Collection <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                                                    </span>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                        </div>
                    )}
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
                            <span className="text-[#FF64B4]">Popular</span> <span className="text-[#4cc9f0]">Gifts</span>
                        </h2>
                        <p className="text-gray-600 mb-6 text-sm md:text-base">Loved by thousands of happy customers</p>
                        <Link to="/products?sort=bestselling">
                            <Button variant="ghost" icon={<FiArrowRight />} iconPosition="right">
                                View All
                            </Button>
                        </Link>
                    </div>

                    <ProductSlider
                        products={popularData?.data}
                        isLoading={popularLoading}
                    />
                </div>
            </section>

        </div>
    );
};

export default Home;
