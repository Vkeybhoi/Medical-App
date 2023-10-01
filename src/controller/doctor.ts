import { config } from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import check from "../auth/valid";
import Doctor from "../model/doctor";
import bcryptjs from "bcryptjs";
import { Decode } from "../auth/oAuth";
import jwt from "jsonwebtoken";
import { decodeId, doctorName } from "../utils";

config();

interface UpdateField {
  name?: string;
  phone?: string;
  specialization?: string;
}

const control = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    const userInput = req.body;
    const trimEmail = userInput.email.toLowerCase().trim();
    userInput.email = trimEmail;
    const { error, value } = check.doctorSchema.validate(userInput);
    if (error) {
      // console.error(error);
      res.status(400).json({
        message: "invalid input",
        error: error,
      });
      return;
    }
    const { name, email, password, specialization, gender, phone } = value;
    try {
      const salt = 10;
      const hash = bcryptjs.hashSync(password, salt);
      const user = await Doctor.create({
        name,
        email,
        password: hash,
        specialization: specialization || "N/A",
        gender,
        phone,
        isDoctor: false,
        isAdmin: false,
      });
      if (user) {
        const token = jwt.sign(
          {
            _id: user._id,
            isDoctor: user.isDoctor,
            isAdmin: user.isAdmin,
          },
          process.env.JWT_SECRET!,
          { expiresIn: "2h" }
        );
        // console.log(token);
        //set cookie and header

        req.headers = { ...req.headers, authorization: `Bearer ${token}` };

        res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
        res.redirect("/users/v/dashboard");
        return;
      }

      return res.status(500).render("server_error", {
        message: "server error",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).render("server_error", {
        message: "server error",
        error: err,
      });
    }
  },
  login: async (req: Request, res: Response, next: NextFunction) => {
    res.redirect("/users/v/dashboard");
  },
  dashboard: async (req: Request, res: Response, next: NextFunction) => {
    const docName = await doctorName(req);
    res.render("doctor_dashboard", { title: "MedBay | Doctor", docName });
  },
  profile: async (req: Request, res: Response, next: NextFunction) => {
    const _id = decodeId(req);
    try {
      const user = await Doctor.findById(_id);
      if (user) {
        return res.status(200).render("doctor_profile", {
          title: "MedBay | Profile",
          data: user,
        });
      }
      return res.status(403).render("doctor_error", {
        title: "MedBay | Profile",
        message: "Something went wrong",
        error: "Try logging in",
      });
    } catch (err) {
      // console.error(err);
      return res.status(500).render("server_error", {
        message: "server error",
        error: err,
      });
    }
  },
  update: async (req: Request, res: Response, next: NextFunction) => {
    const _id = decodeId(req);
    const userInput = req.body;
    try {
      const user = await Doctor.findById(_id);
      if (!user) {
        return res.status(403).render("doctor_error", {
          title: "MedBay | Profile",
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
      res.redirect("/users/v/profile");
    } catch (err) {
      // console.error(err);
      return res.status(500).render("server_error", {
        message: "server error",
        error: err,
      });
    }
  },
  logout: async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("token");
    req.headers.authorization = undefined;
    res.redirect("/");
  },
};

export default control;
