import { config } from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import check from "../auth/valid";
import Doctor from "../model/doctor";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

config();

const keycode = process.env.JWT_SECRET!;

interface Decode {
  _id?: string;
  isDoctor?: boolean;
  isAdmin?: boolean;
  iat?: number;
  exp?: number;
}

const oAuth = {
  authenticate: async (req: Request, res: Response, next: NextFunction) => {
    //clear cookie and header
    req.headers.authorization = undefined;
    res.clearCookie("token");
    req.cookies.token = undefined;

    //get user input
    const userInput = req.body;
    //trim and lowercase email and store in userInput
    const trimEmail = userInput.email.toLowerCase().trim();
    userInput.email = trimEmail;
    //validate user input
    const { error, value } = check.loginSchema.validate(userInput);
    if (error) {
      //if error, return error
      const msg = error.details[0].message;
      // console.error(error);
      res.status(400).render("server_error", {
        message: msg,
        error: error,
      });
      return;
    }
    //if no error, destructure value
    const { email, password } = value;
    try {
      //find user by email
      const user = await Doctor.findOne({ email });
      if (!user) {
        res.status(400).render("server_error", {
          message: "invalid credentials",
          error: "invalid credentials",
        });
        return;
      }
      //compare password
      const isMatch = bcryptjs.compareSync(password, user.password);
      if (!isMatch) {
        //if password does not match, return error
        res.status(400).render("server_error", {
          message: "invalid credentials",
          error: "invalid credentials",
        });
        return;
      }

      //if password matches, create token
      const token = jwt.sign(
        {
          _id: user._id,
          isDoctor: user.isDoctor,
          isAdmin: user.isAdmin,
        },
        keycode,
        { expiresIn: "3h" }
      );

      //to be removed
      // console.log(token);

      //set cookie and header
      res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });

      // req.headers = { ...req.headers, authorization: `Bearer ${token}` };

      //return success
      next();
    } catch (err: any) {
      //if error, return error
      const msg = err.message ? err.message : err;

      res.status(500).render("server_error", {
        message: msg,
        error: err,
      });
    }
  },
  authorise: async (req: Request, res: Response, next: NextFunction) => {
    //get token from header or cookie
    const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;
    if (!token) {
      //if no token, return error
      res.status(401).render("server_error", {
        message: "unauthorised",
        error: "unauthorised",
      });
      return;
    }
    try {
      //verify token
      const decoded = jwt.verify(token, keycode) as Decode;
      // console.log(decoded);
      if (!decoded) {
        //if token is invalid, return error
        res.status(401).render("server_error", {
          message: "Session Lost.",
          error: "unauthorised",
        });
        return;
      }
      //if token is valid, proceed
      next();
    } catch (err) {
      //if error, return error

      res.status(500).render("server_error", {
        message: "failed",
        error: err,
      });
    }
  },
  adminAction: async (req: Request, res: Response, next: NextFunction) => {
    //get token from header or cookie
    const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;
    if (!token) {
      //if no token, return error
      res.status(401).render("server_error", {
        message: "Unauthorised",
        error: "Please Login",
      });
      return;
    }
    try {
      //verify token
      const decoded = jwt.verify(token, keycode) as Decode;

      if (!decoded) {
        //if token is invalid, return error
        res.status(401).render("server_error", {
          message: "Unauthorised",
          error: "Please Login",
        });
        return;
      }
      if (decoded.isAdmin) {
        //if user is admin proceed
        next();
      } else {
        //if user is not admin, return error
        res.status(401).render("server_error", {
          message: "unauthorised",
          error: "only admins can perform this action",
        });
      }
    } catch (err) {
      //if error, return error

      res.status(500).render("server_error", {
        message: "Server error",
        error: err,
      });
    }
  },
  doctorAction: async (req: Request, res: Response, next: NextFunction) => {
    //get token from header or cookie
    const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;
    if (!token) {
      //if no token, return error
      res.status(403).render("server_error", {
        title: "MedBay | Error",
        message: "Unauthorised",
        error: "Please Login",
      });
      return;
    }
    try {
      //verify token
      const decoded = jwt.verify(token, keycode) as Decode;

      if (!decoded) {
        //if token is invalid, return error
        res.status(403).render("doctor_error", {
          title: "MedBay | Error",
          message: "Unauthorised. Meet an Admin",
          error: "You do not have permission to perform this action",
        });
        return;
      }
      if (decoded.isDoctor) {
        //if user is doctor proceed
        next();
      } else {
        //if user is not doctor, return error
        res.status(401).render("doctor_error", {
          title: "MedBay | Error",
          message: "Unauthorised. Meet an Admin",
          error: "Only doctors can perform this action",
        });
      }
    } catch (err) {
      //if error, return error
      console.error(err);
      res.status(500).render("server error", {
        message: "server error",
        error: err,
      });
    }
  },
};

export default oAuth;
export { Decode };
