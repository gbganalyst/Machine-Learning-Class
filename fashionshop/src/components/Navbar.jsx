import React, { useState } from 'react';
import { ShoppingBag, Search, User, Menu, X, LogOut } from 'lucide-react';
import { useProducts } from '../context/ProductContext';

const Navbar = ({ onNavigate, currentPage, user, onLogout }) => {
  const { cart } = useProducts();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleNavigate = (page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar glass">
      <div className="container nav-content">
        <div className="logo" onClick={() => handleNavigate('home')}>
          AURA LUXE
        </div>

        {/* Desktop Links */}
        <div className="nav-links">
          <button
            className={currentPage === 'home' ? 'active' : ''}
            onClick={() => handleNavigate('home')}
          >
            Home
          </button>
          <button
            className={currentPage === 'shop' ? 'active' : ''}
            onClick={() => handleNavigate('shop')}
          >
            Shop
          </button>
          <button className="nav-link-disabled">Collections</button>
          <button className="nav-link-disabled">Journal</button>
        </div>

        <div className="nav-actions">
          <button className="icon-btn search-btn">
            <Search size={20} />
          </button>

          <button onClick={() => handleNavigate('cart')} className="cart-btn">
            <ShoppingBag size={20} />
            {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
          </button>

          {/* User Menu - Desktop */}
          <div className="desktop-user-menu">
            {user ? (
              <div className="user-menu-items">
                <span className="user-email" onClick={() => handleNavigate('admin')}>{user.email.split('@')[0]}</span>
                <button onClick={onLogout} className="logout-btn"><LogOut size={16} /></button>
              </div>
            ) : (
              <button onClick={() => handleNavigate('login')} className="icon-btn">
                <User size={20} />
              </button>
            )}
          </div>

          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <span className="logo">AURA LUXE</span>
          <button onClick={() => setMobileMenuOpen(false)}><X size={24} /></button>
        </div>
        <div className="drawer-links">
          <button onClick={() => handleNavigate('home')} className={currentPage === 'home' ? 'active' : ''}>Home</button>
          <button onClick={() => handleNavigate('shop')} className={currentPage === 'shop' ? 'active' : ''}>Shop</button>
          <button className="nav-link-disabled">Collections</button>
          <button className="nav-link-disabled">Journal</button>

          <div className="drawer-divider"></div>

          {user ? (
            <>
              <button onClick={() => handleNavigate('admin')}>Dashboard</button>
              <button onClick={() => { onLogout(); setMobileMenuOpen(false); }}>Logout</button>
            </>
          ) : (
            <button onClick={() => handleNavigate('login')}>Sign In</button>
          )}
        </div>
      </div>

      {mobileMenuOpen && <div className="drawer-overlay" onClick={() => setMobileMenuOpen(false)}></div>}

      <style>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 20px 0;
          transition: all 0.3s ease;
        }
        .nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 1px;
          color: var(--primary);
        }
        
        /* Desktop styles */
        .nav-links {
          display: flex;
          gap: 40px;
        }
        .nav-links button {
          background: none;
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-light);
          position: relative;
        }
        .nav-links button:hover, .nav-links button.active {
          color: var(--primary);
        }
        .nav-links button.active::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 100%;
          height: 1px;
          background: var(--primary);
        }
        .nav-link-disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .icon-btn {
          background: none;
          color: var(--primary);
          padding: 5px;
        }
        .cart-btn {
          position: relative;
          background: none;
          color: var(--primary);
          padding: 5px;
        }
        .cart-count {
          position: absolute;
          top: -5px;
          right: -5px;
          background: var(--primary);
          color: white;
          font-size: 0.6rem;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .desktop-user-menu {
            display: flex;
            align-items: center;
        }
        .user-menu-items {
            display: flex;
            align-items: center;
            gap: 15px;
            font-size: 0.9rem;
        }
        .user-email {
            cursor: pointer;
            font-weight: 500;
        }
        .logout-btn {
            background: none;
            color: var(--text-light);
            padding: 5px;
        }
        .logout-btn:hover { color: #ff4444; }

        .mobile-menu-btn {
            display: none;
            background: none;
            color: var(--primary);
        }

        /* Mobile Drawer */
        .mobile-drawer {
            position: fixed;
            top: 0;
            right: -300px;
            width: 300px;
            height: 100vh;
            background: white;
            z-index: 1002;
            padding: 30px;
            transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: -5px 0 20px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
        }
        .mobile-drawer.open {
            right: 0;
        }
        .drawer-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 50px;
        }
        .drawer-links {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .drawer-links button {
            background: none;
            text-align: left;
            font-size: 1.2rem;
            font-family: 'Playfair Display', serif;
            color: var(--text);
            padding: 10px 0;
        }
        .drawer-links button.active {
            color: var(--accent);
            font-style: italic;
        }
        .drawer-divider {
            height: 1px;
            background: #eee;
            margin: 20px 0;
        }
        .drawer-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 1001;
            backdrop-filter: blur(2px);
        }

        @media (max-width: 768px) {
            .nav-links { display: none; }
            .desktop-user-menu { display: none; }
            .mobile-menu-btn { display: block; }
            .search-btn { display: none; } /* Hide search on mobile to save space for now */
            .logo { font-size: 1.2rem; }
            .navbar { padding: 15px 0; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
