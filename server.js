const express = require ('express');
const path = require("node:path");
const cors = require('cors');
const mongoose = require('mongoose');
// const fs = require('fs');
// const path = require('path');
// const morgan = require('morgan');

const multer = require('multer');
const bcrypt = require ('bcrypt');

const dotenv = require('dotenv');
dotenv.config();



const app = express();
app.use(cors());

app.use(express.static(path.join(__dirname,"./client/build")))


// // create a write stream (in append mode)
// let accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

// // setup the logger
// app.use(morgan('combined', { stream: accessLogStream }))


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file);
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `${Date.now()}_${file.fieldname}` )
  }
})

const upload = multer({ storage: storage })



let connectToMDB = async ()=>{

  try {
   await mongoose.connect(process.env.dbPath);
  console.log("Successfully connected to 🍃");
  } catch (error) {
    console.log("Unable to connect 🍃");
  }

}

let nykkaSchema = new mongoose.Schema({

  firstName:String,
  lastName:String,
  email:String,
  password:String,
  number:Number,
  

});

let nykka = new mongoose.model("e-comer",nykkaSchema);


app.post("/signup",upload.none(), async(req,res)=>{

  console.log(req.body);

   let hassedPassword = await bcrypt.hash(req.body.password,10); 
   console.log(hassedPassword);

 let userDetails = await nykka.find().and({email:req.body.email});//create userOnly onetime account then checking already there are not

 if(userDetails.length >0){

  res.json({status:"FAIL",msg:"User already exists"});

 }else{

  try {
    
    let nykkaData = new nykka({

      firstName:req.body.fn,
      lastName:req.body.ln,
      email:req.body.email,
      password:hassedPassword,
      number:req.body.number,
  
     });
  
     await nykka.insertMany(nykkaData);

     res.json({status:"Success",msg:"successfully created & send data to 🍃"});

  } catch (error) {
    
    res.json({status:"FAIL",msg:"cann't created account"});
  }
}
});



app.post("/validateLogin",upload.none(), async(req,res)=>{

  console.log(req.body);

let userDetails = await nykka.find().and({email:req.body.email});

if(userDetails.length == 0){
  res.json({status:"FAiL",msg:"User doesn't exist"});
}else{

  let result = await bcrypt.compare(req.body.password,userDetails[0].password);
  console.log(result);

  if(result == true){
    res.json({status:"Success",msg:"SuccessFully Login ",data:userDetails[0]});
  }else{
    res.json({status:"FAIL",msg:"Incorrect password"});
  }
}






  console.log(userDetails);

  // res.json(userDetails)

// res.json({status:"Success",msg:"successfully Login"});

})

app.listen(process.env.port,()=>{
  console.log("Server is running🔥");
})

connectToMDB();