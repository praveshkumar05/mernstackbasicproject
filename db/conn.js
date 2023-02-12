const mongoose=require("mongoose");
mongoose.set('strictQuery',true);
var db=process.env.DATABASE
mongoose.connect(db)
.then(()=>{console.log('conection successful')})
.catch((err)=>{ console.log('conection unsuccessful')})