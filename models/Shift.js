import mongoose from "mongoose"
import Staff from "./Staff"

const shiftSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Staff",
    },
    slug: { type: String, required: true, unique: true },
    start: { type: Date, required: true, index: true },
    end: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
)

const Shift = mongoose.models.Shift || mongoose.model("Shift", shiftSchema)
export default Shift
