import express, { Request, Response, NextFunction } from "express";
import adminControl from "../controller/admin";
import oAuth from "../auth/oAuth";
import doctorControl from "../controller/doctor";
import reportControl from "../controller/report";
const router = express.Router();

router.post("/new", adminControl.create);
router.post("/login", oAuth.authenticate, adminControl.login);

router.use("/va", oAuth.adminAction);
router.get("/va/dashboard", adminControl.dashboard);
router.get("/va/doctor/endorse", adminControl.endorseDoctorPage);
router.post("/va/doctor/endorse", adminControl.endorseDoctor);
router.post("/va/doctor/delete", adminControl.deleteDoctor);
router.get("/va/update", adminControl.updatePage);
router.post("/va/update", adminControl.update);
router.get("/va/profile", adminControl.profile);
router.get("/va/report/all", reportControl.getAll);
router.get("/va/report/fetch", adminControl.fetchReport);
router.post("/va/report/fetch", reportControl.fetchOne);
router.get("/va/report/k/:reportId", reportControl.getOne);
router.get("/login", (req: Request, res: Response, next: NextFunction) => {
  res.render("admin_login", { title: "MedBay | Admin" });
});
router.get("/new", (req: Request, res: Response, next: NextFunction) => {
  res.render("admin_signup", { title: "MedBay | Register" });
});

export default router;
