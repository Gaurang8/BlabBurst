import React from 'react'
import { useState , useContext} from 'react'
import FormInput from './FormInput'
import logoimg from '../svg/logo192.png'
import './registration.css'
import { AuthContext } from '../AuthContext'

const LoginForm = ({setLoginPage}) => {
    const [values, setValues] = useState({
        emailphone: "",
        password: "",
      });

    const {user , setUser} = useContext(AuthContext)



    const inputs = [
        {
            id: 2,
            name: "emailphone",
            type: "text",
            placeholder: "Enter Email or Phone Number",
            errorMessage: "It should be a valid text",
            label: "Email or Phone Number",
            required: true,
          }
     ,     {
            id: 4,
            name: "password",
            type: "password",
            placeholder: "Password",
            errorMessage:
              "Password should be valid text",
            label: "Password",
            required: true,
          },
    ]

    const handleLogin = (e) => {
        e.preventDefault();

        const { emailphone, password } = values;

        fetch("http://localhost:8000/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" ,
        },
          credentials: "include",
        body: JSON.stringify({ emailphone, password }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setValues({
                emailphone: "",
                password: "",
                });
                setUser(data?.user)
            });
      }


    
  const onChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  return (
    <form className="registration-form" onSubmit={handleLogin}>
        <h1>
          {" "}
          <img src={logoimg} />
          <span>BlabBurst</span>
        </h1>
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
              Don't have an account? 
              <span onClick={()=>{setLoginPage(false)}}>Create One</span>

            </p>
    </form>
  )
}

export default LoginForm