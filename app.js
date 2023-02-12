const express=require("express")
const dotenv=require ("dotenv");
dotenv.config({path: "./config.env"})
require("./db/conn")
const cors=require("cors");
const port=6010
const app=express();
const router=require("./Routes/Router")
app.use(cors());
app.use(express.json());
app.use("/uploads",express.static("./uploads"));
app.use("/files",express.static("./public/files")); 
app.use(router);

app.get("/",(req,res)=>{
    res.status(201).json("server start");
});
app.listen(port,()=>{});