const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')

//user model
const User = require('../models/Users')


//register page
router.get('/register',(req,res)=>{
    res.render('register')
})


router.post('/register',(req,res)=>{
    const {name,email,password,password2} = req.body;
    let errors = [];

    //check required fields
    if(!name || !email || !password ||!password2) errors.push({msg:'please fill all fields'});
    if(password !== password2) errors.push({msg:'Passwords do not match'});
    if(password.length < 6) errors.push({msg:'Password should be at least 6 charactors'});

    if(errors.length > 0){
        res.render('register',{
            errors,
            name,
            email,
            password,
            password2
        })
    }else{
        //Validation Passed
        User.findOne({email:email})
        .then(user =>{
            if(user){
                //user exits
                errors.push({msg:'Email is already registered'});
                res.render('register',{
                    errors,
                    name,
                    email,
                    password,
                    password2
                });
            }else{
               const newUser = new User({
                name,
                email,
                password
               });
               bcrypt.genSalt(10, (err, salt)=> {
                bcrypt.hash(newUser.password, salt, (err, hash) =>{
                    // Store hash in your password DB.
                    if(err) throw err;
                    newUser.password = hash;
                    
                    // save user
                    newUser.save()
                    .then(user =>{
                       
                        res.redirect('/');
                    })
                    .catch(err => console.log(err));

                });
            });
            }
        });
    }
}); 

module.exports = router;