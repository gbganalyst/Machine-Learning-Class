import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Admin from './pages/Admin'
import Cart from './pages/Cart'
import Login from './pages/Login'
import { ProductProvider } from './context/ProductContext'
import { supabase } from './supabaseClient'

function App() {
    const [currentPage, setCurrentPage] = useState('home');
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const renderPage = () => {
        switch (currentPage) {
            case 'home': return <Home onNavigate={setCurrentPage} />;
            case 'shop': return <Shop />;
            case 'admin': return user ? <Admin /> : <Login onLoginSuccess={() => setCurrentPage('admin')} />;
            case 'cart': return <Cart />;
            case 'login': return <Login onLoginSuccess={() => setCurrentPage('admin')} />;
            default: return <Home onNavigate={setCurrentPage} />;
        }
    }

    return (
        <ProductProvider>
            <div className="app">
                <Navbar onNavigate={setCurrentPage} currentPage={currentPage} user={user} />
                <main>
                    {renderPage()}
                </main>
            </div>
        </ProductProvider>
    )
}

export default App
