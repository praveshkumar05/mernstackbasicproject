const Users = require("../models/userSchema.js")
const moment = require("moment");
const users = require("../models/userSchema.js");
const { format } = require('@fast-csv/format');
const  fs=require("fs");
const  BASE_URL= process.env.BASE_URL
// resgister user
exports.userpost = async (req, res) => {
    const file = req.file.filename;
    //console.log(file);
    const { fname, lname, email, mobile, gender, location, status } = req.body;
    // console.log(mobile);
    if (!fname || !lname || !email || !mobile || !gender || !location || !status || !file) {
        console.log(error);
        return res.status(401)
    }
    // console.log(req.body)
    try {
        const userData = await Users.findOne({ email: email });
        if (userData) {
            //console.log(error);
            return res.status(401).json({ status: 401, message: "user already Exist" });
        }
        else {
            const datecreated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss")
            const userData = new Users({
                fname, lname, email, mobile, gender, location, status, profile: file, datecreated
            })
            console.log("beforesave")
            await userData.save();
            console.log("after saved");
            res.status(201).json({ status: 201, userData })
        }
    }
    catch (error) {
        res.status(401).json({ status: 401, message: "something error occured " });
        console.error(error);
    }
}
// user get 
exports.userget = async (req, res) => {

    console.log(req.query);
    const search = req.query.search || "";
    const gender = req.query.gender || "";
    const status = req.query.status || "";
    const sort = req.query.sort || "";
    const page=req.query.page||1
    console.log(page);
    const ITEM_PER_PAGE=4;
    const puery = {
        fname: { $regex: search, $options: "i" },
        // sort : {$regex:sort, $options:"i"}
    }
    if (gender != "All") {
        puery.gender = gender;
    }
    if (status != "All") {
        puery.status = status;
    }

    try {
        const skip=(page-1)*ITEM_PER_PAGE;
        const count=await users.countDocuments(puery);
        const userData = await users.find(puery)
        .sort({ datecreated: sort == "new" ? -1 : 1 })
        .limit(ITEM_PER_PAGE)
        .skip(skip);
        //console.log(userData);
        const pagecount=Math.ceil(count/ITEM_PER_PAGE);
        res.status(200).json({ 
            status: 200,
            pagination:{ count,pagecount},
            userData 
        });

    } catch (error) {
        console.log(error);
        res.status(401).json({ status: 401, error })
    }
}
// single user 
exports.singeluserget = async (req, res) => {
    const { id } = req.params;
    //const {id}=req.body;
    console.log(id);
    // const id="123";

    try {
        const userData = await users.findOne({ _id: id })
        if (userData) {
            res.status(200).json({ status: 200, userData });
        }
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
}
exports.updateuser = async (req, res) => {

    const { id } = req.params;
    const { fname, lname, email, mobile, gender, location, user_profile, status, datecreated } = req.body;
    console.log(req.body);
    const file = req.file ? req.file.filename : user_profile;
    const dateupdated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss")
    try {

        const usertobeupdate = await users.findOneAndUpdate({ _id: id }, {
            fname, lname, email, mobile, gender, location, status, profile: file, datecreated, dateupdated
        });

        console.log(usertobeupdate);
        await usertobeupdate.save();
        res.status(200).json({ status: 200, usertobeupdate });

    } catch (error) {
        console.log(error);
        res.status(401).json(error);
    }

}
//
exports.deleteuser = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const deleteyaar = await users.deleteOne({ _id: id });
    if (deleteyaar) {
        console.log(deleteyaar);
        res.status(200).json(200);

    } else {
        res.status(401).json(401);
    }

}
//status updatea
exports.updatestatus = async (req, res) => {
    console.log("function called");
    const { id } = req.params;
    const { data } = req.body;
    console.log(data);
    try {
        const userfind = await users.findByIdAndUpdate({ _id: id }, { status: data });
        res.status(201).json(userfind);
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
}
//export csv
exports.createcsv = async (req, res) => {

    try {
        const csvStream = format({ headers: true });
        const userData = await users.find();
        // csvStream. writeToPath(path.resolve("../../server/public/files",temp.csv),{
        //     firstName:userData.fname,
        //     lastname:userData.lname,
            
        // })
        if(!fs.existsSync("public/files/export/"))
        {   
                if(!fs.existsSync("public/files"))
                {
                    fs.mkdirSync("public/files/");
                }
                if(!fs.existsSync("public/files/export"))
                {
                    fs.mkdirSync("public/files/export/")
                }
        }
        const WritableStream=fs.createWriteStream(
            "public/files/export/users.csv"
        );
        csvStream.pipe(WritableStream);
        WritableStream.on("finish",function(){
            res.json({
                downloadurl:`${BASE_URL}/files/export/users.csv`})
        });
        if(userData.length>0){
            userData.map((user)=>{
                csvStream.write({
                    FirstName:user.fname?user.fname:"-",
                    LastName:user.lname?user.lname:"-",
                    email:user.email?user.email:"-",
                    Phone:user.mobile?user.mobile:"-",
                    Gender:user.gender?user.gender:"-",
                    status:user.status?user.status:"-",
                    Profile:user.profile?user.profile:"-",
                    Location:user.location?user.location:"-",
                    DateCreated:user.datecreated?user.datecreated:"-",
                    DateUpdated:user.dateupdated?user.dateupdated:"-",
                    
                })
            })
        }
        csvStream.end();
        WritableStream.end();



    } catch (error) {
        console.log(error);
        res.status(400).json(error);

    }



}