import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import {
  LayoutDashboard, ShoppingBag, Package, Users, Truck,
  CreditCard, BarChart2, FileText, MessageSquare, Settings,
  Menu, X, Plus, Trash2, Upload, Loader2, Image as ImageIcon, Edit2, Check,
  ClipboardList, DollarSign
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const Admin = () => {
  const {
    products, deleteProduct, addProduct, updateProduct,
    loading
  } = useProducts();

  const [activeTab, setActiveTab] = useState('Products');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Product Management State
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const DEFAULT_CATEGORIES = ['Clothes', 'Bags', 'Jewellery'];

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Clothes',
    price: '',
    description: '',
    image_url: ''
  });

  const [variations, setVariations] = useState([]);

  // --- Product Handlers ---

  const handleFileUpload = async (e, target = 'product', index = null) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      if (target === 'product') {
        setNewProduct({ ...newProduct, image_url: publicUrl });
      } else if (target === 'variation' && index !== null) {
        const updatedVariations = [...variations];
        updatedVariations[index].image_url = publicUrl;
        setVariations(updatedVariations);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const addVariationField = () => {
    setVariations([...variations, { name: '', variation_type: 'Custom', image_url: '', price_override: '' }]);
  };

  const updateVariationField = (index, field, value) => {
    const updated = [...variations];
    updated[index][field] = value;
    setVariations(updated);
  };

  const removeVariation = (index) => {
    setVariations(variations.filter((_, i) => i !== index));
  };

  const startEditing = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      image_url: product.image_url
    });
    setVariations(product.product_variations?.map(v => ({
      name: v.name,
      variation_type: v.variation_type || 'Custom',
      image_url: v.image_url,
      price_override: v.price_override || ''
    })) || []);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setNewProduct({ name: '', category: 'Clothes', price: '', description: '', image_url: '' });
    setVariations([]);
    setShowForm(false);
  };

  const handleProductSubmit = async () => {
    if (!newProduct.image_url) return alert('Main product image is required.');

    try {
      const formattedVariations = variations.map(v => ({
        ...v,
        price_override: v.price_override ? parseFloat(v.price_override) : null
      }));

      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          ...newProduct,
          price: parseFloat(newProduct.price)
        }, formattedVariations);
      } else {
        await addProduct({
          ...newProduct,
          price: parseFloat(newProduct.price)
        }, formattedVariations);
      }
      cancelEditing();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  // --- Sidebar Menu Items ---
  const menuItems = [
    { id: 'Dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'Sales', icon: DollarSign, label: 'Sales' },
    { id: 'Products', icon: Package, label: 'Products' },
    { id: 'Inventory', icon: ClipboardList, label: 'Inventory' },
    { id: 'Customers', icon: Users, label: 'Customers' },
    { id: 'Suppliers', icon: Truck, label: 'Suppliers' },
    { id: 'Orders', icon: ShoppingBag, label: 'Orders & Delivery' },
    { id: 'Expenses', icon: CreditCard, label: 'Expenses' },
    { id: 'Analytics', icon: BarChart2, label: 'Analytics' },
    { id: 'Reports', icon: FileText, label: 'Reports' },
    { id: 'Chat', icon: MessageSquare, label: 'Chat History' },
    { id: 'Settings', icon: Settings, label: 'Settings' },
  ];

  // --- Content Renderers ---

  const renderProductsContent = () => (
    <div className="products-view fade-in">
      <header className="content-header">
        <div>
          <h2>Product Management</h2>
          <p>Add, edit, and organize your store's inventory.</p>
        </div>
        <button
          className={editingProduct ? "btn-accent" : "btn-primary"}
          onClick={editingProduct ? cancelEditing : () => setShowForm(!showForm)}
        >
          {editingProduct ? 'Cancel Edit' : (showForm ? 'Cancel' : 'Add New Product')}
        </button>
      </header>

      {showForm && (
        <div className="admin-form fade-in">
          <div className="form-title">
            <h3>{editingProduct ? 'Edit Product' : 'New Product Entry'}</h3>
          </div>

          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              value={newProduct.name}
              onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
              placeholder="e.g. Silk Blouse"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                value={newProduct.category}
                onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
              >
                {DEFAULT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Price ($)</label>
              <input
                type="number" step="0.01"
                value={newProduct.price}
                onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Main Image</label>
            <div className="upload-box">
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'product')} id="p-upload" hidden />
              <label htmlFor="p-upload" className="upload-label">
                {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                <span>{newProduct.image_url ? 'Change Image' : 'Upload Image'}</span>
              </label>
              {newProduct.image_url && <img src={newProduct.image_url} alt="" className="upload-preview" />}
            </div>
          </div>

          <div className="variations-section">
            <div className="section-header">
              <h4>Variations (Optional)</h4>
              <button className="btn-small" onClick={addVariationField}>
                <Plus size={14} /> Add Variation
              </button>
            </div>

            <div className="variations-list">
              {variations.map((v, index) => (
                <div key={index} className="variation-row">
                  <div className="variation-inputs">
                    <select
                      className="v-type-select"
                      value={v.variation_type || 'Custom'}
                      onChange={(e) => updateVariationField(index, 'variation_type', e.target.value)}
                    >
                      <option value="Custom">Custom</option>
                      <option value="Color">Color</option>
                      <option value="Size">Size</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Name (e.g. Red, XL)"
                      value={v.name}
                      onChange={(e) => updateVariationField(index, 'name', e.target.value)}
                    />
                    <input
                      type="number" step="0.01"
                      placeholder="Price Override"
                      value={v.price_override}
                      onChange={(e) => updateVariationField(index, 'price_override', e.target.value)}
                    />
                    <div className="v-upload-mini">
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'variation', index)} id={`v-upload-${index}`} hidden />
                      <label htmlFor={`v-upload-${index}`} className={v.image_url ? "has-img" : ""}>
                        {v.image_url ? <Check size={14} /> : <ImageIcon size={14} />}
                      </label>
                    </div>
                  </div>
                  <button className="v-del-btn" onClick={() => removeVariation(index)}>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              rows="3"
              value={newProduct.description}
              onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
            ></textarea>
          </div>

          <button onClick={handleProductSubmit} className="btn-primary submit-btn" disabled={uploading}>
            {uploading ? 'Processing...' : (editingProduct ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      )}

      <div className="product-list-container">
        {loading ? (
          <div className="loading-center"><Loader2 className="animate-spin" /></div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Variations</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td><img src={product.image_url} alt="" className="table-thumb" /></td>
                  <td className="fw-500">{product.name}</td>
                  <td><span className="cat-badge">{product.category}</span></td>
                  <td>
                    <div className="v-tags">
                      {product.product_variations?.length > 0
                        ? product.product_variations.map(v => (
                          <span key={v.id} className="v-badge">{v.name}</span>
                        ))
                        : <span className="text-muted">-</span>
                      }
                    </div>
                  </td>
                  <td>${product.price?.toFixed(2)}</td>
                  <td className="action-cell">
                    <button className="icon-action" onClick={() => startEditing(product)}><Edit2 size={18} /></button>
                    <button className="icon-action delete" onClick={() => deleteProduct(product.id)}><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const renderPlaceholder = (title, icon) => (
    <div className="placeholder-view fade-in">
      <div className="placeholder-content">
        {React.createElement(icon, { size: 60, strokeWidth: 1, className: "placeholder-icon" })}
        <h2>{title}</h2>
        <p>This module is currently under development.</p>
      </div>
    </div>
  );

  return (
    <div className="admin-layout">
      {/* Mobile Header */}
      <div className="admin-mobile-header">
        <button onClick={() => setMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>
        <h2>AURA LUXE Admin</h2>
      </div>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>AURA LUXE</h3>
          <span className="sidebar-subtitle">Management Console</span>
          <button className="close-sidebar" onClick={() => setMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-user">
            <div className="admin-avatar">A</div>
            <div className="admin-info">
              <span className="name">Admin User</span>
              <span className="role">Super Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* Main Content */}
      <main className="admin-main">
        {activeTab === 'Products'
          ? renderProductsContent()
          : renderPlaceholder(menuItems.find(i => i.id === activeTab)?.label, menuItems.find(i => i.id === activeTab)?.icon)
        }
      </main>

      <style>{`
            .admin-layout {
                display: flex;
                min-height: 100vh;
                background: #f4f4f4;
            }

            /* Sidebar Styles */
            .admin-sidebar {
                width: 260px;
                background: white;
                border-right: 1px solid #eee;
                display: flex;
                flex-direction: column;
                position: fixed;
                height: 100vh;
                z-index: 1000;
                transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }
            
            .sidebar-header {
                padding: 30px 24px;
                border-bottom: 1px solid #f0f0f0;
            }
            .sidebar-header h3 {
                font-family: 'Playfair Display', serif;
                font-size: 1.5rem;
                margin-bottom: 5px;
            }
            .sidebar-subtitle {
                font-size: 0.8rem;
                color: #999;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .close-sidebar {
                display: none;
                position: absolute;
                top: 20px;
                right: 20px;
                background: none;
                color: #666;
            }

            .sidebar-nav {
                flex: 1;
                padding: 20px 0;
                overflow-y: auto;
            }
            .nav-item {
                display: flex;
                align-items: center;
                gap: 15px;
                width: 100%;
                padding: 15px 24px;
                background: none;
                border: none;
                text-align: left;
                color: #666;
                transition: all 0.2s;
                cursor: pointer;
                font-size: 0.95rem;
            }
            .nav-item:hover {
                background: #f9f9f9;
                color: var(--primary);
                padding-left: 28px;
            }
            .nav-item.active {
                background: #f0f0f0;
                color: var(--primary);
                font-weight: 500;
                border-right: 3px solid var(--primary);
            }

            .sidebar-footer {
                padding: 20px;
                border-top: 1px solid #f0f0f0;
            }
            .admin-user {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .admin-avatar {
                width: 40px;
                height: 40px;
                background: var(--primary);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            }
            .admin-info {
                display: flex;
                flex-direction: column;
            }
            .admin-info .name { font-weight: 500; font-size: 0.9rem; }
            .admin-info .role { font-size: 0.75rem; color: #999; }

            /* Main Content Styles */
            .admin-main {
                flex: 1;
                margin-left: 260px; /* Sidebar width */
                padding: 40px;
                height: 100vh;
                overflow-y: auto;
            }

            .admin-mobile-header {
                display: none;
                padding: 20px;
                background: white;
                border-bottom: 1px solid #eee;
                align-items: center;
                gap: 20px;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 999;
            }
            .admin-mobile-header button { background: none; }
            .admin-mobile-header h2 { font-size: 1.2rem; margin: 0; font-family: 'Playfair Display', serif; }

            /* Content Header */
            .content-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                margin-bottom: 40px;
            }
            .content-header h2 { font-size: 2rem; margin-bottom: 5px; font-family: 'Playfair Display', serif; }
            .content-header p { color: #666; }

            /* Forms & Tables (Restored Styles) */
            .admin-form { 
                background: white; 
                padding: 40px; 
                margin-bottom: 60px; 
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.03);
            }
            .form-title { margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
            
            .form-group { margin-bottom: 20px; }
            .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            
            label { display: block; margin-bottom: 8px; font-size: 0.9rem; font-weight: 500; }
            input, select, textarea {
                width: 100%; padding: 12px; border: 1px solid #ddd;
                font-family: 'Outfit', sans-serif;
                background: white;
                border-radius: 4px;
            }
            input:focus, select:focus, textarea:focus { border-color: var(--primary); outline: none; }
            
            .upload-box { display: flex; gap: 20px; align-items: center; }
            .upload-label {
                border: 1px dashed #ccc; padding: 10px 20px; display: flex; align-items: center; gap: 10px; cursor: pointer; background: white; transition: all 0.2s; border-radius: 4px;
            }
            .upload-label:hover { border-color: var(--primary); color: var(--primary); }
            .upload-preview { width: 60px; height: 60px; object-fit: cover; border: 1px solid #ddd; border-radius: 4px; }
            
            .variations-section { background: #fcfcfc; padding: 20px; border: 1px solid #eee; margin: 30px 0; border-radius: 8px; }
            .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
            .section-header h4 { font-size: 1rem; }
            .btn-small { display: flex; align-items: center; gap: 5px; font-size: 0.8rem; background: white; padding: 8px 15px; border: 1px solid #eee; border-radius: 4px; cursor: pointer; }
            .btn-small:hover { background: #f0f0f0; }
            
            .variation-row { display: flex; gap: 10px; margin-bottom: 10px; align-items: center; }
            .variation-inputs { display: grid; grid-template-columns: 140px 1fr 120px 50px; gap: 10px; flex: 1; }
            .v-upload-mini { display: flex; align-items: center; justify-content: center; }
            .v-upload-mini label { 
                margin: 0; width: 35px; height: 35px; border: 1px solid #ddd; 
                display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: 4px;
                background: white;
            }
            .v-upload-mini label.has-img { background: #e8f5e9; color: green; border-color: green; }
            .v-del-btn { color: #999; padding: 5px; background: none; border: none; cursor: pointer; }
            .v-del-btn:hover { color: #ff4444; }
            
            .submit-btn { width: 100%; margin-top: 20px; }

            /* Table Styles */
            .product-list-container {
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0,0,0,0.03);
            }
            .admin-table { width: 100%; border-collapse: collapse; }
            .admin-table th { text-align: left; padding: 20px; background: #fafafa; font-weight: 500; font-size: 0.9rem; color: #666; border-bottom: 1px solid #eee; }
            .admin-table td { padding: 20px; border-bottom: 1px solid #eee; vertical-align: middle; }
            .table-thumb { width: 50px; height: 50px; object-fit: cover; border-radius: 4px; }
            .cat-badge { background: #f0f0f0; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; }
            .v-badge { background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; margin-right: 5px; display: inline-block; margin-bottom: 2px; }
            .icon-action { background: none; color: #666; padding: 8px; margin-right: 5px; border: none; cursor: pointer; border-radius: 4px; transition: all 0.2s; }
            .icon-action:hover { background: #f0f0f0; color: var(--primary); }
            .icon-action.delete:hover { background: #fff1f1; color: #ff4444; }
            
            .text-muted { color: #ccc; }
            .fw-500 { font-weight: 500; }
            .loading-center { text-align: center; padding: 50px; }

            /* Placeholder Styles */
            .placeholder-view {
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                border: 2px dashed #e0e0e0;
                border-radius: 8px;
                min-height: 400px;
            }
            .placeholder-content { max-width: 400px; }
            .placeholder-icon { color: #ddd; margin-bottom: 20px; }
            .placeholder-content h2 { font-size: 2rem; margin-bottom: 10px; font-family: 'Playfair Display', serif; }
            .placeholder-content p { color: #999; }

            /* Mobile Responsive */
            @media (max-width: 900px) {
                .admin-sidebar {
                    transform: translateX(-100%);
                }
                .admin-sidebar.open {
                    transform: translateX(0);
                }
                .close-sidebar { display: block; }
                
                .admin-main {
                    margin-left: 0;
                    padding: 80px 20px 40px; /* Top padding for mobile header */
                }
                .admin-mobile-header { display: flex; }
                
                .sidebar-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    z-index: 999;
                }
                
                .form-row { grid-template-columns: 1fr; }
                .variation-inputs { grid-template-columns: 1fr; }
                .variation-row { flex-direction: column; align-items: flex-start; background: white; padding: 15px; border: 1px solid #eee; }
                .v-del-btn { align-self: flex-end; }
                
                .product-list-container { overflow-x: auto; }
                .admin-table { min-width: 800px; }
            }
        `}</style>
    </div>
  );
};

export default Admin;
