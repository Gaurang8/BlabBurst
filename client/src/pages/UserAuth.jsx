// UserAuth.jsx

import React, { useState } from "react";
import LoginForm from "./LoginForm";
import RegistrationForm from "./RegistrationForm";

const UserAuth = () => {
  const [loginPage, setLoginPage] = useState(true);

  const handletoggleLoginPage = () => {
    console.log("toggle");
    setLoginPage((prevLoginPage) => !prevLoginPage);
  };

  return loginPage ? (
    <LoginForm setLoginPage={setLoginPage} />
  ) : (
    <RegistrationForm setLoginPage={setLoginPage} />
  );
};

export default UserAuth;
