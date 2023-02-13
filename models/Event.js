import mongoose from "mongoose"

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
)

const Event = mongoose.models.Event || mongoose.model("Event", eventSchema)
export default Event
