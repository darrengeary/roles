import { getSession } from "next-auth/react"
import Shift from "../../../../../models/Shift"
import Staff from "../../../../../models/Staff"
import db from "../../../../../utils/db"
import moment from "moment"

const handler = async (req, res) => {
  const session = await getSession({ req })
  if (!session || (session && !session.user.isAdmin)) {
    return res.status(401).send("signin required")
  }

  const { user } = session
  if (req.method === "GET") {
    if (req.query.id) {
      return getHandlerById(req, res, user)
    } else if (req.query.staff) {
      return getHandlerByStaff(req, res, user)
    } else {
      return res.status(400).send({ message: "Invalid query parameter" })
    }
  } else if (req.method === "PUT") {
    return putHandler(req, res, user)
  } else if (req.method === "DELETE") {
    return deleteHandler(req, res, user)
  } else {
    return res.status(400).send({ message: "Method not allowed" })
  }
}
const getHandlerById = async (req, res) => {
  await db.connect()
  const shift = await Shift.findById(req.query.id).populate("staff")
  await db.disconnect()
  res.send(shift)
}

const getHandlerByStaff = async (req, res) => {
  await db.connect()
  const shifts = await Shift.find({ staff: req.query.staff }).populate("staff")
  await db.disconnect()
  res.send(shifts)
}

const putHandler = async (req, res) => {
  await db.connect()
  const staff = await Staff.findById(req.body.staff)
  if (moment(req.body.start).isBefore(moment(req.body.end))) {
    const shift = await Shift.findOneAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          staff: staff,
          start: req.body.start,
          end: req.body.end,
        },
      },
      { new: true }
    ).exec()
    if (shift) {
      await db.disconnect()
      res.send({ message: "Shift updated successfully" })
    } else {
      await db.disconnect()
      res.status(404).send({ message: "Shift not found" })
    }
  } else {
    await db.disconnect()
    res
      .status(404)
      .send({ message: "Shift start time must be before end time." })
  }
}
const deleteHandler = async (req, res) => {
  await db.connect()
  const shift = await Shift.findById(req.query.id)
  if (shift) {
    await shift.remove()
    await db.disconnect()
    res.send({ message: "Shift deleted successfully" })
  } else {
    await db.disconnect()
    res.status(404).send({ message: "Shift not found" })
  }
}
export default handler
