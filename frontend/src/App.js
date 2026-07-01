import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [auth, setAuth] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try { setUser(jwtDecode(token)); setAuth(true); }
      catch { localStorage.removeItem('token'); }
    }
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    setAuth(true);
  };

  return (
    <BrowserRouter>
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <nav style={{ marginBottom: '20px' }}>
          <strong style={{ fontSize: '24px' }}>🔍 TraceBack MVP</strong>
          {auth ? <span style={{ marginLeft: '20px' }}>Welcome, {user.name}</span> : <span style={{ marginLeft: '20px' }}>Please Login</span>}
        </nav>
        <Routes>
          <Route path="/" element={
            <div>
              <h2>Pitch Prototype</h2>
              <p>This is a live demo for stakeholders.</p>
              {!auth && <button onClick={() => login('admintester@email.com', 'thisIsATestPassword')} style={{ padding: '10px', background: '#648381', color: 'white', border: 'none', borderRadius: '5px' }}>Quick Login (Admin)</button>}
              {auth && <button onClick={() => { localStorage.removeItem('token'); setAuth(false); }} style={{ padding: '10px' }}>Logout</button>}
            </div>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
export default App;
