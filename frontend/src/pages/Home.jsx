import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiGift, FiPackage } from 'react-icons/fi';
import { useGetFeaturedProductsQuery, useGetCategoriesQuery } from '../store/api/productsApi';
import ProductGrid from '../components/products/ProductGrid';
import CategoryCard from '../components/categories/CategoryCard';
import Button from '../components/common/Button';

const Home = () => {
    const { data: popularData, isLoading: popularLoading } = useGetFeaturedProductsQuery(8);
    const { data: categoriesData } = useGetCategoriesQuery();

    return (
        <div className="min-h-screen bg-white">

            {/* Gift Categories Section */}
            <section className="pt-32 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="grid grid-cols-2 min-[450px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
                        {categoriesData?.data
                            ?.filter(cat => cat.isActive !== false)
                            .map((category, index) => (
                                <CategoryCard
                                    key={category._id}
                                    category={category}
                                    index={index}
                                />
                            ))}
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Popular <span className="gradient-text">Gifts</span>
                        </h2>
                        <p className="text-gray-600 mb-6">Loved by thousands of happy customers</p>
                        <Link to="/products?sort=bestselling">
                            <Button variant="ghost" icon={<FiArrowRight />} iconPosition="right">
                                View All
                            </Button>
                        </Link>
                    </div>

                    <ProductGrid
                        products={popularData?.data}
                        isLoading={popularLoading}
                        columns={4}
                    />
                </div>
            </section>


        </div>
    );
};

export default Home;
