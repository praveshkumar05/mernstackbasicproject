const express=require("express");
const router=new express.Router();
const controller=require("../controllers/userscontroller")
const upload=require("../multerconfig/storageconfig")
// Routes for register page
router.post("/user/register",upload.single("user_profile"),controller.userpost)
router.get("/user/details",controller.userget);
router.get("/singleuser/details/:id",controller.singeluserget);
router.put("/update/details/:id",upload.single("user_profile"),controller.updateuser);
router.get("/delete/:id",controller.deleteuser);
router.put("/user/status/update/:id",controller.updatestatus);
router.get("/user/details/csv",controller.createcsv)

module.exports=router;
