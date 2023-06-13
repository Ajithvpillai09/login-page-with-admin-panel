// requiring modules
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
 

const app = express();

//DB config 
const db = require('./config/keys').MongoURI;

//connect mongodb
mongoose.connect(db,{useNewUrlParser:true})
.then(()=>console.log('mongodb connected'))
.catch(err => console.log(err))

//Body parser
app.use(express.urlencoded({extended:false}));

//cookie parser
app.use(cookieParser());
  
//session
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 } // set cookie options
  }));


  //success messages
app.use((req,res,next)=>{
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
})


//EJS
app.use(expressLayouts);
app.set('view engine','ejs')




//routes
app.use('/',require('./routes/admin'));
app.use('/',require('./routes/index'));
app.use('/users',require('./routes/user'));


app.listen(3000,()=>{
    console.log("listening to http://localhost:3000");
})


