import axios from "axios"
import Layout from "../components/Layout"
import StaffItem from "../components/StaffItem"
import Staff from "../models/Staff"
import db from "../utils/db"

export default function Home({ staffs }) {
  return (
    <Layout title='Home Page'>
      <div>
        {staffs.map((staff) => (
          <StaffItem staff={staff} key={staff.slug}></StaffItem>
        ))}
      </div>
    </Layout>
  )
}
Home.auth = true

export async function getServerSideProps() {
  await db.connect()
  const staffs = await Staff.find().lean()
  return {
    props: {
      staffs: staffs.map(db.convertDocToObj),
    },
  }
}
