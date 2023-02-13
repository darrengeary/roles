import mongoose from "mongoose"

const staffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    wage: { type: Number },
  },
  {
    timestamps: true,
  }
)

const Staff = mongoose.models.Staff || mongoose.model("Staff", staffSchema)
export default Staff
