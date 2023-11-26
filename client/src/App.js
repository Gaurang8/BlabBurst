import React, { useState, useEffect } from 'react';
import './App.css';
import RegistrationForm from './components/RegistrationForm';
import { AuthContext } from './AuthContext';
import LoginForm from './components/LoginForm';

function App() {

  const [user, setUser] = useState(null);

  const authUser = async () => {

  
    const response = await fetch(`${process.env.REACT_APP_BACKEND_ADDR}/auth/auth/`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
      credentials: "include",
    });

    const result = await response.json();

    if (response.ok) {
      console.log("user is authenticated");
      console.log(result.user);
       return result.user;

    } else {
      console.log("error while feaching user");
      return false;
    }
  };

  const handleLogout = async () => {
    console.log("logout");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_ADDR}/auth/logout`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
          },
          credentials: "include",
        }
      );
  
      if (response.ok) {
        console.log("logout successfully");
        authUser();
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error while log out", error);
    }
  };


  useEffect(() => {
    const fetchUser = async () => {
      const user = await authUser();
      setUser(user);
    };
    fetchUser();
  }
  , []);

  return (
   <AuthContext.Provider value={{ user, setUser }}>
      <div className="App">
        <LoginForm />
      </div>
    </AuthContext.Provider>
  );
}

export default App;
