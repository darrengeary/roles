import axios from "axios"
import Link from "next/link"
import { Bar } from "react-chartjs-2"
import { PulseLoader } from "react-spinners"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import React, { useEffect, useReducer } from "react"
import Layout from "../../components/Layout"
import { getError } from "../../utils/error"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
  },
}

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" }
    case "FETCH_SUCCESS":
      return { ...state, loading: false, summary: action.payload, error: "" }
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload }
    default:
      state
  }
}
function AdminDashboardScreen() {
  const [{ loading, error, summary }, dispatch] = useReducer(reducer, {
    loading: true,
    summary: { salesData: [] },
    error: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" })
        const { data } = await axios.get(`/api/admin/summary`)
        dispatch({ type: "FETCH_SUCCESS", payload: data })
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) })
      }
    }

    fetchData()
  }, [])

  const data = {
    labels: summary.salesData.map((x) => x._id), // 2022/01 2022/03
    datasets: [
      {
        label: "Sales",
        backgroundColor: "rgba(162, 222, 208, 1)",
        data: summary.salesData.map((x) => x.totalSales),
      },
    ],
  }
  return (
    <Layout title='Dashboard'>
      <div>
        <div>
          <h1 className='mb-4 text-xl'>Dashboard</h1>
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
              }}
            >
              <img className='h-7 mt-1' src='/images/logo2.webp'></img>
              <PulseLoader size={15} color={"#eb5459"} />
            </div>
          ) : error ? (
            <div className='alert-error'>{error}</div>
          ) : (
            <div>
              <div className='grid grid-cols-1 md:grid-cols-4'>
                <div className='card m-5 p-5'>
                  <p className='text-3xl'>{summary.staffsCount} </p>
                  <p>Staffs</p>
                  <Link href='/admin/staffs'>View staffs</Link>
                </div>
                <div className='card m-5 p-5'>
                  <p className='text-3xl'>{summary.usersCount} </p>
                  <p>Users</p>
                  <Link href='/admin/users'>View users</Link>
                </div>
              </div>
              <h2 className='text-xl'>Sales Report</h2>
              <Bar
                options={{
                  legend: { display: true, position: "right" },
                }}
                data={data}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

AdminDashboardScreen.auth = { adminOnly: true }
export default AdminDashboardScreen
