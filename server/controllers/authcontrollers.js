const {
    generateToken,
    hashPassword,
    comparePasswords,
  } = require("../utiles/authutiles.js");
  const User = require("../modals/usermodal.js");
  
  async function register(req, res) {
   
    try {
      const { name, email, password, phone_number , address , profile_pic } = req.body;
      console.log(req.body);
      if (!(email && password && name)) {
        return res.status(400).send("All input is required");
      }
  
      const oldUser = await User.findOne({ email }) || await User.findOne({ phone_number }) ;
  
      if (oldUser) {
        return res.status(409).send("User Already Exists, login to continue");
      }
  
      const encryptedPassword = await hashPassword(password);
  
  
      const newUser = await User.create({
        name,
        email,
        password: encryptedPassword,
        phone_number,
        address,
        profile_pic,
        connected_users: []
      });
  
      const token = generateToken(newUser._id, newUser.email);
  
      console.log("token is", token);
  
      const expirationDate = new Date(Date.now() + 15 * 24 * 3600 * 1000)
  
      res.cookie("token", token, { expires: expirationDate, sameSite: "None", secure: true });
  
      console.log(newUser);
      res.status(201).json({ user: newUser, message: "Registered successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).send("An error occurred while registering");
    }
  }
  
  async function login(req, res) {
    
    try {
      const { emailphone , password } = req.body;
  
      if (!(emailphone && password)) {
        res.status(400).send("All input is required");
      }
      const user = await User.findOne({ email : emailphone }) || await User.findOne({ phone_number : emailphone }) ;
  
    let isPasswordValid;
    if (user){
       isPasswordValid = await comparePasswords(password, user.password);
    }
  
      if(!user || !isPasswordValid) {
        return res.status(400).send("Invalid data");
      }
  
      if (user && isPasswordValid) {
        
        const token = generateToken(user._id, user.email);
  
        console.log("token is", token);
  
        const expirationDate = new Date(Date.now() + 15 * 24 * 3600 * 1000)
  
        res.cookie("token", token, { expires: expirationDate, sameSite: "None", secure: true });
  
  
        return res.status(200).json({ message: "Login successful", user });
      }
    } catch (err) {
      console.log(err);
    }
  }
  
  async function logout(req, res) {
      res.clearCookie("token", { sameSite: "None", secure: true });
      res.status(200).json({ message: "Logout successful" });
      }
  
  const auth = async (req, res) => {
   const user = await User.findOne({ email: req.user.email }) || await User.findOne({ phone_number: req.user.phone_number });
      res.status(201).json({ user });
  }
  
  const getUserById = async (req, res) => {
    try {
          
      if(req.params.id !== null){
        console.log(req.params.id)
        const user = await User.findById(req.params.id);
        res.status(200).json({ user });
      }
    } catch (err) {
      console.log(err);
    }
  }
  
  module.exports = { register, login , logout , auth  , getUserById};
  