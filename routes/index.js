const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');


const User = require('../models/Users')


//login page
router.get('/',(req,res)=>{
   
    if(req.session.loggedIn ){
        res.redirect('/dashboard');
    }else{
        res.setHeader('cache-control','no-store');
        res.render('login',{'errors':req.session.loginError});
        req.session.loginError=null;
    }
    
})


//home page

router.get('/dashboard',(req,res)=>{
    let user = req.session.user;
    if(user){
        res.setHeader('cache-control','no-store');
        res.render('dashboard',{user}) 
    }else{
        res.redirect('/');
    }
    
});


//login to home page

router.post('/',async (req,res)=>{
    const{email,password} = req.body;
    try{
        let user = await User.findOne({email:email});
        if(!user){
            req.session.loginError = [{msg:'Invalid email '}];
            return res.redirect('/');
        }
        let isMatch = await bcrypt.compare(password,user.password);
        if(isMatch){
            req.session.loggedIn = true;
            req.session.user = user;
            return res.redirect('/dashboard');
        }else{
            req.session.loginError = [{msg:'Invalid password'}];
            return res.redirect('/');
        }
    }catch(err){
        console.log(err.message);
        res.status(500).send('Server error')
    }
})


//logout
router.get('/logout',(req,res)=>{
    req.session.destroy();
    res.setHeader('cache-control','no-store');
    res.redirect('/');
})



module.exports = router;

