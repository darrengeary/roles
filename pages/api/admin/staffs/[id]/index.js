import { getSession } from "next-auth/react"
import Staff from "../../../../../models/Staff"
import db from "../../../../../utils/db"

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
  const staff = await Staff.findById(req.query.id)
  await db.disconnect()
  res.send(staff)
}
const putHandler = async (req, res) => {
  await db.connect()
  const staff = await Staff.findById(req.query.id)
  if (staff) {
    staff.name = req.body.name
    staff.slug = req.body.slug
    staff.wage = req.body.wage

    await staff.save()
    await db.disconnect()
    res.send({ message: "Staff updated successfully" })
  } else {
    await db.disconnect()
    res.status(404).send({ message: "Staff not found" })
  }
}
const deleteHandler = async (req, res) => {
  await db.connect()
  const staff = await Staff.findById(req.query.id)
  if (staff) {
    await staff.remove()
    await db.disconnect()
    res.send({ message: "Staff deleted successfully" })
  } else {
    await db.disconnect()
    res.status(404).send({ message: "Staff not found" })
  }
}
export default handler
