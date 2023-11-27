import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import './App.css';
import RegistrationForm from './components/RegistrationForm';
import { AuthContext } from './AuthContext';
import LoginForm from './components/LoginForm';
import Home from './pages/Home';

function App() {
  const [user, setUser] = useState(null);
  // const navigate = useNavigate();

  const authUser = async () => {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_ADDR}/auth/auth/`, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
      },
      credentials: 'include',
    });

    const result = await response.json();

    if (response.ok) {
      console.log('user is authenticated');
      console.log(result.user);
      return result.user;
    } else {
      console.log('error while fetching user');
      return null;
    }
  };

  const handleLogout = async () => {
    console.log('logout');
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_ADDR}/auth/logout`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        console.log('logout successfully');
        authUser();
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error while log out', error);
    }
  };

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     const authenticatedUser = await authUser();
  //     setUser(authenticatedUser);

  //     if (authenticatedUser) {
  //       navigate('/home');
  //     } else {
  //       navigate('/login');
  //     }
  //   };
  //   fetchUser();
  // }, [navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      const authenticatedUser = await authUser();
      setUser(authenticatedUser);
    };
    fetchUser();
  } 
  , []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <Routes>
          {!user && (
            <>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegistrationForm />} />
              <Route path="/" element={<Navigate to="/login" />} />
            </>
          )}

          {user && (
            <>
              <Route path='/login' element={<Navigate to="/home" />} />
              <Route path='/register' element={<Navigate to="/home" />} />
              <Route path="/home" element={<Home />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
