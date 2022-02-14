//router level middleware
const { Router } = require("express");
const router = Router();

//?load multer middlewares
const multer = require("multer");
let { storage } = require("../middleware/multer");
const { deleteOne } = require("../Model/Employee");
const upload = multer({ storage: storage });

const EMPLOYEE = require("../Model/Employee");
//custom middleware
const { ensureAuthenticated } = require("../helper/auth_helper");
/*@HTTP GET METHOD
    @ACCESS PUBLIC
    @URL employee/home
 */
router.get("/home", async (req, res) => {
  let payload = await EMPLOYEE.find().lean();
  res.render("../views/home", { title: "Home page", payload });
});
/*@HTTP GET METHOD
  @ACCESS PUBLIC
  @URL employee/home
*/
router.get("/emp-profile", ensureAuthenticated, async (req, res) => {
  let payload = await EMPLOYEE.find({ user: req.user.id }).lean();
  res.render("../views/employees/employeeProfile", {
    title: "Home page",
    payload,
  });
});
/*@HTTP GET METHOD
    @ACCESS PRIVATE
    @URL employee/create-emp
 */
router.get("/create-emp", ensureAuthenticated, (req, res) => {
  res.render("../views/employees/create-emp", { title: "create employee" });
});
//!===================slug============================
router.get("/:id", async (req, res) => {
  let payload = await EMPLOYEE.findOne({
    _id: req.params.id,
    user: req.user.id,
  }).lean();
  res.render("../views/employees/employeeProfile", { payload });
  console.log(payload);
});
//?=============edit data of emp===============
router.get("/edit-emp/:id", ensureAuthenticated, async (req, res) => {
  let editPayload = await EMPLOYEE.findOne({ _id: req.params.id }).lean();
  res.render("../views/employees/editEmp", { editPayload });
});
/*=====================END OF ALL GET METHODS===========================*/
/*@HTTP POST METHOD
    @ACCESS PRIVATE
    @URL employee/create-emp
 */
router.post(
  "/create-emp",
  ensureAuthenticated,
  upload.single("emp_photo"),
  async (req, res) => {
    let payload = {
      emp_photo: req.file,
      emp_name: req.body.emp_name,
      emp_id: req.body.emp_id,
      emp_salary: req.body.emp_salary,
      emp_edu: req.body.emp_edu,
      emp_des: req.body.emp_des,
      emp_phone: req.body.emp_phone,
      emp_loc: req.body.emp_loc,
      emp_email: req.body.emp_email,
      emp_skills: req.body.emp_skills,
      emp_gender: req.body.emp_gender,
      emp_exp: req.body.emp_exp,
      user: req.user.id,
    };
    req.flash("SUCCESS_MESSAGE", "Profile created Successfully");
    res.redirect("/employee/emp-profile", 302, {});
    console.log(req.body);
    console.log(req.file);
    // await EMPLOYEE.create(payload);
    await new EMPLOYEE(payload).save();
  }
);
//*============put request starts here======================
router.put("/edit-emp/:id", upload.single("emp_photo"), (req, res) => {
  // res.send("ok");
  EMPLOYEE.findOne({ _id: req.params.id })
    .then(editEmp => {
      //old             new
      (editEmp.emp_photo = req.file),
        (editEmp.emp_name = req.body.emp_name),
        (editEmp.emp_salary = req.body.emp_salary),
        (editEmp.emp_edu = req.body.emp_edu),
        (editEmp.emp_exp = req.body.emp_exp),
        (editEmp.emp_email = req.body.emp_email),
        (editEmp.emp_phone = req.body.emp_phone),
        (editEmp.emp_gender = req.body.emp_gender),
        (editEmp.emp_des = req.body.emp_des),
        (editEmp.emp_skills = req.body.emp_skills),
        (editEmp.emp_loc = req.body.emp_loc);
      //update in database
      editEmp.save().then(_ => {
        req.flash("SUCCESS_MESSAGE", "Profile edited Successfully");
        res.redirect("/employee/home", 302, {});
      });
    })
    .catch(err => {
      req.flash("ERROR_MESSAGE", "Something went wrong");
      console.log(err);
    });
});
//*============put request ends here======================

//*============delete request starts here====================
router.delete("/delete-emp/:id", async (req, res) => {
  await EMPLOYEE.deleteOne({ _id: req.params.id });
  req.flash("SUCCESS_MESSAGE", "Profile deleted Successfully");
  res.redirect("/employee/home", 302, {});
});
//*============delete request ends here======================

module.exports = router;
