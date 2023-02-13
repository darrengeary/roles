import { getSession } from "next-auth/react"
import Staff from "../../../../models/Staff"
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
  await db.connect()
  const newStaff = new Staff({
    name: "sample name",
    slug: "sample-name-" + Math.random(),
    wage: "12",
  })

  const staff = await newStaff.save()
  await db.disconnect()
  res.send({ message: "Staff created successfully", staff })
}
const getHandler = async (req, res) => {
  await db.connect()
  const staffs = await Staff.find({})
  await db.disconnect()
  res.send(staffs)
}
export default handler
