import Staff from "../../../models/Staff"
import db from "../../../utils/db"

const handler = async (req, res) => {
  await db.connect()
  const staff = await Staff.findById(req.query.id)
  await db.disconnect()
  res.send(staff)
}

export default handler
