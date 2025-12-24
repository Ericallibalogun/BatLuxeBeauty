import { memo } from "react";
import { Link } from "react-router-dom";
import { Product } from "../types";

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
    onToggleWishlist: (productId: string) => void;
    isWishlisted: boolean;
}

const ProductCard = memo(
    ({ product, onAddToCart, onToggleWishlist, isWishlisted }: ProductCardProps) => {
        return (
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-pink-50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">

                {/* CLICKABLE AREA */}
                <Link
                    to={`/product/${product.id}`}
                    className="block cursor-pointer"
                >
                    {/* IMAGE */}
                    <div className="relative h-48 overflow-hidden">
                        <img
                            src={product.image_url || 'https://picsum.photos/400/400'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* DETAILS */}
                    <div className="p-4">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-pink-600 font-bold mt-1">
                            ₦{product.price.toLocaleString()}
                        </p>
                    </div>
                </Link>

                {/* ACTIONS */}
                <div className="px-4 pb-4 flex items-center justify-between">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onToggleWishlist(product.id);
                        }}
                        className="text-sm text-gray-600 hover:text-pink-500"
                    >
                        {isWishlisted ? "♥ Wishlisted" : "♡ Wishlist"}
                    </button>

                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onAddToCart(product);
                        }}
                        className="bg-pink-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-pink-600"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        );
    }
);

export default ProductCard;
