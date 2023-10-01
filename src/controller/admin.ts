import { config } from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import check from "../auth/valid";
import Doctor from "../model/doctor";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { decodeId, doctorName } from "../utils";

config();

const accessKey = process.env.ADMINKEY!;

const control = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    const userInput = req.body;
    const trimEmail = userInput.email.toLowerCase().trim();
    userInput.email = trimEmail;
    const { error, value } = check.adminSchema.validate(userInput);
    if (error) {
      console.error(error);
      res.status(400).json({
        message: "invalid input",
        error: error,
      });
      return;
    }

    const { name, email, password, specialization, gender, phone, adminKey } =
      value;
    if (adminKey !== accessKey) {
      res.status(400).json({
        message: "cannot register admin",
        error: "invalid credentials",
      });
      return;
    }
    try {
      const salt = 10;
      const hash = bcryptjs.hashSync(password, salt);
      const userAdmin = await Doctor.create({
        name,
        email,
        password: hash,
        specialization: specialization || "N/A",
        gender,
        phone,
        isDoctor: false,
        isAdmin: true,
      });

      if (userAdmin) {
        const token = jwt.sign(
          {
            _id: userAdmin._id,
            isDoctor: userAdmin.isDoctor,
            isAdmin: userAdmin.isAdmin,
          },
          process.env.JWT_SECRET!,
          { expiresIn: "2h" }
        );

        req.headers.authorization = `Bearer ${token}`;
        res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
        res.redirect("/admin/va/dashboard");
        return;
      }

      return res.status(500).json({
        message: "failed",
        error: "something went wrong",
      });
    } catch (err) {
      // console.error(err);
      res.status(500).render("server_error", {
        message: "server error",
        error: err,
      });
    }
  },
  login: async (req: Request, res: Response, next: NextFunction) => {
    res.redirect("/admin/va/dashboard");
  },
  dashboard: async (req: Request, res: Response, next: NextFunction) => {
    const docName = "Admin";
    res.render("admin_dashboard", {
      title: `MedBay | Admin`,
      docName: docName,
    });
  },
  endorseDoctorPage: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    res.render("admin_endorse", {
      title: `MedBay | Admin`,
    });
  },
  endorseDoctor: async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const trimEmail = email.toLowerCase().trim();
    try {
      const doc = await Doctor.findOne({ email: trimEmail });
      if (!doc) {
        res.status(400).json({
          message: "cross check email",
          error: "user not found",
        });
        return;
      }
      doc.isDoctor = true;
      doc.save();
      res.render("admin_success", {
        title: `MedBay | Admin`,
        message: `Doctor ${doc.name} has been endorsed`,
        data: doc,
      });
    } catch (err) {
      // console.error(err);
      res.status(500).render("server_error", {
        message: "server error",
        error: err,
      });
    }
  },
  deleteDoctor: async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const trimEmail = email.toLowerCase().trim();
    try {
      const doc = await Doctor.findOne({ email: trimEmail });
      if (!doc) {
        return res.status(400).json({
          message: "cross check email",
          error: "user not found",
        });
      }
      if (doc.isAdmin) {
        return res.status(400).json({
          message: "cannot delete admin",
          error: "invalid credentials",
        });
      }
      await Doctor.deleteOne({ email: trimEmail });
      res.json({
        message: "success",
        data: "deleted",
      });
    } catch (err) {
      // console.error(err);
      res.status(500).render("server_error", {
        message: "server error",
        error: err,
      });
    }
  },
  profile: async (req: Request, res: Response, next: NextFunction) => {
    const adminId = decodeId(req);
    try {
      const admin = await Doctor.findById(adminId);
      if (admin) {
        return res.render("admin_profile", {
          title: `MedBay | Admin`,
          data: admin,
        });
      }

      res.status(400).json({
        message: "invalid credentials",
        error: "invalid credentials",
      });
      return;
    } catch (err) {
      console.error(err);
      res.status(500).render("server_error", {
        message: "server error",
        error: err,
      });
    }
  },
  updatePage: async (req: Request, res: Response, next: NextFunction) => {
    res.render("update_admin", {
      title: `MedBay | Admin`,
    });
  },
  update: async (req: Request, res: Response, next: NextFunction) => {
    const _id = decodeId(req);
    const userInput = req.body;
    try {
      const user = await Doctor.findById(_id);
      if (!user) {
        return res.status(403).render("server_error", {
          title: "MedBay | Error",
          message: "Something went wrong",
          error: "Try logging in",
        });
      }
      userInput.email = null;
      userInput.password = null;
      userInput.isDoctor = null;
      userInput.isAdmin = null;
      for (const field in userInput) {
        if (!userInput[field]) {
          //falsy fields should not update
          delete userInput[field];
        }
      }

      await Object.assign(user, userInput);
      await user.save();
      res.redirect("/admin/va/profile");
      return;
    } catch (err) {
      // console.error(err);
      return res.status(500).render("server_error", {
        message: "server error",
        error: err,
      });
    }
  },
  fetchReport: async (req: Request, res: Response, next: NextFunction) => {
    res.render("admin_findReport", {
      title: `MedBay | Admin`,
    });
  },
};

export default control;
