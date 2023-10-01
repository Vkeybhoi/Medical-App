import mongoose, { Schema, Document } from "mongoose";

enum Gender {
  Male = "M",
  Female = "F",
  Other = "O",
}

interface IDoctor extends Document {
  name: string;
  email: string;
  password: string;
  isDoctor: boolean;
  isAdmin: boolean;
  specialization: string;
  gender: Gender;
  phone: string;
}

const DoctorSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true, minlength: 6 },
  isDoctor: { type: Boolean, required: true, default: false },
  isAdmin: { type: Boolean, required: true, default: false },
  specialization: {
    type: String,
    allowNull: true,
    default: "N/A",
  },
  gender: { type: String, required: true, enum: Object.values(Gender) },
  phone: { type: String, required: true },
});

const Doctor = mongoose.model<IDoctor>("Doctor", DoctorSchema);

export default Doctor;
export { Gender };
