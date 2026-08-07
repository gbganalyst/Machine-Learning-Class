import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const ProductContext = createContext();

export const useProducts = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Default categories requested by the user
    const [categories, setCategories] = useState([
        { id: 1, name: 'Clothes', image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop' },
        { id: 2, name: 'Bags', image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1935&auto=format&fit=crop' },
        { id: 3, name: 'Jewellery', image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop' }
    ]);

    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('aura_luxe_cart');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            await fetchProducts();
            setLoading(false);
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        localStorage.setItem('aura_luxe_cart', JSON.stringify(cart));
    }, [cart]);

    const fetchProducts = async () => {
        try {
            // Fetch products with their variations
            const { data, error } = await supabase
                .from('products')
                .select('*, product_variations(*)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error.message);
        }
    };

    const addProduct = async (product, variations = []) => {
        try {
            const { data: productData, error: productError } = await supabase
                .from('products')
                .insert([product])
                .select();

            if (productError) throw productError;
            const newProd = productData[0];

            if (variations.length > 0) {
                const variationsToInsert = variations.map(v => ({
                    ...v,
                    product_id: newProd.id
                }));
                const { data: varData, error: varError } = await supabase
                    .from('product_variations')
                    .insert(variationsToInsert)
                    .select();

                if (varError) throw varError;
                newProd.product_variations = varData;
            } else {
                newProd.product_variations = [];
            }

            setProducts([newProd, ...products]);
            return newProd;
        } catch (error) {
            console.error('Error adding product:', error.message);
            throw error;
        }
    };

    const updateProduct = async (productId, updatedProduct, variations = []) => {
        try {
            // 1. Update main product
            const { data: productData, error: productError } = await supabase
                .from('products')
                .update(updatedProduct)
                .eq('id', productId)
                .select();

            if (productError) throw productError;

            // 2. Sync variations (delete and re-insert for reliability)
            const { error: deleteError } = await supabase
                .from('product_variations')
                .delete()
                .eq('product_id', productId);

            if (deleteError) throw deleteError;

            let finalVariations = [];
            if (variations.length > 0) {
                const variationsToInsert = variations.map(v => ({
                    name: v.name,
                    variation_type: v.variation_type,
                    image_url: v.image_url,
                    price_override: v.price_override,
                    product_id: productId
                }));
                const { data: varData, error: varError } = await supabase
                    .from('product_variations')
                    .insert(variationsToInsert)
                    .select();

                if (varError) throw varError;
                finalVariations = varData;
            }

            const fullUpdatedProduct = { ...productData[0], product_variations: finalVariations };

            setProducts(products.map(p => p.id === productId ? fullUpdatedProduct : p));
            return fullUpdatedProduct;
        } catch (error) {
            console.error('Error updating product:', error.message);
            throw error;
        }
    };

    const deleteProduct = async (id) => {
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setProducts(products.filter(p => p.id !== id));
            setCart(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error deleting product:', error.message);
            throw error;
        }
    };

    const addToCart = (product, selectedVariation = null) => {
        setCart(prev => {
            const variantId = selectedVariation ? selectedVariation.id : 'base';
            const cartItemId = `${product.id}-${variantId}`;

            const exists = prev.find(item => item.cartItemId === cartItemId);

            if (exists) {
                return prev.map(item =>
                    item.cartItemId === cartItemId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            const newCartItem = {
                ...product,
                cartItemId,
                selectedVariation,
                // Use variation image and name if selected
                name: selectedVariation ? `${product.name} - ${selectedVariation.name}` : product.name,
                image_url: selectedVariation?.image_url || product.image_url,
                price: selectedVariation?.price_override || product.price,
                quantity: 1
            };

            return [...prev, newCartItem];
        });
    };

    const removeFromCart = (cartItemId) => {
        setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
    };

    const updateCartQuantity = (cartItemId, quantity) => {
        if (quantity < 1) return removeFromCart(cartItemId);
        setCart(prev => prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity } : item));
    };

    return (
        <ProductContext.Provider value={{
            products,
            categories,
            loading,
            addProduct,
            updateProduct,
            deleteProduct,
            cart,
            addToCart,
            removeFromCart,
            updateCartQuantity,
            fetchProducts
        }}>
            {children}
        </ProductContext.Provider>
    );
};
