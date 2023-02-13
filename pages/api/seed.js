import Staff from "../../models/Staff"
import User from "../../models/User"
import Event from "../../models/Event"
import Shift from "../../models/Shift"
import data from "../../utils/data"
import db from "../../utils/db"

const handler = async (req, res) => {
  await db.connect()
  await User.deleteMany()
  await User.insertMany(data.users)
  await Staff.deleteMany()
  await Staff.insertMany(data.staffs)
  await Event.deleteMany()
  await Event.insertMany(data.events)
  await Shift.deleteMany()
  await Shift.insertMany(data.shifts)
  await db.disconnect()
  res.send({ message: "seeded successfully" })
}
export default handler
