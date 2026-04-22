import { motion } from 'framer-motion';

const SizeSelector = ({ sizes, selectedSize, onSelectSize }) => {
    if (!sizes || sizes.length === 0) return null;

    return (
        <div className="flex flex-col items-start w-full">
            <div className="flex justify-between w-full items-center mb-3">
                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Select Size</span>
                <span className="text-xs text-gray-500 font-medium cursor-pointer hover:underline">Size Guide</span>
            </div>

            {/* Scrollable container on mobile, flex-wrap on desktop */}
            <div className="w-full flex sm:flex-wrap gap-2.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide snap-x">
                {sizes.map((size) => {
                    const isSelected = selectedSize?.name === size.name;
                    return (
                        <button
                            key={size.name}
                            onClick={() => onSelectSize(size)}
                            className={`flex-shrink-0 snap-start relative px-4 py-2 min-w-[3.5rem] text-sm font-semibold tracking-wide transition-all duration-200 border rounded-lg ${isSelected
                                ? 'text-primary-700 border-primary-500 bg-primary-50 shadow-sm'
                                : 'text-gray-600 border-gray-200 hover:text-gray-900 hover:border-gray-300 bg-white'
                                } outline-none`}
                        >
                            {size.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default SizeSelector;
