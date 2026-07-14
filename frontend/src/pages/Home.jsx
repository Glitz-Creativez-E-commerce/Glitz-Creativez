import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiGift, FiPackage, FiChevronLeft, FiChevronRight, FiTruck, FiLock, FiCheckCircle, FiStar } from 'react-icons/fi';
import { useGetFeaturedProductsQuery, useGetCategoriesQuery, useGetProductsQuery } from '../store/api/productsApi';
import ProductSlider from '../components/products/ProductSlider';
import ProductCard from '../components/products/ProductCard';
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

const defaultPromos = [
    {
        slot: 1,
        title: 'Gift Hampers',
        subtitle: "Thoughtfully Curated Boxes",
        image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
        link: '/products?search=hamper',
        isActive: true
    },
    {
        slot: 2,
        title: 'Winni Celebration Sale',
        subtitle: 'Amazing Discounts',
        image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=600&q=80',
        link: '/products',
        isActive: true
    },
    {
        slot: 3,
        title: 'Anniversary Flowers',
        subtitle: 'Fresh Blooms for Lasting Love',
        image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80',
        link: '/products?search=flower',
        isActive: true
    },
    {
        slot: 4,
        title: 'Personalised Journals',
        subtitle: 'Embossed with Your Name',
        image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=600&q=80',
        link: '/products?search=journal',
        isActive: true
    },
    {
        slot: 5,
        title: 'Lucky Bamboo Plants',
        subtitle: 'Grow Positivity Every Day',
        image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80',
        link: '/products?search=plant',
        isActive: true
    },
    {
        slot: 6,
        title: 'Caricatures',
        subtitle: 'Turning Memories into Art',
        image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80',
        link: '/products?search=caricature',
        isActive: true
    },
    {
        slot: 7,
        title: 'Winni Chocolates',
        subtitle: 'Made to Melt Hearts',
        image: 'https://images.unsplash.com/photo-1549007994-cb92ca817b7a?auto=format&fit=crop&w=600&q=80',
        link: '/products?search=chocolate',
        isActive: true
    },
    {
        slot: 8,
        title: 'Personalised Accessories',
        subtitle: 'Crafted to Reflect You',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
        link: '/products?search=personalised',
        isActive: true
    }
];

const PromoCardItem = ({ card, isDouble = false }) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    if (!card) return null;

    const imageUrl = card.image?.startsWith('http') ? card.image : `${API_URL}${card.image}`;
    const isSlot2 = card.slot === 2;

    const titleColors = {
        1: 'text-[#E67E22]', // Orange for Cake
        3: 'text-[#E91E63]', // Pink for Flowers
        4: 'text-[#8E44AD]', // Purple for New Arrival
        5: 'text-[#27AE60]', // Green for Plants
        6: 'text-[#2C3E50]', // Navy for Caricatures
        7: 'text-[#7E5109]', // Brown for Chocolates
        8: 'text-[#2980B9]'  // Blue for Accessories
    };
    
    const textColor = titleColors[card.slot] || 'text-gray-800';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`group relative overflow-hidden rounded-3xl border border-[#FF64B4]/10 bg-[#FAF9FC] transition-colors duration-300 hover:border-[#FF64B4]/25 ${
                isDouble ? 'md:row-span-2 min-h-[350px] md:h-full' : 'h-[250px] md:h-[290px]'
            }`}
        >
            <Link to={card.link} className="absolute inset-0 flex flex-col justify-between p-0 overflow-hidden">
                {isSlot2 ? (
                    <div className="absolute inset-0">
                        <img
                            src={imageUrl}
                            alt={card.title}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                    </div>
                ) : (
                    <>
                        <div className="text-center pt-6 px-4 z-10 flex flex-col items-center">
                            <h3 className={`text-lg md:text-xl font-extrabold tracking-tight mb-1 ${textColor}`}>
                                {card.title}
                            </h3>
                            {card.subtitle && (
                                <p className="text-xs md:text-sm text-gray-500 font-medium italic">
                                    {card.subtitle}
                                </p>
                            )}
                        </div>
                        <div className="relative w-full flex-1 flex items-center justify-center mt-3 overflow-hidden">
                            <img
                                src={imageUrl}
                                alt={card.title}
                                className={`object-contain transition-transform duration-500 ease-out group-hover:scale-105 ${
                                    isDouble ? 'max-h-[200px] md:max-h-[320px]' : 'max-h-[140px]'
                                }`}
                            />
                        </div>
                    </>
                )}
            </Link>
        </motion.div>
    );
};

const Home = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const [currentSlide, setCurrentSlide] = useState(0);
    const [homeBanners, setHomeBanners] = useState(defaultBanners);
    const [promos, setPromos] = useState([]);

    useEffect(() => {
        const fetchPromos = async () => {
            try {
                const res = await fetch(`${API_URL}/api/promos`);
                const json = await res.json();
                if (json.success && json.data) {
                    setPromos(json.data);
                }
            } catch (err) {
                console.error('Error fetching promos:', err);
            }
        };
        fetchPromos();
    }, []);

    const getPromoForSlot = (slotNum) => {
        const dbPromo = promos.find(p => p.slot === slotNum);
        if (dbPromo && dbPromo.isActive) return dbPromo;
        return defaultPromos.find(p => p.slot === slotNum);
    };

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

    const [bestsellerTab, setBestsellerTab] = useState('personalised');
    const bestsellerCategoryMap = {
        personalised: '6a5297fccb0f753bdffcae71',
        flowers: '6a5297fccb0f753bdffcae72'
    };
    const { data: bestsellerProductsData, isLoading: bestsellerLoading } = useGetProductsQuery({
        category: bestsellerCategoryMap[bestsellerTab],
        limit: 8
    });
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

            {/* Categories Circle Navigation Row (Winni-style) */}
            {categoriesData?.data && categoriesData.data.length > 0 && (
                <section className="py-6 bg-white border-b border-gray-100">
                    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-start md:justify-center gap-6 md:gap-10 overflow-x-auto scrollbar-none py-2 px-1">
                            {categoriesData.data
                                .filter(cat => cat.isActive !== false)
                                .map((category) => {
                                    const imageUrl = category.image?.startsWith('http') 
                                        ? category.image 
                                        : `${API_URL}${category.image}`;

                                    return (
                                        <Link 
                                            key={category._id} 
                                            to={`/products?category=${category._id}`}
                                            className="flex flex-col items-center flex-shrink-0 group cursor-pointer"
                                        >
                                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border border-gray-150 bg-[#FAF9FC] flex items-center justify-center p-1 transition-all duration-300 group-hover:border-[#FF64B4] group-hover:shadow-md group-hover:shadow-[#FF64B4]/10">
                                                <img
                                                    src={imageUrl}
                                                    alt={category.name}
                                                    className="w-full h-full object-cover rounded-full transition-transform duration-500 ease-out group-hover:scale-105"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.png'; }}
                                                />
                                            </div>
                                            <span className="text-xs md:text-sm font-bold text-gray-700 mt-2 transition-colors duration-300 group-hover:text-[#FF64B4] whitespace-nowrap">
                                                {category.name}
                                            </span>
                                        </Link>
                                    );
                                })}
                        </div>
                    </div>
                </section>
            )}

            {/* Must Have Promotions Grid Section */}
            <section className="py-14 bg-slate-50/50 border-y border-gray-100">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">
                            <span className="text-gray-900">Must</span> <span className="text-[#FF64B4]">Have</span>
                        </h2>
                        <p className="text-gray-500 text-sm md:text-base">Explore our trending and handpicked favorites</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Column 1 */}
                        <div className="flex flex-col gap-6">
                            <PromoCardItem card={getPromoForSlot(1)} />
                            <PromoCardItem card={getPromoForSlot(4)} />
                            <PromoCardItem card={getPromoForSlot(7)} />
                        </div>
                        
                        {/* Column 2 */}
                        <div className="flex flex-col gap-6">
                            <PromoCardItem card={getPromoForSlot(2)} />
                            <PromoCardItem card={getPromoForSlot(5)} isDouble={true} />
                        </div>
                        
                        {/* Column 3 */}
                        <div className="flex flex-col gap-6">
                            <PromoCardItem card={getPromoForSlot(3)} />
                            <PromoCardItem card={getPromoForSlot(6)} />
                            <PromoCardItem card={getPromoForSlot(8)} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Subcategory Showcase Section (Winni-style) */}
            <section className="py-12 bg-white border-b border-gray-100">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-row items-end justify-between mb-8 pb-4 border-b border-gray-100">
                        <div className="text-left">
                            <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">
                                Personalised Gifts
                            </h2>
                            <p className="text-gray-500 text-xs md:text-sm mt-1">Thoughtful creations crafted to make them smile</p>
                        </div>
                        <Link 
                            to="/products?category=6a5297fccb0f753bdffcae71"
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-[10px] md:text-xs font-bold px-4 md:px-5 py-2.5 rounded transition-colors duration-300 tracking-wider uppercase"
                        >
                            View All
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {[
                            {
                                title: 'Photo Caricatures',
                                price: '₹ 499',
                                link: '/products?search=caricature',
                                bg: 'bg-[#FFECF6]', // Soft pink
                                image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=300&q=80' // Beautiful art/painting/gifts
                            },
                            {
                                title: 'Custom Mugs',
                                price: '₹ 299',
                                link: '/products?search=mug',
                                bg: 'bg-[#EBFDF3]', // Soft green
                                image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80' // Premium mug
                            },
                            {
                                title: 'Engraved Plaques',
                                price: '₹ 599',
                                link: '/products?search=plaque',
                                bg: 'bg-[#FFF9EC]', // Soft yellow
                                image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=300&q=80' // Custom wooden plaque
                            },
                            {
                                title: 'Custom Cushions',
                                price: '₹ 399',
                                link: '/products?search=pillow',
                                bg: 'bg-[#EEF7FF]', // Soft blue
                                image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=300&q=80' // Custom cushion
                            }
                        ].map((item, idx) => (
                            <Link 
                                key={idx}
                                to={item.link}
                                className={`group flex flex-col justify-between rounded-3xl overflow-hidden ${item.bg} border border-gray-100/50 shadow-soft transition-all duration-300 hover:shadow-lg`}
                            >
                                <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden min-h-[140px] md:min-h-[180px]">
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white p-1.5 flex items-center justify-center shadow-inner transition-transform duration-500 group-hover:scale-105">
                                        <img 
                                            src={item.image} 
                                            alt={item.title}
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    </div>
                                </div>
                                <div className="bg-white py-3 px-4 text-center border-t border-gray-50 flex flex-col items-center justify-center">
                                    <h4 className="font-extrabold text-gray-800 text-xs md:text-sm tracking-tight line-clamp-1">
                                        {item.title}
                                    </h4>
                                    <span className="text-gray-400 text-[10px] md:text-xs font-bold mt-1">
                                        Starting From {item.price}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bestsellers Tabbed Section (Winni-style) */}
            <section className="py-14 bg-pink-50/5 border-b border-gray-100">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Bestsellers Section Header with Tabs */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-4 border-b border-gray-100 relative">
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                            <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">
                                Bestsellers
                            </h2>
                            {/* Tabs container */}
                            <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-150">
                                <button
                                    onClick={() => setBestsellerTab('personalised')}
                                    className={`relative px-4 py-2 text-xs md:text-sm font-extrabold rounded-lg transition-all duration-300 ${
                                        bestsellerTab === 'personalised'
                                            ? 'bg-gray-800 text-white shadow-sm after:content-[""] after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-[8px] after:border-l-[6px] after:border-l-transparent after:border-r-[6px] after:border-r-transparent after:border-t-[6px] after:border-t-gray-800'
                                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/50'
                                    }`}
                                >
                                    Personalised
                                </button>
                                <button
                                    onClick={() => setBestsellerTab('flowers')}
                                    className={`relative px-4 py-2 text-xs md:text-sm font-extrabold rounded-lg transition-all duration-300 ${
                                        bestsellerTab === 'flowers'
                                            ? 'bg-gray-800 text-white shadow-sm after:content-[""] after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-[8px] after:border-l-[6px] after:border-l-transparent after:border-r-[6px] after:border-r-transparent after:border-t-[6px] after:border-t-gray-800'
                                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/50'
                                    }`}
                                >
                                    Flowers
                                </button>
                            </div>
                        </div>

                        {/* View All Button */}
                        <Link
                            to={`/products?category=${bestsellerCategoryMap[bestsellerTab]}`}
                            className="bg-[#FF64B4] hover:bg-[#ff4da6] text-white text-[10px] md:text-xs font-bold px-4 md:px-5 py-2.5 rounded-lg shadow-sm transition-colors duration-300 tracking-wider uppercase self-start sm:self-center"
                        >
                            View All
                        </Link>
                    </div>
                    {bestsellerLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="w-full bg-gray-100 animate-pulse rounded-2xl h-[280px]" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {bestsellerProductsData?.data?.slice(0, 4).map((product, index) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    index={index}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Testimonials / Customer Reviews Section (Winni-style) */}
            <section className="py-16 bg-[#fafcff] border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">
                            <span className="text-[#FF64B4]">Happy</span> <span className="text-[#4cc9f0]">Customers</span>
                        </h2>
                        <p className="text-gray-500 text-sm md:text-base">Real reviews from our lovely family of customers</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                name: 'Ananya Sharma',
                                role: 'Verified Buyer',
                                rating: 5,
                                text: 'Ordered the Mango Cake and it was absolutely fresh, rich, and delicious! The delivery was right on time for my dad’s birthday. Highly recommended!',
                                initials: 'AS'
                            },
                            {
                                name: 'Rahul Varma',
                                role: 'Verified Buyer',
                                rating: 5,
                                text: 'The flowers were fresh, and the wrapping was so aesthetic. Secure checkout and excellent customer support through WhatsApp. Will order again!',
                                initials: 'RV'
                            },
                            {
                                name: 'Sneha Patel',
                                role: 'Verified Buyer',
                                rating: 5,
                                text: 'Ordered a personalized caricature standee for my anniversary. The illustration was stunning and it brought a huge smile. Thank you Glitz!',
                                initials: 'SP'
                            }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="bg-white rounded-3xl p-6 border border-purple-50 shadow-soft hover:shadow-lg transition-shadow duration-300"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-[#FF64B4]/10 flex items-center justify-center text-[#FF64B4] font-bold">
                                        {item.initials}
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-gray-800 text-sm">{item.name}</h4>
                                        <span className="text-xs text-gray-400 font-medium">{item.role}</span>
                                    </div>
                                </div>
                                <div className="flex text-yellow-400 gap-0.5 mb-3">
                                    {[...Array(item.rating)].map((_, i) => (
                                        <FiStar key={i} className="fill-current w-4 h-4" />
                                    ))}
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed italic">
                                    "{item.text}"
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Glitz Creativez - Trust Section (Winni-style) */}
            <section className="py-16 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">
                            <span className="text-gray-900">Why Choose</span> <span className="text-[#FF64B4]">Glitz Creativez?</span>
                        </h2>
                        <p className="text-gray-500 text-sm md:text-base">We deliver emotions with absolute precision and trust</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: <FiTruck className="w-8 h-8 text-[#FF64B4]" />,
                                title: 'Same Day Delivery',
                                desc: 'Express shipping covering all locations with midnight delivery options.'
                            },
                            {
                                icon: <FiLock className="w-8 h-8 text-[#4cc9f0]" />,
                                title: '100% Secure Checkout',
                                desc: 'SSL encrypted payments handled through trusted and secure local gateways.'
                            },
                            {
                                icon: <FiCheckCircle className="w-8 h-8 text-green-500" />,
                                title: 'Quality Assured',
                                desc: 'Strict freshness and styling checks on flowers, cakes, and custom gifts.'
                            },
                            {
                                icon: <FiGift className="w-8 h-8 text-amber-500" />,
                                title: 'Handcrafted With Love',
                                desc: 'Thoughtfully curated and customizable creations crafted by local design experts.'
                            }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: idx * 0.08 }}
                                className="flex flex-col items-center text-center p-6 bg-[#FAF9FC] rounded-3xl border border-gray-100/50"
                            >
                                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md mb-4">
                                    {item.icon}
                                </div>
                                <h3 className="font-extrabold text-gray-800 text-base mb-2">{item.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
