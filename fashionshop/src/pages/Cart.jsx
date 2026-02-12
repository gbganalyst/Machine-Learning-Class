import React from 'react';
import { useProducts } from '../context/ProductContext';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

const Cart = () => {
  const { cart, removeFromCart, updateCartQuantity } = useProducts();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const cartStyles = `
    .cart-page {
        padding: 60px 24px 100px;
    }
    .cart-page h1 {
        font-size: 2.5rem;
        margin-bottom: 40px;
        text-align: center;
    }
    
    .cart-layout {
        display: grid;
        grid-template-columns: 1fr 350px;
        gap: 60px;
    }
    
    .cart-header-row {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr;
        padding-bottom: 15px;
        border-bottom: 1px solid #eee;
        font-weight: 500;
        color: var(--text-light);
        text-transform: uppercase;
        font-size: 0.8rem;
        letter-spacing: 1px;
    }
    
    .cart-item {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr;
        align-items: center;
        padding: 30px 0;
        border-bottom: 1px solid #eee;
    }
    
    .item-info {
        display: flex;
        gap: 20px;
    }
    .item-info img {
        width: 80px;
        height: 100px;
        object-fit: cover;
    }
    .item-info h3 {
        font-family: 'Outfit', sans-serif;
        font-size: 1rem;
        margin-bottom: 5px;
    }
    .item-price {
        color: var(--text-light);
    }
    .item-variant {
        font-size: 0.85rem;
        color: var(--text-light);
        margin-top: 5px;
    }

    .quantity-controls {
        display: flex;
        align-items: center;
        gap: 15px;
    }
    .quantity-controls button {
        background: #f4f4f4;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }
    .quantity-controls button:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }
    
    .item-total {
        font-weight: 700;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .remove-btn {
        background: none;
        color: #999;
        padding: 5px;
    }
    .remove-btn:hover {
        color: #ff4444;
    }
    .remove-btn-mobile {
        display: none;
    }
    
    .cart-summary {
        background: #f9f9f9;
        padding: 30px;
        height: fit-content;
    }
    .cart-summary h3 {
        font-size: 1.2rem;
        margin-bottom: 20px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 15px;
    }
    .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
        color: var(--text-light);
    }
    .summary-divider {
        height: 1px;
        background: #ddd;
        margin: 20px 0;
    }
    .summary-total {
        display: flex;
        justify-content: space-between;
        font-weight: 700;
        font-size: 1.2rem;
        margin-bottom: 30px;
    }
    .checkout-btn {
        width: 100%;
    }
    
    .empty-cart-container {
        min-height: 60vh;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
    }
    .empty-cart-content {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 30px;
        max-width: 400px;
    }
    .empty-icon {
        color: var(--text-light);
        margin-bottom: 10px;
    }
    .empty-cart-content h2 {
        font-family: 'Playfair Display', serif;
        font-size: 2rem;
        color: var(--text);
    }
    .empty-cart-content p {
        color: var(--text-light);
        margin-bottom: 20px;
        line-height: 1.6;
    }

    @media (max-width: 900px) {
        .cart-layout { grid-template-columns: 1fr; }
        .cart-header-row { display: none; }
        .cart-item { 
            grid-template-columns: 1fr; 
            gap: 15px;
            position: relative;
            align-items: flex-start;
            padding: 20px 0;
        }
        .item-info { width: 100%; }
        .quantity-controls { margin-top: 10px; }
        .item-total { 
            position: absolute;
            bottom: 20px;
            right: 0;
            font-size: 1.1rem;
        }
        .remove-btn { display: none; }
        .remove-btn-mobile {
            display: block;
            background: none;
            text-decoration: underline;
            color: #999;
            font-size: 0.8rem;
            margin-left: 15px;
        }
    }
  `;

  if (cart.length === 0) {
    return (
      <div className="empty-cart-container container">
        <div className="empty-cart-content">
          <ShoppingBag size={64} strokeWidth={1} className="empty-icon" />
          <h2>Your bag is currently empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <button className="btn-primary" onClick={() => window.location.href = '/shop'}>Continue Shopping</button>
        </div>
        <style>{cartStyles}</style>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      <h1>Shopping Bag</h1>

      <div className="cart-layout">
        <div className="cart-items">
          <div className="cart-header-row">
            <span>Product</span>
            <span>Quantity</span>
            <span>Total</span>
          </div>

          {cart.map(item => (
            <div key={item.cartItemId} className="cart-item">
              <div className="item-info">
                <img src={item.image_url} alt={item.name} />
                <div>
                  <h3>{item.name}</h3>
                  <p className="item-price">${item.price.toFixed(2)}</p>
                  {item.selectedVariation && (
                    <p className="item-variant">Style: {item.selectedVariation.name}</p>
                  )}
                </div>
              </div>

              <div className="quantity-controls">
                <button onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)} disabled={item.quantity <= 1}>
                  <Minus size={16} />
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)}>
                  <Plus size={16} />
                </button>

                <button className="remove-btn-mobile" onClick={() => removeFromCart(item.cartItemId)}>Remove</button>
              </div>

              <div className="item-total">
                ${(item.price * item.quantity).toFixed(2)}
                <button className="remove-btn" onClick={() => removeFromCart(item.cartItemId)}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button className="btn-primary checkout-btn">Proceed to Checkout</button>
        </div>
      </div>

      <style>{cartStyles}</style>
    </div>
  );
};

export default Cart;
