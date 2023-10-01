import Joi from "joi";
import { Gender } from "../model/doctor";

const check = {
  doctorSchema: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().required(),
    specialization: Joi.string().allow("", null),
    gender: Joi.string()
      .valid(...Object.values(Gender))
      .required(),
    phone: Joi.string().required(),
  }),
  adminSchema: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().required(),
    specialization: Joi.string().allow("", null),
    gender: Joi.string()
      .valid(...Object.values(Gender))
      .required(),
    phone: Joi.string().required(),
    adminKey: Joi.string().required(),
  }),
  loginSchema: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
  reportSchema: Joi.object({
    patientName: Joi.string().required(),
    age: Joi.number().required(),
    hospitalName: Joi.string().required(),
    weight: Joi.string().required(),
    height: Joi.string().required(),
    bloodGroup: Joi.string().required(),
    genotype: Joi.string().required(),
    bloodPressure: Joi.string().required(),
    HIV_Status: Joi.string().required(),
    hepatitis: Joi.string().required(),
  }),
};

export default check;
