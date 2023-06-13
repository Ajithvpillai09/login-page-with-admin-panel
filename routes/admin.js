const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')

 
//user model
const User = require('../models/Users');

const credentials = {email:"admin@gmail.com",password:'admin123'};

function setNoCache(req, res, next) {
    res.setHeader("Cache-Control", "no-store");
    next();
}



//verifying user
function verifyUser(req,res,next){
    if(req.session.admin){
        next();
    }else{
        res.redirect('/admin')
    }
    
}

//login page
router.get('/admin', setNoCache,(req,res)=>{
   
    if(req.session.admin){
    
        res.redirect('/home')
    }else{
        res.render('admin/login',{'errors':req.session.loginError});
        req.session.loginError=null;
    }
})

//get all users 
router.get('/home',verifyUser, setNoCache, async (req, res) => {
    try {
      const users = await User.find().exec();
      res.render('admin/home', { users,searchUser:null});
     } catch (err) {
      res.json({ message: err.message });
    }
  }); 
 
  
//add user
router.get('/add',verifyUser,setNoCache,(req,res)=>{
    console.log(req.session.admin);
    res.render('admin/addUser')
})

//edit user
router.get('/edit/:id',verifyUser, setNoCache, async (req, res) => {
    try {
      const id = req.params.id;
      const user = await User.findById(id);
      if (!user) {
        res.redirect('/home');
      } else {
        res.render('admin/editUser', {
          user: user
        });
      }
    } catch (err) {
      console.error(err);
      res.redirect('/home');
    }
  });



//delete user
router.get('/delete/:id', async(req,res)=>{
    try{
        const id = req.params.id;
        await User.findByIdAndRemove(id);
        req.session.message ={
            type: "success",
            message :" User deleted succesfully!"
        }
        res.redirect('/home');
    }catch(err){
        res.redirect('/home');
    }
})
  

//search a user
router.get('/search',verifyUser,setNoCache,async (req,res)=>{
    try{
        const query = req.query.q;
        const regex = new RegExp(query,'i'); 
        const searchUser = await User.find({$or:[{name:regex},{email:regex}]});
        // console.log(searchUser);
        if(searchUser.length > 0){
            res.render('admin/home', { users: searchUser, searchUser: true, query: query });
        }else{
            req.session.message = {
                type: "error",
                message: "No Users found"
            }
            res.redirect('/home')
        }
      }catch(err){
        console.log(err.msg);
       
        
    }
});

//update user
router.post('/update/:id',async (req,res)=>{
    try{
        const id = req.params.id;
        await User.findByIdAndUpdate(id,{
            name:req.body.name,
            email:req.body.email
        });
        req.session.message ={
            type: "success",
            message :" User updated succesfully!"
        }
        res.redirect('/home');

    }catch(err){
        console.log(err);
    }
})



//login as admin

router.post('/admin/login',(req,res)=>{
    const {email,password} = req.body;
    const errors =[];
if(!email || !password){
         errors.push({msg:'Please fill all the fields'});
    }else if(email !== credentials.email){
            errors.push({msg:'Invalid Username'})
        }else if(password !== credentials.password){
            errors.push({msg:'Password did not match'});
        }
        if(errors.length > 0){
            req.session.loginError = errors;
            res.redirect('/admin')
        }else{
            req.session.admin = req.body.email;
            res.redirect('/home');
        }
        
        });


// add new user
router.post('/add', async(req,res)=>{
    const {name,email,password} = req.body;
    try{
        const userExist = await User.findOne({email});
        if(userExist){
            req.session.message = {
                type: "error",
                message: "Already registered Email Id"
            }
            res.redirect('/home');
            return;
        }
        const newUser = new User({name,email,password});
        bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(newUser.password,salt,async (err,hash)=>{
                newUser.password = hash;
                await newUser.save();
                req.session.message = {
                    type:"succes",
                    message:"User added successfully"
                };
                res.redirect('/home')

            });
        });
    }catch(err){
        console.log(err.message);
        req.session.message ={
            type:"error",
            message:"An error occured while adding the user"
        }
        res.redirect('/home')

    }
})

//logout
router.get('/logoutAdmin',setNoCache,(req,res)=>{
    req.session.destroy();
    res.redirect('/admin');
})






module.exports = router;