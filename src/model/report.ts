import mongoose, { Schema, Document } from "mongoose";

interface IReport extends Document {
  patientName: string;
  age: number;
  hospitalName: string;
  weight: string;
  height: string;
  bloodGroup: string;
  genotype: string;
  bloodPressure: string;
  HIV_Status: string;
  hepatitis: string;
  doctorId: mongoose.Types.ObjectId;
}

const ReportSchema: Schema = new Schema({
  patientName: { type: String, required: true },
  age: { type: Number, required: true },
  hospitalName: { type: String, required: true },
  weight: { type: String, required: true },
  height: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  genotype: { type: String, required: true },
  bloodPressure: { type: String, required: true },
  HIV_Status: { type: String, required: true },
  hepatitis: { type: String, required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
});

const Report = mongoose.model<IReport>("Report", ReportSchema);

export default Report;
