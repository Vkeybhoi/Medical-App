import express, { Request, Response, NextFunction } from "express";
import doctorControl from "../controller/doctor";
import reportControl from "../controller/report";
import oAuth from "../auth/oAuth";
const router = express.Router();

/* GET users listing. */
router.get("/", function (req: Request, res: Response, next: NextFunction) {
  res.send("respond with a resource");
});

router.post("/new", doctorControl.create);
router.use("/v", oAuth.authorise);

router.post("/login", oAuth.authenticate, doctorControl.login);
router.get("/v/dashboard", doctorControl.dashboard);
router.get("/v/profile", doctorControl.profile);
router.post("/v/update", doctorControl.update);
router.use("/v/report", oAuth.doctorAction);
router.post("/v/report/create", reportControl.create);
router.get("/v/report/all", reportControl.getAll);
router.post("/v/report/fetch", reportControl.fetchOne);
router.get("/v/report/k/:reportId", reportControl.getOne);
router.post("/v/report/k/:reportId/update", reportControl.update);
router.get("/v/report/k/:reportId/update", reportControl.getOne);
router.get("/v/report/mine", reportControl.getMyReports);
router.get("/v/report/k/:reportId/delete", reportControl.confirmDelete);
router.post("/v/report/k/:reportId/delete", reportControl.delete);
router.get("/login", (req: Request, res: Response, next: NextFunction) => {
  res.render("doctor_login", { title: "MedBay | Login" });
});
router.get("/new", (req: Request, res: Response, next: NextFunction) => {
  res.render("doctor_signup", { title: "MedBay | Register" });
});
router.get(
  "/v/report/create",
  async (req: Request, res: Response, next: NextFunction) => {
    res.render("create_report", { title: "MedBay | Create Report" });
  }
);
router.get(
  "/v/report/fetch",
  (req: Request, res: Response, next: NextFunction) => {
    res.render("doctor_findReport", { title: "MedBay | Find Report" });
  }
);
router.get("/v/update", (req: Request, res: Response, next: NextFunction) => {
  res.render("update_profile", { title: "MedBay | Profile" });
});

export default router;
