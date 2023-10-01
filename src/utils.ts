import { config } from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Doctor from "./model/doctor";
import { Decode } from "./auth/oAuth";

export function decodeId(req: Request) {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;
  if (!token) return false;

  const decode = jwt.verify(token, process.env.JWT_SECRET!) as Decode;
  if (!decode) return false;

  return decode._id;
}

export function decodeAdmin(req: Request) {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;
  if (!token) return false;

  const decode = jwt.verify(token, process.env.JWT_SECRET!) as Decode;
  if (!decode) return false;

  return decode.isAdmin;
}

export function decodeDoctor(req: Request) {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;
  if (!token) return false;

  const decode = jwt.verify(token, process.env.JWT_SECRET!) as Decode;
  if (!decode) return false;

  return decode.isDoctor;
}

export function idMatch(req: Request, id: string) {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;
  if (!token) return false;

  const decode = jwt.verify(token, process.env.JWT_SECRET!) as Decode;
  if (!decode) return false;

  return decode._id === id;
}

export async function doctorName(req: Request) {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;
  if (!token) return false;

  const decode = jwt.verify(token, process.env.JWT_SECRET!) as Decode;
  if (!decode) return false;

  const doctor = await Doctor.findById(decode._id);
  if (!doctor) return "Doctor";

  return doctor.name;
}
