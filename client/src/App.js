import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

import { useDispatch , useSelector } from 'react-redux';
import {login ,logout , loginError } from './app/AuthReducer';

import './App.css';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import Home from './pages/Home';

import {SocketProvider} from './SocketContext';

function App() {

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  
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
      // console.log('user is authenticated');
      // console.log(result.user);
      dispatch(login(result?.user))
      return result.user;
    } else {
      console.log('error while fetching user');
      dispatch(loginError())
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
        dispatch(logout())
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error while log out', error);
    }
  };


  useEffect(() => {
    authUser();
  } 
  , []);

  return (
    <div className='main-web-div'>
      <BrowserRouter>
        <SocketProvider>
        <Routes>
          {!isAuthenticated && (
            <>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegistrationForm />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          )}

          {isAuthenticated && (
            <>
              <Route path='/login' element={<Navigate to="/home" />} />
              <Route path='/register' element={<Navigate to="/home" />} />
              <Route path="/home" element={<Home />} />
              <Route path="/home/:id" element={<Home />} />
            </>
          )}
        </Routes>
        </SocketProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
