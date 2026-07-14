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
            <section className="pt-20 md:pt-24 pb-4">
                <div className="w-full">
                    <div className="relative overflow-hidden h-[150px] sm:h-[220px] md:h-[300px] lg:h-[350px] group shadow-sm bg-gray-50">
                        <AnimatePresence>
                            {homeBanners.length > 0 && (
                                <motion.div
                                    key={currentSlide}
                                    initial={{ opacity: 0, scale: 1.02 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.6 }}
                                    className="absolute inset-0"
                                >
                                    <img 
                                        src={homeBanners[currentSlide].image?.startsWith('http') ? homeBanners[currentSlide].image : `${API_URL}${homeBanners[currentSlide].image}`} 
                                        alt={homeBanners[currentSlide].title} 
                                        className="w-full h-full object-cover" 
                                    />
                                    {/* Only show text overlay if title is present and is not a dummy value */}
                                    {homeBanners[currentSlide].title && !homeBanners[currentSlide].title.toLowerCase().includes('placeholder') && (
                                        <>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent md:bg-gradient-to-r md:from-black/75 md:via-black/30 md:to-transparent"></div>
                                            <div className="absolute inset-0 flex flex-col justify-end md:justify-center p-6 md:p-12 w-full md:w-2/3 lg:w-1/2 z-10">
                                                <motion.span 
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2 }}
                                                    className={`inline-block px-3 py-1 text-white text-[10px] md:text-xs font-bold rounded-full mb-2 uppercase tracking-wider shadow-sm w-fit ${homeBanners[currentSlide].accentText}`}
                                                >
                                                    {homeBanners[currentSlide].subtitle}
                                                </motion.span>
                                                <motion.h2 
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.4 }}
                                                    className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-2 leading-tight drop-shadow-md"
                                                >
                                                    {homeBanners[currentSlide].title}
                                                </motion.h2>
                                                <motion.p 
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.6 }}
                                                    className="text-gray-200 mb-4 text-xs md:text-sm drop-shadow-sm hidden md:block max-w-md"
                                                >
                                                    {homeBanners[currentSlide].description}
                                                </motion.p>
                                                <motion.div
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.8 }}
                                                >
                                                    <Link to={homeBanners[currentSlide].link}>
                                                        <button className="bg-white text-black hover:bg-gray-100 hover:-translate-y-0.5 transition-transform shadow-lg rounded-full px-5 py-2 md:px-7 md:py-2.5 font-bold text-xs md:text-sm flex items-center group/btn">
                                                            {homeBanners[currentSlide].buttonText || 'Shop Now'}
                                                            <FiArrowRight className="ml-1.5 group-hover/btn:translate-x-1 transition-transform" />
                                                        </button>
                                                    </Link>
                                                </motion.div>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Navigation Arrows */}
                        <button 
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 text-gray-800 p-2 md:p-2.5 rounded-full shadow-lg transition-all duration-300 z-20 flex items-center justify-center border border-gray-150"
                        >
                            <FiChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                        <button 
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 text-gray-800 p-2 md:p-2.5 rounded-full shadow-lg transition-all duration-300 z-20 flex items-center justify-center border border-gray-150"
                        >
                            <FiChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    </div>

                    {/* Pagination Dots (styled and centered outside/below the banner image) */}
                    <div className="flex justify-center items-center gap-1.5 mt-3">
                        {homeBanners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`transition-all duration-300 rounded-full h-1.5 ${
                                    currentSlide === index ? 'w-5 bg-[#FF64B4]' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                                }`}
                            />
                        ))}
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

            {/* Must Have Section */}
            <section className="py-16 bg-[#fafcff]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">
                            <span className="text-[#FF64B4]">Must</span> <span className="text-[#4cc9f0]">Have</span>
                        </h2>
                        <p className="text-gray-500 text-sm md:text-base">Selected picks of our most requested items</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Column 1: Left */}
                        <div className="space-y-6 flex flex-col">
                            {/* Card 1: Mango Cake */}
                            <Link to="/products" className="group block bg-[#FAF4FC] rounded-3xl border border-[#FAF4FC] hover:border-[#FF64B4]/20 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-[280px] md:h-[350px]">
                                <div className="p-6 text-center">
                                    <h4 className="text-xl md:text-2xl font-black text-[#FF64B4] mb-1">Mango Cake</h4>
                                    <p className="text-gray-500 text-xs md:text-sm font-medium italic">Summer's Sweet Tropical Escape</p>
                                </div>
                                <div className="flex-1 flex items-center justify-center p-4">
                                    <img 
                                        src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500" 
                                        alt="Mango Cake" 
                                        className="h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            </Link>

                            {/* Card 2: New Arrival */}
                            <Link to="/products" className="group block bg-[#F6FAF6] rounded-3xl border border-[#F6FAF6] hover:border-[#4cc9f0]/20 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-[280px] md:h-[350px]">
                                <div className="p-6 text-center">
                                    <h4 className="text-xl md:text-2xl font-black text-emerald-600 mb-1">New Arrival</h4>
                                    <p className="text-gray-500 text-xs md:text-sm font-medium italic">New & Made with Your Touch</p>
                                </div>
                                <div className="flex-1 flex items-center justify-center p-4">
                                    <img 
                                        src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500" 
                                        alt="New Arrival" 
                                        className="h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            </Link>

                            {/* Card 3: Chocolates */}
                            <Link to="/products" className="group block bg-[#FCF8F4] rounded-3xl border border-[#FCF8F4] hover:border-yellow-600/20 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-[280px] md:h-[350px]">
                                <div className="p-6 text-center">
                                    <h4 className="text-xl md:text-2xl font-black text-[#A0522D] mb-1">Winni Chocolates</h4>
                                    <p className="text-gray-500 text-xs md:text-sm font-medium italic">Made to Melt Hearts</p>
                                </div>
                                <div className="flex-1 flex items-center justify-center p-4">
                                    <img 
                                        src="https://images.unsplash.com/photo-1511381939415-e44015466834?w=500" 
                                        alt="Winni Chocolates" 
                                        className="h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            </Link>
                        </div>

                        {/* Column 2: Center */}
                        <div className="space-y-6 flex flex-col">
                            {/* Card 4: Celebration Sale */}
                            <Link to="/products" className="group block bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-[280px] md:h-[350px] relative">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
                                <div className="h-full flex flex-col justify-center items-center p-8 text-center text-white z-10 space-y-4">
                                    <span className="bg-white/25 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Winni Celebration</span>
                                    <h3 className="text-3xl md:text-5xl font-black leading-none drop-shadow-md">SALE</h3>
                                    <p className="text-amber-100 text-lg md:text-xl font-bold drop-shadow-sm">Amazing Discounts</p>
                                    <p className="text-amber-50 text-xs font-medium max-w-xs leading-relaxed">on Cakes, Flowers, Personalised Gifts and More!</p>
                                    <span className="bg-white text-orange-600 font-bold px-6 py-2 rounded-full text-sm shadow-md group-hover:scale-105 transition-transform">Order Now</span>
                                </div>
                            </Link>

                            {/* Card 5: Lucky Bamboo Plants (Double Height) */}
                            <Link to="/products" className="group block bg-[#F4F9F4] rounded-3xl border border-[#F4F9F4] hover:border-green-600/20 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col flex-1 h-[584px] md:h-[724px]">
                                <div className="p-6 text-center">
                                    <h4 className="text-xl md:text-2xl font-black text-green-600 mb-1">Lucky Bamboo Plants</h4>
                                    <p className="text-gray-500 text-xs md:text-sm font-medium italic">Grow Positivity Every Day</p>
                                </div>
                                <div className="flex-1 flex items-center justify-center p-6">
                                    <img 
                                        src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=500" 
                                        alt="Lucky Bamboo Plants" 
                                        className="h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            </Link>
                        </div>

                        {/* Column 3: Right */}
                        <div className="space-y-6 flex flex-col md:col-span-2 lg:col-span-1">
                            {/* Card 6: Anniversary Flowers */}
                            <Link to="/products" className="group block bg-[#FAF4FC] rounded-3xl border border-[#FAF4FC] hover:border-[#FF64B4]/20 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-[280px] md:h-[350px]">
                                <div className="p-6 text-center">
                                    <h4 className="text-xl md:text-2xl font-black text-[#FF64B4] mb-1">Anniversary Flowers</h4>
                                    <p className="text-gray-500 text-xs md:text-sm font-medium italic">Fresh Blooms for Lasting Love</p>
                                </div>
                                <div className="flex-1 flex items-center justify-center p-4">
                                    <img 
                                        src="https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=500" 
                                        alt="Anniversary Flowers" 
                                        className="h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            </Link>

                            {/* Card 7: Caricatures */}
                            <Link to="/products" className="group block bg-[#FAF9F5] rounded-3xl border border-[#FAF9F5] hover:border-yellow-600/20 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-[280px] md:h-[350px]">
                                <div className="p-6 text-center">
                                    <h4 className="text-xl md:text-2xl font-black text-amber-700 mb-1">Caricatures</h4>
                                    <p className="text-gray-500 text-xs md:text-sm font-medium italic">Turning Memories into Art</p>
                                </div>
                                <div className="flex-1 flex items-center justify-center p-4">
                                    <img 
                                        src="https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=500" 
                                        alt="Caricatures" 
                                        className="h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            </Link>

                            {/* Card 8: Personalised Accessories */}
                            <Link to="/products" className="group block bg-[#F4F8FA] rounded-3xl border border-[#F4F8FA] hover:border-blue-600/20 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-[280px] md:h-[350px]">
                                <div className="p-6 text-center">
                                    <h4 className="text-xl md:text-2xl font-black text-[#1E90FF] mb-1">Personalised Accessories</h4>
                                    <p className="text-gray-500 text-xs md:text-sm font-medium italic">Crafted to Reflect You</p>
                                </div>
                                <div className="flex-1 flex items-center justify-center p-4">
                                    <img 
                                        src="https://images.unsplash.com/photo-1627124112126-7d4ad2e65436?w=500" 
                                        alt="Personalised Accessories" 
                                        className="h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            </Link>
                        </div>
                    </div>
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
