import React, { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';
import { ArrowRight, Loader2 } from 'lucide-react';

const CategorySlideshow = ({ category, products }) => {
  const categoryProducts = products.filter(p => p.category === category.name);

  const images = categoryProducts.length > 0
    ? categoryProducts.flatMap(p => [
      p.image_url,
      ...(p.product_variations?.map(v => v.image_url).filter(Boolean) || [])
    ])
    : [category.image_url];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images]);

  return (
    <div className="slideshow-container">
      {images.map((img, idx) => (
        <div
          key={idx}
          className={`slide ${idx === currentIndex ? 'active' : ''}`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}
      <style>{`
                .slideshow-container {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                }
                .slide {
                    position: absolute;
                    inset: 0;
                    background-size: cover;
                    background-position: center;
                    opacity: 0;
                    transition: opacity 1s ease;
                }
                .slide.active {
                    opacity: 1;
                }
            `}</style>
    </div>
  );
};

const Home = ({ onNavigate }) => {
  const { categories, products, loading } = useProducts();

  return (
    <div className="home">
      <section className="hero fade-in">
        <div className="hero-content container">
          <span className="hero-subtitle">EST. 2024</span>
          <h1>Elevate Your Style</h1>
          <p className="hero-desc">Discover our new collection of premium apparel and accessories.</p>
          <button className="btn-primary" onClick={() => onNavigate('shop')}>Shop Collection</button>
        </div>
      </section>

      <section className="featured-categories container">
        <div className="section-header">
          <h2>Our Collections</h2>
          <p>Curated for the modern minimalist.</p>
        </div>

        <div className="categories-grid">
          {loading ? (
            <div className="loading-state">
              <Loader2 className="animate-spin" size={30} />
              <p>Loading Collections...</p>
            </div>
          ) : (
            categories.map(cat => (
              <div
                key={cat.id}
                className="category-card"
                onClick={() => onNavigate('shop')}
              >
                <CategorySlideshow category={cat} products={products} />
                <div className="category-overlay">
                  <h3>{cat.name}</h3>
                  <span className="shop-link">View Collection <ArrowRight size={16} /></span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <style>{`
        .home {
            padding-bottom: 100px;
        }
        .hero {
          height: 80vh;
          min-height: 500px; /* Ensure visibility on small landscape screens */
          background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop');
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: white;
          margin-bottom: 80px;
        }
        .hero-subtitle {
            display: block;
            font-size: 0.9rem;
            letter-spacing: 3px;
            margin-bottom: 20px;
            opacity: 0.9;
        }
        .hero-content h1 {
          font-family: 'Playfair Display', serif;
          font-size: 4.5rem;
          margin-bottom: 20px;
          color: white;
          line-height: 1.1;
        }
        .hero-desc {
          font-family: 'Outfit', sans-serif;
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0 auto 40px;
          opacity: 0.9;
        }

        .section-header {
            text-align: center;
            margin-bottom: 60px;
        }
        .section-header h2 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }
        .category-card {
          position: relative;
          height: 500px;
          overflow: hidden;
          cursor: pointer;
        }

        @media (max-width: 1024px) {
            .categories-grid { grid-template-columns: repeat(2, 1fr); }
            .hero-content h1 { font-size: 3.5rem; }
        }

        @media (max-width: 768px) {
          .categories-grid { grid-template-columns: 1fr; }
          .hero-content h1 { font-size: 2.5rem; }
          .hero { height: auto; padding: 100px 0; }
          .hero-desc { padding: 0 20px; font-size: 1rem; }
          .section-header h2 { font-size: 2rem; }
          .category-card { height: 400px; }
        }
      `}</style>
    </div>
  );
};

export default Home;
