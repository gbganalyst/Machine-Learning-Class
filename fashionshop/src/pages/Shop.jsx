import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { ShoppingBag, Loader2 } from 'lucide-react';

const ProductCard = ({ product, addToCart }) => {
  const [selectedVar, setSelectedVar] = useState(null);
  const [activeImage, setActiveImage] = useState(product.image_url);
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, selectedVar);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleSelectVariation = (v) => {
    setSelectedVar(v);
    if (v.image_url) setActiveImage(v.image_url);
  };

  // Group variations by type
  const groupedVariations = (product.product_variations || []).reduce((acc, v) => {
    const type = v.variation_type || 'Custom';
    if (!acc[type]) acc[type] = [];
    acc[type].push(v);
    return acc;
  }, {});

  return (
    <div
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="product-image-container">
        <img src={activeImage} alt={product.name} className="product-image" />
        {isHovered && (
          <button
            className="quick-add-btn fade-in"
            onClick={handleAddToCart}
            disabled={isAdded}
          >
            {isAdded ? 'Added to Cart' : 'Add to Bag'}
          </button>
        )}
      </div>

      <div className="product-info">
        <div className="info-header">
          <h3>{product.name}</h3>
          <span className="price">${(selectedVar?.price_override || product.price || 0).toFixed(2)}</span>
        </div>
        <p className="category-tag">{product.category}</p>

        {/* Selected Variation Name Display */}
        {selectedVar && (
          <p className="selected-var-name">
            {selectedVar.variation_type || 'Selected'}: <span>{selectedVar.name}</span>
          </p>
        )}

        <div className="variations-container">
          {Object.entries(groupedVariations).map(([type, vars]) => (
            <div key={type} className="variation-group">
              {Object.keys(groupedVariations).length > 1 && <span className="v-group-label">{type}</span>}
              <div className="v-options">
                {vars.map(v => (
                  type === 'Color' ? (
                    <div
                      key={v.id}
                      className={`v-dot ${selectedVar?.id === v.id ? 'active' : ''}`}
                      onClick={() => handleSelectVariation(v)}
                      style={{ backgroundImage: `url(${v.image_url})` }}
                      title={v.name}
                    />
                  ) : (
                    <button
                      key={v.id}
                      className={`v-btn ${selectedVar?.id === v.id ? 'active' : ''}`}
                      onClick={() => handleSelectVariation(v)}
                    >
                      {v.name}
                    </button>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
                .product-card {
                    cursor: pointer;
                }
                .product-image-container {
                    position: relative;
                    height: 400px;
                    overflow: hidden;
                    margin-bottom: 20px;
                    background: #f4f4f4;
                }
                .product-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }
                .product-card:hover .product-image {
                    transform: scale(1.05);
                }
                .quick-add-btn {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    background: var(--primary);
                    color: white;
                    padding: 15px;
                    text-transform: uppercase;
                    font-size: 0.8rem;
                    letter-spacing: 1px;
                    border: none;
                }
                
                .product-info h3 {
                    font-family: 'Outfit', sans-serif;
                    font-size: 1.1rem;
                    font-weight: 500;
                    color: var(--text);
                }
                .info-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 5px;
                }
                .price {
                    font-weight: 700;
                    color: var(--text);
                }
                .category-tag {
                    color: var(--text-light);
                    font-size: 0.85rem;
                    margin-bottom: 10px;
                }
                .selected-var-name {
                    font-size: 0.85rem;
                    color: var(--text-light);
                    margin-bottom: 8px;
                }
                .selected-var-name span {
                    color: var(--primary);
                    font-weight: 600;
                }
                
                .variations-container {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .variation-group {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .v-group-label {
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    color: #999;
                    letter-spacing: 0.5px;
                }
                .v-options {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                
                .v-dot {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background-size: cover;
                    border: 1px solid #ddd;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .v-dot:hover, .v-dot.active {
                    border-color: var(--primary);
                    box-shadow: 0 0 0 2px white, 0 0 0 3px var(--primary);
                }
                
                .v-btn {
                    background: white;
                    border: 1px solid #ddd;
                    padding: 4px 12px;
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    min-width: 35px;
                    text-transform: uppercase;
                }
                .v-btn:hover, .v-btn.active {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }
            `}</style>
    </div>
  );
};

const Shop = () => {
  const { products, categories, addToCart, loading } = useProducts();
  const [filter, setFilter] = useState('All');

  const filteredProducts = filter === 'All'
    ? products
    : products.filter(p => p.category === filter);

  if (loading) {
    return (
      <div className="loading-container container">
        <Loader2 className="animate-spin" size={30} />
      </div>
    );
  }

  return (
    <div className="shop-page container">
      <header className="shop-header">
        <h1>Shop All</h1>
        <div className="filters">
          <button
            className={filter === 'All' ? 'active' : ''}
            onClick={() => setFilter('All')}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={filter === cat.name ? 'active' : ''}
              onClick={() => setFilter(cat.name)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      <div className="product-grid">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            addToCart={addToCart}
          />
        ))}
      </div>

      <style>{`
                .shop-page {
                    padding: 60px 24px 100px;
                }
                .shop-header {
                    margin-bottom: 60px;
                    text-align: center;
                }
                .shop-header h1 {
                    font-size: 3rem;
                    margin-bottom: 30px;
                }
                .filters {
                    display: flex;
                    justify-content: center;
                    gap: 30px;
                    flex-wrap: wrap; /* allow wrap on smaller desktops if needed */
                }
                .filters button {
                    background: none;
                    text-transform: uppercase;
                    font-size: 0.85rem;
                    letter-spacing: 1px;
                    color: var(--text-light);
                    padding-bottom: 5px;
                    border-bottom: 1px solid transparent;
                    white-space: nowrap;
                }
                .filters button.active, .filters button:hover {
                    color: var(--primary);
                    border-color: var(--primary);
                }
                
                .product-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 40px;
                }
                
                .loading-container {
                    height: 60vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                @media (max-width: 1200px) {
                   .product-grid { grid-template-columns: repeat(3, 1fr); }
                }

                @media (max-width: 900px) {
                    .product-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
                     .shop-page { padding: 40px 20px; }
                }

                @media (max-width: 600px) {
                    .product-grid { grid-template-columns: 1fr; }
                    .shop-header h1 { font-size: 2.5rem; }
                    
                    .filters {
                        justify-content: flex-start;
                        overflow-x: auto;
                        padding-bottom: 15px;
                        gap: 20px;
                        -webkit-overflow-scrolling: touch;
                    }
                    .filters::-webkit-scrollbar { display: none; }
                }
            `}</style>
    </div>
  );
};

export default Shop;
