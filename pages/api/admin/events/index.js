import moment from "moment"
import { getSession } from "next-auth/react"
import Event from "../../../../models/Event"
import db from "../../../../utils/db"

const handler = async (req, res) => {
  const session = await getSession({ req })
  if (!session || !session.user.isAdmin) {
    return res.status(401).send("admin signin required")
  }
  // const { user } = session;
  if (req.method === "GET") {
    return getHandler(req, res)
  } else if (req.method === "POST") {
    return postHandler(req, res)
  } else {
    return res.status(400).send({ message: "Method not allowed" })
  }
}
const postHandler = async (req, res) => {
  const today = new Date()
  await db.connect()
  const newEvent = new Event({
    title: "New Shift",
    slug: "shift-" + Math.random(),
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      9,
      0,
      0
    ),
    end: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      16,
      0,
      0
    ),
  })

  const event = await newEvent.save()
  await db.disconnect()
  res.send({ message: "Event created successfully", event })
}
const getHandler = async (req, res) => {
  await db.connect()
  const events = await Event.find({})
  await db.disconnect()
  res.send(events)
}
export default handler
