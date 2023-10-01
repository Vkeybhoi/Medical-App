import express, { Request, Response, NextFunction } from "express";
import doctorControl from "../controller/doctor";
const router = express.Router();

/* GET home page. */
router.get("/", function (req: Request, res: Response, next: NextFunction) {
  res.render("index", { title: "MedBay" });
});
router.post("/", doctorControl.logout);

export default router;
