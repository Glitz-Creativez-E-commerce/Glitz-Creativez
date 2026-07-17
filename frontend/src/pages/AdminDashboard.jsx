import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    FiPackage, FiShoppingBag, FiUsers,
    FiTrendingUp, FiPlus, FiEdit2, FiTrash2, FiEye,
    FiGrid, FiGift, FiSettings, FiLogOut, FiHome,
    FiMenu, FiX, FiChevronLeft, FiTag, FiPieChart,
    FiBarChart2, FiActivity, FiCheck, FiImage, FiLock, FiInfo, FiStar,
    FiTruck, FiCheckCircle, FiLayout
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { selectCurrentUser, selectIsAuthenticated, logout, updateProfile } from '../store/slices/authSlice';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { addToast } from '../store/slices/uiSlice';
import ProductModal from '../components/admin/ProductModal';
import CategoryModal from '../components/admin/CategoryModal';
import AdminSettingsModal from '../components/admin/AdminSettingsModal';
import DashboardCharts from '../components/admin/DashboardCharts';
import OrderDetailsModal from '../components/admin/OrderDetailsModal';
import UserDetailsModal from '../components/admin/UserDetailsModal';
import BannerModal from '../components/admin/BannerModal';
import PromoModal from '../components/admin/PromoModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);


    // State
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Data State
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [banners, setBanners] = useState([]);
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
    const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
    const [isAdminSettingsModalOpen, setIsAdminSettingsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingBanner, setEditingBanner] = useState(null);
    const [editingPromo, setEditingPromo] = useState(null);
    const [editingSlotNum, setEditingSlotNum] = useState(null);

    // Order Modal State
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [viewingOrder, setViewingOrder] = useState(null);

    // User Modal State
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [viewingUser, setViewingUser] = useState(null);

    // Headers helper
    const getHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
        };
    };

    // Check if user is admin
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth');
            return;
        }
        if (!user?.isAdmin) {
            navigate('/');
            return;
        }
        fetchDashboardData();
    }, [isAuthenticated, user, navigate]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const headers = getHeaders();
            const timestamp = Date.now();

            // Fetch products
            const productsRes = await fetch(`${API_URL}/api/products/all?t=${timestamp}`, { headers });

            // Fetch categories
            const categoriesRes = await fetch(`${API_URL}/api/categories?all=true&t=${timestamp}`, { headers });

            // Fetch orders
            const ordersRes = await fetch(`${API_URL}/api/orders/admin/all?t=${timestamp}`, { headers });
            if (ordersRes.status === 401) { dispatch(logout()); return; }

            // Fetch users
            const usersRes = await fetch(`${API_URL}/api/auth/admin/users?t=${timestamp}`, { headers });
            if (usersRes.status === 401) { dispatch(logout()); return; }

            // Fetch banners
            const bannersRes = await fetch(`${API_URL}/api/banners?all=true&t=${timestamp}`, { headers });

            // Fetch promos
            const promosRes = await fetch(`${API_URL}/api/promos?all=true&t=${timestamp}`, { headers });

            const productsData = await productsRes.json();
            const categoriesData = await categoriesRes.json();
            const ordersData = await ordersRes.json(); // May throw if 401 and not JSON, but we checked status above
            const usersData = await usersRes.json();
            const bannersData = await bannersRes.json();
            const promosData = await promosRes.json();

            setProducts(productsData.data || []);
            setCategories(categoriesData.data || []);
            setOrders(ordersData.data || []);
            setUsers(usersData.data || []);
            setBanners(bannersData.data || []);
            setPromos(promosData.data || []);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // If we get here, it might be due to json parse error from 401 response text
            // We can't easily distinguish without checking status codes on every fetch
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers: Products ---
    const handleCreateProduct = async (productData) => {
        try {
            const res = await fetch(`${API_URL}/api/products`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(productData),
            });
            if (res.ok) {
                fetchDashboardData(); // Refresh list
                setIsProductModalOpen(false);
            }
        } catch (error) {
            console.error('Error creating product:', error);
        }
    };

    const handleUpdateProduct = async (productData) => {
        try {
            const res = await fetch(`${API_URL}/api/products/${editingProduct._id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(productData),
            });
            if (res.ok) {
                fetchDashboardData();
                setIsProductModalOpen(false);
                setEditingProduct(null);
            }
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            const res = await fetch(`${API_URL}/api/products/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
            if (res.ok) {
                fetchDashboardData();
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const openProductModal = (product = null) => {
        setEditingProduct(product);
        setIsProductModalOpen(true);
    };

    const handleDeleteReview = async (productId, reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            const res = await fetch(`${API_URL}/api/products/${productId}/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
            if (res.ok) {
                dispatch(addToast({ type: 'success', message: 'Review deleted successfully' }));
                fetchDashboardData();
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            dispatch(addToast({ type: 'error', message: 'Failed to delete review' }));
        }
    };

    // --- Handlers: Categories ---
    const handleCreateCategory = async (categoryData) => {
        try {
            const res = await fetch(`${API_URL}/api/categories`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(categoryData),
            });
            const data = await res.json();
            if (res.ok) {
                fetchDashboardData();
                setIsCategoryModalOpen(false);
            } else {
                throw new Error(data.message || 'Error creating category');
            }
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    };

    const handleUpdateCategory = async (categoryData) => {
        try {
            const res = await fetch(`${API_URL}/api/categories/${editingCategory._id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(categoryData),
            });
            const data = await res.json();
            if (res.ok) {
                fetchDashboardData();
                setIsCategoryModalOpen(false);
                setEditingCategory(null);
            } else {
                throw new Error(data.message || 'Error updating category');
            }
        } catch (error) {
            console.error('Error updating category:', error);
            throw error;
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            const res = await fetch(`${API_URL}/api/categories/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
            if (res.ok) {
                fetchDashboardData();
            }
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    const openCategoryModal = (category = null) => {
        setEditingCategory(category);
        setIsCategoryModalOpen(true);
    };

    // --- Handlers: Banners ---
    const handleCreateBanner = async (bannerData) => {
        try {
            const res = await fetch(`${API_URL}/api/banners`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(bannerData),
            });
            if (res.ok) {
                fetchDashboardData();
                setIsBannerModalOpen(false);
            }
        } catch (error) {
            console.error('Error creating banner:', error);
        }
    };

    const handleUpdateBanner = async (bannerData) => {
        try {
            const res = await fetch(`${API_URL}/api/banners/${editingBanner._id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(bannerData),
            });
            if (res.ok) {
                fetchDashboardData();
                setIsBannerModalOpen(false);
                setEditingBanner(null);
            }
        } catch (error) {
            console.error('Error updating banner:', error);
        }
    };

    const handleDeleteBanner = async (id) => {
        if (!window.confirm('Are you sure you want to delete this banner?')) return;
        try {
            const res = await fetch(`${API_URL}/api/banners/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
            if (res.ok) {
                fetchDashboardData();
            }
        } catch (error) {
            console.error('Error deleting banner:', error);
        }
    };

    const openBannerModal = (banner = null) => {
        setEditingBanner(banner);
        setIsBannerModalOpen(true);
    };

    // --- Handlers: Promotions ---
    const handleSavePromo = async (promoData) => {
        try {
            const res = await fetch(`${API_URL}/api/promos`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(promoData),
            });
            if (res.ok) {
                fetchDashboardData();
                setIsPromoModalOpen(false);
                setEditingPromo(null);
                setEditingSlotNum(null);
            }
        } catch (error) {
            console.error('Error saving promo card:', error);
        }
    };

    const handleDeletePromo = async (id) => {
        if (!window.confirm('Are you sure you want to reset this promo slot to default?')) return;
        try {
            const res = await fetch(`${API_URL}/api/promos/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
            if (res.ok) {
                fetchDashboardData();
            }
        } catch (error) {
            console.error('Error resetting promo card:', error);
        }
    };

    const openPromoModal = (slotNum, promo = null) => {
        setEditingSlotNum(slotNum);
        setEditingPromo(promo);
        setIsPromoModalOpen(true);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/auth');
    };

    const stats = [
        {
            title: 'Total Products',
            value: products.length,
            icon: <FiPackage />,
            color: 'from-blue-400 to-blue-500',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Total Orders',
            value: orders.length,
            icon: <FiShoppingBag />,
            color: 'from-green-400 to-green-500',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Total Users',
            value: users.length,
            icon: <FiUsers />,
            color: 'from-purple-400 to-purple-500',
            bgColor: 'bg-purple-50'
        },
        {
            title: 'Revenue',
            value: `₹${orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0).toFixed(2)}`,
            icon: <span className="text-xl font-bold text-white">₹</span>,
            color: 'from-primary-400 to-primary-500',
            bgColor: 'bg-primary-50'
        },
    ];

    const sidebarItems = [
        { id: 'overview', label: 'Overview', icon: <FiGrid size={20} /> },
        { id: 'analytics', label: 'Analytics', icon: <FiPieChart size={20} /> },
        { id: 'banners', label: 'Banners', icon: <FiImage size={20} /> },
        { id: 'promos', label: 'Promotions', icon: <FiLayout size={20} /> },
        { id: 'categories', label: 'Categories', icon: <FiTag size={20} /> },
        { id: 'products', label: 'Products', icon: <FiPackage size={20} /> },
        { id: 'orders', label: 'Orders', icon: <FiShoppingBag size={20} /> },
        { id: 'reviews', label: 'Reviews', icon: <FiStar size={20} /> },
        { id: 'users', label: 'Users', icon: <FiUsers size={20} /> },
        { id: 'settings', label: 'Settings', icon: <FiSettings size={20} /> },
    ];

    // Helper to calculate total products purchased by a user
    const getPurchasedCount = (userId) => {
        return orders
            .filter(order => (order.user?._id === userId || order.user === userId))
            .reduce((total, order) => {
                const items = order.orderItems || [];
                const orderTotal = items.reduce((acc, item) => acc + (item.quantity || item.qty || 1), 0);
                return total + orderTotal;
            }, 0);
    };

    const getWhatsAppLink = (order, type) => {
        if (!order || !order.user?.phone) return null;

        const { phone, countryCode, name } = order.user;

        // Ensure country code doesn't have double '+' if phone already has it, or just use what is provided
        const cleanCountryCode = countryCode ? countryCode.replace('+', '') : '91';
        const cleanPhone = phone.replace(/\D/g, ''); // Remove non-digits
        const fullPhone = `${cleanCountryCode}${cleanPhone}`;

        let message = '';
        const orderId = order._id.slice(-6);

        switch (type) {
            case 'received':
                message = `Hello ${name}, we have received your order #${orderId}. It is now being processed.`;
                break;
            case 'packing':
                message = `Hello ${name}, your order #${orderId} is currently being packed with care.`;
                break;
            case 'dispatched':
                message = `Hello ${name}, your order #${orderId} has been dispatched and is on its way!`;
                break;
            case 'delivered':
                message = `Hello ${name}, your order #${orderId} has been delivered. We hope you love it!`;
                break;
            default:
                message = `Hello ${name}, regarding your order #${orderId}.`;
        }

        return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
    };

    if (!user?.isAdmin) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 280 : 80 }}
                transition={{ duration: 0.3, type: "tween", ease: "easeInOut" }}
                onMouseEnter={() => setSidebarOpen(true)}
                onMouseLeave={() => setSidebarOpen(false)}
                className="fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg z-50 flex flex-col"
            >
                {/* Logo */}
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-center">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-gold flex-shrink-0">
                                <FiGift size={20} className="text-white" />
                            </div>
                            {sidebarOpen && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="font-bold font-display overflow-hidden whitespace-nowrap"
                                >
                                    <span className="text-primary-600">Gift</span>
                                    <span className="text-gray-800">Haven</span>
                                </motion.div>
                            )}
                        </Link>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.id === 'settings') {
                                    setIsAdminSettingsModalOpen(true);
                                } else {
                                    setActiveTab(item.id);
                                }
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === item.id && item.id !== 'settings'
                                ? 'bg-gradient-to-r from-primary-500 to-primary-400 text-white shadow-gold'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                        >
                            {item.icon}
                            {sidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2, delay: 0.1 }}
                                    className="whitespace-nowrap"
                                >
                                    {item.label}
                                </motion.span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-gray-100 space-y-2">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <FiLogOut size={20} />
                        {sidebarOpen && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2, delay: 0.1 }}
                                className="whitespace-nowrap"
                            >
                                Logout
                            </motion.span>
                        )}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-[280px]' : 'ml-[80px]'}`}>
                {/* Header */}
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 capitalize">{activeTab}</h1>
                            <p className="text-sm text-gray-500">Manage your gift shop</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {activeTab === 'banners' && (
                                <Button size="sm" icon={<FiPlus />} onClick={() => openBannerModal()}>Add Banner</Button>
                            )}
                            {activeTab === 'products' && (
                                <Button size="sm" icon={<FiPlus />} onClick={() => openProductModal()}>Add Product</Button>
                            )}
                            {activeTab === 'categories' && (
                                <Button size="sm" icon={<FiPlus />} onClick={() => openCategoryModal()}>Add Category</Button>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-8">
                    {/* Stats Cards */}
                    {activeTab === 'overview' && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {stats.map((stat, index) => (
                                    <motion.div
                                        key={stat.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        className={`${stat.bgColor} rounded-2xl p-6 border border-gray-100`}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                                                {stat.icon}
                                            </div>
                                            <FiTrendingUp className="text-green-500" />
                                        </div>
                                        <p className="text-gray-500 text-sm">{stat.title}</p>
                                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Analytics Charts */}
                            <DashboardCharts orders={orders} products={products} />

                            {/* Recent Orders */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50/50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {orders.slice(0, 5).map((order) => (
                                                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-gray-900">
                                                        #{order._id?.slice(-6)}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600 text-sm">
                                                        {order.user?.name || 'Customer'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {order.status === 'delivered' ? <FiCheck size={12} /> : <FiShoppingBag size={12} />}
                                                            <span className="capitalize">{order.status}</span>
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                                        ₹{order.totalPrice?.toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {orders.length === 0 && (
                                        <p className="text-center text-gray-500 py-6">No recent orders</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Sales Analytics</h2>
                            <DashboardCharts orders={orders} products={products} />
                        </div>
                    )}

                    {/* Products Tab */}
                    {activeTab === 'products' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">All Products ({products.length})</h2>
                                <Button size="sm" icon={<FiPlus />} onClick={() => openProductModal()}>Add Product</Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50/50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {products.map((product) => (
                                            <tr key={product._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={product.images?.[0]?.startsWith('http') ? product.images[0] : `${API_URL}${product.images?.[0]}`}
                                                            alt={product.name}
                                                            className="w-12 h-12 rounded-lg object-cover"
                                                        />
                                                        <div>
                                                            <p className="font-medium text-gray-900">{product.name}</p>
                                                            <p className="text-sm text-gray-500 truncate max-w-xs">{product.description?.slice(0, 50)}...</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-900 font-semibold">₹{product.price?.toFixed(2)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {product.stock} in stock
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.isActive ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {product.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">⭐ {product.rating}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openProductModal(product)}
                                                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-green-500"
                                                        >
                                                            <FiEdit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(product._id)}
                                                            className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500"
                                                        >
                                                            <FiTrash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">All Orders ({orders.length})</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50/50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Order ID</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Customer</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Total</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Status</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {orders.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500 border border-gray-200">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <FiShoppingBag size={48} className="text-gray-300 mb-4" />
                                                        <p>No orders yet</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            orders.map((order) => (
                                                <tr key={order._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 font-medium text-gray-900 border border-gray-200">#{order._id?.slice(-8)}</td>
                                                    <td className="px-6 py-4 text-gray-600 border border-gray-200">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-gray-900">{order.user?.name || 'Guest'}</span>
                                                            {order.user?.phone && (
                                                                <span className="text-xs text-gray-500">
                                                                    {order.user.countryCode} {order.user.phone}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-900 font-semibold border border-gray-200">₹{order.totalPrice?.toFixed(2)}</td>
                                                    <td className="px-6 py-4 border border-gray-200">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right border border-gray-200">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                                                                title="View Details"
                                                                onClick={() => {
                                                                    setViewingOrder(order);
                                                                    setIsOrderModalOpen(true);
                                                                }}
                                                            >
                                                                <FiEye size={18} />
                                                            </button>
                                                            {order.user?.phone && (
                                                                <>
                                                                    <a
                                                                        href={getWhatsAppLink(order, 'received')}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                                        title="Send 'Order Received'"
                                                                    >
                                                                        <FiCheckCircle size={18} />
                                                                    </a>
                                                                    <a
                                                                        href={getWhatsAppLink(order, 'packing')}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors"
                                                                        title="Send 'Order Packing'"
                                                                    >
                                                                        <FiPackage size={18} />
                                                                    </a>
                                                                    <a
                                                                        href={getWhatsAppLink(order, 'dispatched')}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                                                                        title="Send 'Order Dispatched'"
                                                                    >
                                                                        <FiTruck size={18} />
                                                                    </a>
                                                                    <a
                                                                        href={getWhatsAppLink(order, 'delivered')}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                                                        title="Send 'Order Delivered'"
                                                                    >
                                                                        <FiHome size={18} />
                                                                    </a>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                    }

                    {/* Banners Tab */}
                    {activeTab === 'banners' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">Homepage Banners ({banners.length})</h2>
                                <Button size="sm" icon={<FiPlus />} onClick={() => openBannerModal()}>Add Banner</Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50/50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Image</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Sequence</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Title</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Subtitle</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Link</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Status</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {banners.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-12 text-center text-gray-500 border border-gray-200">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <FiImage size={48} className="text-gray-300 mb-4" />
                                                        <p>No banners found. Custom homepage carousel will display default banners.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            banners.map((b) => (
                                                <tr key={b._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 border border-gray-200">
                                                        <div className="h-12 w-28 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden">
                                                            <img
                                                                src={b.image?.startsWith('http') ? b.image : `${API_URL}${b.image}`}
                                                                alt={b.title}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 border border-gray-200">
                                                        <span className="font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded text-sm">
                                                            {b.sequence || 0}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-gray-900 border border-gray-200">{b.title}</td>
                                                    <td className="px-6 py-4 text-gray-600 border border-gray-200">{b.subtitle || '-'}</td>
                                                    <td className="px-6 py-4 text-gray-600 border border-gray-200 text-sm font-mono">{b.link}</td>
                                                    <td className="px-6 py-4 border border-gray-200">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {b.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right border border-gray-200">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => openBannerModal(b)}
                                                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-500"
                                                            >
                                                                <FiEdit2 size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteBanner(b._id)}
                                                                className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500"
                                                            >
                                                                <FiTrash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Promotions Tab */}
                    {activeTab === 'promos' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">Homepage Promotions Grid (8 Fixed Slots)</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Configure promotion cards for your homepage grid. If a slot is empty, the storefront will display its default fallback design.
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50/50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Slot</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Position Label</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Image Preview</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Title</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Link</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Status</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((slotNum) => {
                                            const promo = promos.find(p => p.slot === slotNum);
                                            const labels = {
                                                1: 'Slot 1: Top Left Card (e.g. Cakes)',
                                                2: 'Slot 2: Top Center Wide Banner',
                                                3: 'Slot 3: Top Right Card (e.g. Flowers)',
                                                4: 'Slot 4: Middle Left Card (e.g. New Arrivals)',
                                                5: 'Slot 5: Center Double Height Card',
                                                6: 'Slot 6: Middle Right Card (e.g. Caricatures)',
                                                7: 'Slot 7: Bottom Left Card (e.g. Chocolates)',
                                                8: 'Slot 8: Bottom Right Card (e.g. Personalised Accessories)'
                                            };
                                            
                                            return (
                                                <tr key={slotNum} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 border border-gray-200 font-mono text-sm font-bold text-gray-900">
                                                        Slot {slotNum}
                                                    </td>
                                                    <td className="px-6 py-4 border border-gray-200 text-sm font-semibold text-gray-700">
                                                        {labels[slotNum]}
                                                    </td>
                                                    <td className="px-6 py-4 border border-gray-200">
                                                        {promo?.image ? (
                                                            <div className="h-12 w-20 rounded bg-gray-100 border border-gray-200 overflow-hidden">
                                                                <img
                                                                    src={promo.image.startsWith('http') ? promo.image : `${API_URL}${promo.image}`}
                                                                    alt={promo.title}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic">Default Fallback Image</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 border border-gray-200">
                                                        {promo ? (
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-gray-900 text-sm">{promo.title}</span>
                                                                {promo.subtitle && <span className="text-xs text-gray-500">{promo.subtitle}</span>}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic">Default Fallback Text</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 border border-gray-200 text-sm font-mono text-gray-600">
                                                        {promo?.link || '/products'}
                                                    </td>
                                                    <td className="px-6 py-4 border border-gray-200">
                                                        {promo ? (
                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${promo.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                {promo.isActive ? 'Active' : 'Inactive'}
                                                            </span>
                                                        ) : (
                                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                                                                Fallback Active
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right border border-gray-200">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => openPromoModal(slotNum, promo)}
                                                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-500"
                                                                title="Edit Promotion Card"
                                                            >
                                                                <FiEdit2 size={18} />
                                                            </button>
                                                            {promo && (
                                                                <button
                                                                    onClick={() => handleDeletePromo(promo._id)}
                                                                    className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500"
                                                                    title="Reset to default"
                                                                >
                                                                    <FiTrash2 size={18} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Categories Tab */}
                    {
                        activeTab === 'categories' && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900">Categories ({categories.length})</h2>
                                    <Button size="sm" icon={<FiPlus />} onClick={() => openCategoryModal()}>Add Category</Button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50/50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Image</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Sequence</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Name</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Status</th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {categories.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 border border-gray-200">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <FiGift size={48} className="text-gray-300 mb-4" />
                                                            <p>No categories found</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                categories.map((cat) => (
                                                    <tr key={cat._id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 border border-gray-200">
                                                            <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden">
                                                                {cat.image ? (
                                                                    <img
                                                                        src={cat.image?.startsWith('http') ? cat.image : `${API_URL}${cat.image}`}
                                                                        alt={cat.name}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                                        <FiImage />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 border border-gray-200">
                                                            <span className="font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded text-sm">
                                                                {cat.sequence || 0}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 font-medium text-gray-900 border border-gray-200">{cat.name}</td>
                                                        <td className="px-6 py-4 border border-gray-200">
                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cat.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                {cat.isActive !== false ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right border border-gray-200">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => openCategoryModal(cat)}
                                                                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-500"
                                                                >
                                                                    <FiEdit2 size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteCategory(cat._id)}
                                                                    className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500"
                                                                >
                                                                    <FiTrash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    }


                    {/* Reviews Tab */}
                    {
                        activeTab === 'reviews' && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        All Reviews ({products.reduce((acc, p) => acc + (p.reviews?.length || 0), 0)})
                                    </h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50/50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Product</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Reviewer</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Rating</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Comment</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Date</th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {products.flatMap(p => (p.reviews || []).map(r => ({ ...r, productName: p.name, productId: p._id, reviewId: r._id, productImage: p.images?.[0] }))).length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 border border-gray-200">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <FiStar size={48} className="text-gray-300 mb-4" />
                                                            <p>No reviews found</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                products.flatMap(p => (p.reviews || []).map(r => ({ ...r, productName: p.name, productId: p._id, reviewId: r._id, productImage: p.images?.[0] })))
                                                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                                    .map((review) => (
                                                        <tr key={review.reviewId} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 border border-gray-200">
                                                                <div className="flex items-center gap-3">
                                                                    <img
                                                                        src={review.productImage?.startsWith('http') ? review.productImage : `${API_URL}${review.productImage}`}
                                                                        alt={review.productName}
                                                                        className="w-10 h-10 rounded object-cover"
                                                                    />
                                                                    <span className="font-medium text-gray-900 text-sm truncate max-w-[150px]">{review.productName}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-gray-600 font-medium border border-gray-200">{review.name}</td>
                                                            <td className="px-6 py-4 border border-gray-200">
                                                                <div className="flex items-center gap-1">
                                                                    <span className="font-bold text-gray-900">{review.rating}</span>
                                                                    <FiStar className="text-yellow-400 fill-current" size={14} />
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-gray-600 text-sm border border-gray-200 max-w-xs truncate" title={review.comment}>
                                                                {review.comment}
                                                            </td>
                                                            <td className="px-6 py-4 text-gray-500 text-sm border border-gray-200">
                                                                {new Date(review.createdAt).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-6 py-4 text-right border border-gray-200">
                                                                <button
                                                                    onClick={() => handleDeleteReview(review.productId, review.reviewId)}
                                                                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                                                    title="Delete Review"
                                                                >
                                                                    <FiTrash2 size={18} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    }

                    {/* Users Tab */}
                    {
                        activeTab === 'users' && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-900">All Users ({users.filter(u => !u.isAdmin).length})</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50/50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">User</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Email</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Phone Number</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Products Purchased</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Role</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Joined</th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-200">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {users.filter(u => !u.isAdmin).length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 border border-gray-200">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <FiUsers size={48} className="text-gray-300 mb-4" />
                                                            <p>No users found</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                users.filter(u => !u.isAdmin).map((u) => (
                                                    <tr key={u._id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 font-medium text-gray-900 border border-gray-200">{u.name}</td>
                                                        <td className="px-6 py-4 text-gray-600 border border-gray-200">{u.email}</td>
                                                        <td className="px-6 py-4 text-gray-600 border border-gray-200">{u.countryCode} {u.phone}</td>
                                                        <td className="px-6 py-4 text-gray-900 font-semibold border border-gray-200">
                                                            {getPurchasedCount(u._id)}
                                                        </td>
                                                        <td className="px-6 py-4 border border-gray-200">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${u.isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                                                                }`}>
                                                                {u.isAdmin ? 'Admin' : 'Customer'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-500 text-sm border border-gray-200">
                                                            {new Date(u.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-right border border-gray-200">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setViewingUser(u);
                                                                        setIsUserModalOpen(true);
                                                                    }}
                                                                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-500 transition-colors"
                                                                    title="View User Details"
                                                                >
                                                                    <FiEye size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    }




                </div >
            </main >

            {/* Modals */}
            < ProductModal
                isOpen={isProductModalOpen}
                onClose={() => {
                    setIsProductModalOpen(false);
                    setEditingProduct(null);
                }}
                onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
                product={editingProduct}
                categories={categories}
            />

            <CategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => {
                    setIsCategoryModalOpen(false);
                    setEditingCategory(null);
                }}
                onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
                category={editingCategory}
                categories={categories}
            />

            <BannerModal
                isOpen={isBannerModalOpen}
                onClose={() => {
                    setIsBannerModalOpen(false);
                    setEditingBanner(null);
                }}
                onSubmit={editingBanner ? handleUpdateBanner : handleCreateBanner}
                banner={editingBanner}
                banners={banners}
            />

            <PromoModal
                isOpen={isPromoModalOpen}
                onClose={() => {
                    setIsPromoModalOpen(false);
                    setEditingPromo(null);
                    setEditingSlotNum(null);
                }}
                onSubmit={handleSavePromo}
                slotNum={editingSlotNum}
                promo={editingPromo}
            />

            <AdminSettingsModal
                isOpen={isAdminSettingsModalOpen}
                onClose={() => setIsAdminSettingsModalOpen(false)}
            />

            <OrderDetailsModal
                isOpen={isOrderModalOpen}
                onClose={() => {
                    setIsOrderModalOpen(false);
                    setViewingOrder(null);
                }}
                order={viewingOrder}
            />
            <UserDetailsModal
                isOpen={isUserModalOpen}
                onClose={() => {
                    setIsUserModalOpen(false);
                    setViewingUser(null);
                }}
                user={viewingUser}
                orders={orders}
            />
        </div >
    );
};

export default AdminDashboard;
