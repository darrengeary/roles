import bcrypt from "bcryptjs"
import Staff from "../models/Staff"

const data = {
  users: [
    {
      name: "John",
      email: "admin@example.com",
      password: bcrypt.hashSync("123456"),
      isAdmin: true,
    },
    {
      name: "Jane",
      email: "user@example.com",
      password: bcrypt.hashSync("123456"),
      isAdmin: false,
    },
  ],
  staffs: [
    {
      name: "Del Laverty",
      slug: "del",
      wage: "12",
    },
    {
      name: "Dylan McNamee",
      slug: "dylan",
      wage: "12",
    },
  ],
  events: [
    {
      title: "Event 1",
      slug: "event1",
      start: new Date(2022, 11, 2, 9, 0),
      end: new Date(2022, 11, 2, 16, 0),
    },
  ],
  shifts: [
    {
      staff: new Staff(),
      slug: "shift1",
      start: new Date(),
      end: new Date(),
    },
  ],
}

export default data
