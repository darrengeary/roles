import moment from "moment"
import { getSession } from "next-auth/react"
import Shift from "../../../../models/Shift"
import db from "../../../../utils/db"

import Staff from "../../../../models/Staff"

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
  const { staff, start, end } = req.body
  await db.connect()

  const existingShift = await Shift.findOne({
    staff: staff,
    start: {
      $gte: moment(start).startOf("day").toDate(),
      $lt: moment(start).endOf("day").toDate(),
    },
  })
  const staffMember = await Staff.findOne({ _id: staff })
  if (existingShift) {
    await db.disconnect()
    return res.status(409).send({ message: "Shift already exists" })
  }

  const newShift = new Shift({
    staff: staffMember,
    slug: "shift-" + Math.random(),
    start: start,
    end: end,
  })

  const shift = await newShift.save()
  await db.disconnect()
  res.send({ message: "Shift created successfully", shift })
}

const getHandler = async (req, res) => {
  await db.connect()
  const shifts = await Shift.find({})
  await db.disconnect()
  let items = []
  shifts.forEach((shift) => {
    shift.staff.forEach((staff) => {
      items.push({
        id: shift._id,
        group: staff,
        start_time: moment(shift.start).valueOf(),
        end_time: moment(shift.end).valueOf(),
        slug: shift.slug,
      })
    })
  })
  res.send(items)
}
export default handler
