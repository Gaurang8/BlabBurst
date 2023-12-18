import React, { useState } from "react";
import { Link } from "react-router-dom";
import FormInput from "./FormInput";
import "./registration.css";
import logoimg from "../svg/logo192.png";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import {  useDispatch } from "react-redux";
import { login } from "../app/AuthReducer";

const RegistrationForm = () => {


  const dispatch = useDispatch();

  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    file: "",
  });

  const [statePage, setStatePage] = useState(1);

  const CLOUDINARY_UPLOAD_PRESET = "gaurang";

  const inputs = [
    {
      id: 1,
      name: "username",
      type: "text",
      placeholder: "Username",
      errorMessage:
        "Username should be 3-16 characters and shouldn't include any special character!",
      label: "Username",
      pattern: "^[A-Za-z0-9]{3,16}$",
      required: true,
    },
    {
      id: 2,
      name: "email",
      type: "email",
      placeholder: "Email",
      errorMessage: "It should be a valid email address!",
      label: "Email",
      required: true,
    },

    {
      id: 4,
      name: "password",
      type: "password",
      placeholder: "Password",
      errorMessage:
        "Password should be 8-20 characters and include at least 1 letter, 1 number and 1 special character!",
      label: "Password",
      pattern: `^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$`,
      required: true,
    },
    {
      id: 5,
      name: "confirmPassword",
      type: "password",
      placeholder: "Confirm Password",
      errorMessage: "Passwords don't match!",
      label: "Confirm Password",
      pattern: values.password,
      required: true,
    },
  ];

  const input2 = [
    {
      id: 6,
      name: "phone",
      type: "tel",
      placeholder: "Phone Number",
      errorMessage: "Phone Number should be 10 digits!",
      label: "Phone Number",
      pattern: "^[0-9]{10}$",
      required: true,
    },
    {
      id: 7,
      name: "address",
      type: "text",
      placeholder: "Address",
      errorMessage: "Address should be 3-16 characters!",
      label: "Address",
      pattern: "^[A-Za-z0-9]{3,16}$",
      required: false,
    },
    {
      id: 8,
      name: "file",
      type: "file",
      placeholder: "Upload File",
      errorMessage: "Upload a file!",
      label: "Upload File",
      required: false,
    },
  ];

  const handlePageSubmit = async (e) => {
    e.preventDefault();
    if (statePage === 1) {
      setStatePage(2);
    } else {
      try {
        const Finaldata = {
          name: values.username,
          email: values.email,
          password: values.password,
          phone_number: values.phone,
          address: values.address,
          profile_pic: values.file,
        };

        if (values.file) {
          const formData = new FormData();
          formData.append("file", values.file);
          formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

          await fetch(process.env.REACT_APP_CLOUDINARY_URL, {
            method: "POST",
            body: formData,
          })
            .then((response) => response.json())
            .then(async (data) => {
              console.log(data);
              if (data.secure_url !== "") {
                Finaldata.profile_pic = data.secure_url;
                try {
                  handleFormSubmit(Finaldata);
                } catch (err) {
                  console.log(err);
                }
              }
            })

            .catch((err) => console.log(err));
        } else {
          try {
            handleFormSubmit(Finaldata);
          } catch (err) {
            console.log(err);
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleFormSubmit = (data) => {
    try {
      fetch(`${process.env.REACT_APP_BACKEND_ADDR}/auth/register`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          dispatch(login(data?.user));
          setValues({
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            address: "",
            file: "",
          });
          setStatePage(1);
        });
    } catch (err) {
      console.log(err);
    }
  };

 const onChange = (e) => {
  if (e.target.name === "file") {
    const file = e.target.files[0];
    console.log(file.name);
    setValues({ ...values, file: file });
  } else {
    setValues({ ...values, [e.target.name]: e.target.value });
  }
};


  return (
    <>
      <form className="registration-form" onSubmit={handlePageSubmit}>
        <h1>
          {" "}
          <img src={logoimg} />
          <span>BlabBurst</span>
        </h1>
        {statePage === 1 ? (
          <>
            {inputs.map((input) => (
              <FormInput
                key={input.id}
                {...input}
                value={values[input.name]}
                onChange={onChange}
              />
            ))}
            <button className="full-btn">Submit</button>
            <p className="bottom-text">
              Already have an account?
              <Link to="/login">
                {" "}
                <span> Login</span>
              </Link>
            </p>
          </>
        ) : (
          <>
            {input2.map((input) => (
              
              input.name === "file" ? (
                <FormInput
                key={input.id}
                {...input}
                onChange={onChange}
              />
              ) : (
                <FormInput
                key={input.id}
                {...input}
                value={values[input.name]}
                onChange={onChange}
              />
              )

            ))}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={() => setStatePage(1)}
                className="half-secondary-btn"
              >
                {" "}
                <KeyboardBackspaceIcon /> Prev
              </button>
              <button className="half-primary-btn">Submit</button>
            </div>
            <p className="bottom-text">
              Already have an account?
              <Link to="/login">
                {" "}
                <span> Login</span>
              </Link>
            </p>
          </>
        )}
      </form>
    </>
  );
};

export default RegistrationForm;
