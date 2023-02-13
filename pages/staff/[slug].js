import axios from "axios"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { useContext } from "react"
import { toast } from "react-toastify"
import Layout from "../../components/Layout"
import Staff from "../../models/Staff"
import db from "../../utils/db"

export default function StaffScreen(props) {
  const { staff } = props
  const router = useRouter()
  if (!staff) {
    return <Layout title='Staff Not Found'>Staff Not Found</Layout>
  }

  return (
    <Layout title={staff.name}>
      <div className='py-2'>
        <Link href='/'>Back to Staff List</Link>
      </div>
      <div className='grid md:grid-cols-4 md:gap-3'>
        <div className='md:col-span-2'></div>
        <div>
          <ul>
            <li>
              <h1 className='text-lg'>{staff.name}</h1>
            </li>
          </ul>
        </div>
        <div>
          <div className='card p-5'></div>
        </div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps(context) {
  const { params } = context
  const { slug } = params

  await db.connect()
  const staff = await Staff.findOne({ slug }).lean()
  await db.disconnect()
  return {
    props: {
      staff: staff ? db.convertDocToObj(staff) : null,
    },
  }
}
