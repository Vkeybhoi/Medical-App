import { config } from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import check from "../auth/valid";
import Report from "../model/report";
import Doctor from "../model/doctor";
import bcrypt from "bcryptjs";
import { Decode } from "../auth/oAuth";
import jwt from "jsonwebtoken";
import { decodeId, idMatch } from "../utils";

config();

const control = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = check.reportSchema.validate(req.body);
    if (error) {
      // console.error(error);
      res.status(400).json({
        message: "invalid input",
        error: error,
      });
      return;
    }
    const {
      patientName,
      age,
      weight,
      height,
      hospitalName,
      bloodGroup,
      bloodPressure,
      HIV_Status,
      hepatitis,
      genotype,
    } = value;

    const doctorId = decodeId(req);
    if (!doctorId) {
      return res.status(500).render("doctor_error", {
        title: "MedBay | Report",
        message: "Something went wrong",
        error: "Try logging in",
      });
    }
    try {
      const report = await Report.create({
        patientName,
        age,
        weight,
        height,
        hospitalName,
        bloodGroup,
        bloodPressure,
        HIV_Status,
        hepatitis,
        genotype,
        doctorId,
      });
      if (report) {
        return res.redirect(`/users/v/report/k/${report._id}`);
      }
      if (!doctorId) {
        return res.status(500).render("doctor_error", {
          title: "MedBay | Report",
          message: "Something went wrong",
          error: "Try logging in",
        });
      }
    } catch (err) {
      // console.error(err);
      res.status(500).render("server_error", {
        message: "server error",
        error: err,
      });
    }
  },
  update: async (req: Request, res: Response, next: NextFunction) => {
    const reportId = req.params.reportId;
    const updates = req.body;
    const doctorId = decodeId(req);
    if (!doctorId) {
      return res.status(500).render("doctor_error", {
        title: "MedBay | Report",
        message: "Something went wrong",
        error: "Try logging in",
      });
    }
    try {
      const report = await Report.findById(reportId);
      if (!report) {
        return res.status(404).render("doctor_error", {
          title: "MedBay | Report",
          message: "report not found",
          error: "report not found",
        });
      }
      const isMatch = idMatch(req, report.doctorId!.toString());
      if (!isMatch) {
        return res.status(401).render("doctor_error", {
          title: "MedBay | Report",
          message: "report not created by you",
          error: "unauthorized",
        });
      }
      for (const field in updates) {
        if (!updates[field]) {
          delete updates[field];
        }
      }

      await Object.assign(report, updates);
      await report.save();

      res.redirect(`/users/v/report/k/${reportId}`);
    } catch (err) {
      // console.error(err);
      res.status(500).render("server_error", {
        message: "server error",
        error: err,
      });
    }
  },
  fetchOne: async (req: Request, res: Response, next: NextFunction) => {
    const { reportId, patientName } = req.body;
    const routes = req.url.split("/");
    try {
      if (reportId) {
        const report = await Report.findById(reportId);
        if (report) {
          if (routes.includes("va")) {
            return res.redirect(`/admin/va/report/k/${report._id.toString()}`);
          }
          return res.redirect(`/users/v/report/k/${report._id.toString()}`);
        }
        return res.status(404).render("doctor_error", {
          title: "MedBay | Report",
          message: "Not Found",
          error: "No Report Found",
        });
      }
      if (patientName) {
        const report = await Report.findOne({ patientName });
        if (report) {
          if (routes.includes("va")) {
            return res.redirect(`/admin/va/report/k/${report._id.toString()}`);
          }
          return res.redirect(`/users/v/report/k/${report._id.toString()}`);
        }
        return res.status(404).render("doctor_error", {
          title: "MedBay | Report",
          message: "Not Found",
          error: "No Report Found",
        });
      }

      return res.status(403).render("doctor_error", {
        title: "MedBay | Report",
        message: "Not Found",
        error: "No Report Found",
      });
    } catch (err) {
      // console.error(err);
      res.status(500).render("server_error", {
        message: "server error",
        error: err,
      });
    }
  },
  getOne: async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.reportId;
    try {
      const report = await Report.findById(id);
      if (report) {
        const url = req.url;
        const routes = url.split("/");
        // console.log(routes);
        const owner = idMatch(req, report.doctorId!.toString());
        if (routes.includes("va")) {
          return res.render("admin_report", {
            title: "MedBay | Admin",
            data: report,
          });
        }
        if (!owner && routes.includes("update")) {
          return res.status(401).render("doctor_error", {
            title: "MedBay | Report",
            message: "Cannot Update",
            error: "Report not created by you",
          });
        }
        if (!owner) {
          return res.render("doctor_Nreport", {
            title: "MedBay | Report",
            data: report,
          });
        }
        if (routes.includes("update")) {
          return res.render("update_report", {
            title: "MedBay | Update Report",
            data: report,
          });
        }

        return res.status(200).render("doctor_report", {
          title: "MedBay | Report",
          data: report,
        });
      }

      return res.status(404).render("doctor_error", {
        title: "MedBay | Error",
        message: "Not Found",
        error: "No Report Found",
      });
    } catch (err) {
      // console.error(err);
      res.status(500).render("server_error", {
        message: "server error",
        error: err,
      });
    }
  },
  getMyReports: async (req: Request, res: Response, next: NextFunction) => {
    const doctorId = decodeId(req);
    try {
      const reports = await Report.find({ doctorId });
      if (reports.length > 0) {
        return res.render("doctor_reports", {
          title: "MedBay | Reports",
          data: reports,
        });
      }

      res.render("doctor_error", {
        title: "MedBay | Report",
        message: "you do not have any reports",
        error: "no reports found",
      });
    } catch (err) {
      res.status(500).render("server_error", {
        message: "server error",
        error: err,
      });
    }
  },
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const routes = req.url.split("/");
      const reports = await Report.find();
      if (reports.length) {
        if (routes.includes("va")) {
          return res.render("admin_allReports", {
            title: "MedBay | Admin",
            data: reports,
          });
        }
        res.render("doctor_allReports", {
          title: "MedBay | All",
          data: reports,
        });
        return;
      }

      res.render("doctor_error", {
        title: "MedBay | Reports",
        message: "No Reports",
        error: "No Reports Found",
      });
    } catch (err) {
      res.status(500).render("server_error", {
        message: "server error",
        error: err,
      });
    }
  },
  confirmDelete: async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.reportId;
    try {
      const report = await Report.findById(id);
      if (!report) {
        res.status(404).render("doctor_error", {
          title: "MedBay | Report",
          message: "Not Found",
          error: "No Report Found",
        });
        return;
      }
      res.render("delete_report", {
        title: "MedBay | Confirm",
        message: "Not Sure",
        patient: report.patientName,
      });
    } catch (err) {
      res.status(500).render("server_error", {
        message: "server error",
        error: err,
      });
    }
  },
  delete: async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.reportId;
    try {
      const report = await Report.findById(id);
      if (!report) {
        res.status(404).render("doctor_error", {
          title: "MedBay | Report",
          message: "Not Found",
          error: "No Report Found",
        });
        return;
      }
      const ownReport = idMatch(req, report.doctorId.toString());
      if (!ownReport) {
        res.render("doctor_error", {
          title: "MedBay | Report",
          message: "Report not deleted",
          error: "Report can only be deleted by the doctor who created them",
        });
        return;
      }
      const _id = decodeId(req);
      const doctor = await Doctor.findById(_id);
      if (!doctor) {
        res.status(500).render("doctor_error", {
          title: "MedBay | Report",
          message: "Something went wrong",
          error: "Try logging in",
        });
        return;
      }
      const { password } = req.body;
      if (!password) {
        res.status(401).render("doctor_error", {
          title: "MedBay | Report",
          message: "Report not deleted",
          error: "Wrong input",
        });
        return;
      }
      const match = bcrypt.compareSync(password, doctor.password);
      if (!match) {
        res.status(401).render("doctor_error", {
          title: "MedBay | Report",
          message: "Report not deleted",
          error: "Wrong input",
        });
        return;
      }

      await Report.deleteOne({ _id: id });
      res.render("doctor_success", {
        title: "MedBay | Delete",
        message: "Report Deleted",
      });
    } catch (err) {
      res.status(500).render("server_error", {
        message: "server error",
        error: err,
      });
    }
  },
};

export default control;
