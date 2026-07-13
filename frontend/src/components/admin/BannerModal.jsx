import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiUpload, FiImage } from 'react-icons/fi';
import Button from '../common/Button';
import Input from '../common/Input';
import axios from 'axios';

const BannerModal = ({ isOpen, onClose, onSubmit, banner = null, banners = [] }) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        description: '',
        image: '',
        link: '/products',
        buttonText: 'Shop Now',
        sequence: 0,
        isActive: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (banner) {
            setFormData({
                title: banner.title || '',
                subtitle: banner.subtitle || '',
                description: banner.description || '',
                image: banner.image || '',
                link: banner.link || '/products',
                buttonText: banner.buttonText || 'Shop Now',
                sequence: banner.sequence || 0,
                isActive: banner.isActive !== false
            });
        } else {
            // Auto-suggest next sequence
            const maxSequence = banners.reduce((max, b) => (b.sequence > max ? b.sequence : max), 0);
            setFormData({
                title: '',
                subtitle: '',
                description: '',
                image: '',
                link: '/products',
                buttonText: 'Shop Now',
                sequence: maxSequence + 1,
                isActive: true
            });
        }
        setError('');
    }, [banner?._id, isOpen, banners.length]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (!formData.image) {
            setError('Banner image is required');
            setLoading(false);
            return;
        }

        try {
            await onSubmit({
                ...formData,
                sequence: Number(formData.sequence)
            });
            onClose();
        } catch (err) {
            setError(err.message || 'An error occurred. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-2xl bg-white rounded-2xl shadow-gold p-6 overflow-y-auto max-h-[90vh]"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            {banner ? 'Edit Banner' : 'New Banner'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <FiX size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2">
                                <FiX size={14} /> {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g. Elegant Gifts Collection"
                                required
                            />
                            <Input
                                label="Subtitle (Accent Text)"
                                value={formData.subtitle}
                                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                                placeholder="e.g. SPECIAL OFFER"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Write a short marketing description..."
                                className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none resize-none h-24 text-gray-700"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Button Text"
                                value={formData.buttonText}
                                onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
                                placeholder="e.g. Shop Now"
                            />
                            <Input
                                label="Redirect Link (URL Path)"
                                value={formData.link}
                                onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                                placeholder="e.g. /products or /categories/flowers"
                            />
                        </div>

                        {/* Image Upload Area */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Banner Image <span className="text-red-500">*</span></label>
                            <div className="aspect-[21/9] w-full rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden relative group">
                                {formData.image ? (
                                    <div className="relative w-full h-full">
                                        <img
                                            src={formData.image?.startsWith('http') ? formData.image : `${API_URL}${formData.image}`}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <FiX size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-gray-100 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <FiUpload className="w-8 h-8 mb-3 text-gray-400" />
                                            <p className="text-xs text-gray-500">Click to upload banner image</p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const data = new FormData();
                                                    data.append('image', file);
                                                    try {
                                                        const config = { headers: { 'Content-Type': 'multipart/form-data' } };
                                                        const res = await axios.post(`${API_URL}/api/upload`, data, config);
                                                        setFormData(prev => ({ ...prev, image: res.data.image }));
                                                    } catch (error) {
                                                        console.error(error);
                                                    }
                                                }
                                            }}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Sequence Number"
                                type="number"
                                value={formData.sequence}
                                onChange={(e) => setFormData(prev => ({ ...prev, sequence: e.target.value }))}
                                placeholder="0"
                                required
                            />
                            
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col justify-center">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-900">Active Status</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                isLoading={loading}
                                icon={<FiCheck />}
                            >
                                {banner ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default BannerModal;
