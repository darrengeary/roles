import { getSession } from "next-auth/react"
import Event from "../../../../../models/Event"
import db from "../../../../../utils/db"
import moment from "moment"

const handler = async (req, res) => {
  const session = await getSession({ req })
  if (!session || (session && !session.user.isAdmin)) {
    return res.status(401).send("signin required")
  }

  const { user } = session
  if (req.method === "GET") {
    return getHandler(req, res, user)
  } else if (req.method === "PUT") {
    return putHandler(req, res, user)
  } else if (req.method === "DELETE") {
    return deleteHandler(req, res, user)
  } else {
    return res.status(400).send({ message: "Method not allowed" })
  }
}
const getHandler = async (req, res) => {
  await db.connect()
  const event = await Event.findById(req.query.id)
  await db.disconnect()
  res.send(event)
}
const putHandler = async (req, res) => {
  await db.connect()
  const event = await Event.findById(req.query.id)
  if (moment(req.body.start).isBefore(moment(req.body.end))) {
    if (event) {
      event.title = req.body.title
      event.start = req.body.start
      event.end = req.body.end
      await event.save()
      await db.disconnect()
      res.send({ message: "Event updated successfully" })
    } else {
      await db.disconnect()
      res.status(404).send({ message: "Event not found" })
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
  const event = await Event.findById(req.query.id)
  if (event) {
    await event.remove()
    await db.disconnect()
    res.send({ message: "Event deleted successfully" })
  } else {
    await db.disconnect()
    res.status(404).send({ message: "Event not found" })
  }
}
export default handler
