import axios from "axios"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { useState, useCallback, useEffect, useReducer } from "react"
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop"
import { toast } from "react-toastify"
import { PulseLoader } from "react-spinners"
import Layout from "../../components/Layout"
import { getError } from "../../utils/error"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/addons/dragAndDrop/styles.css"
import "react-big-calendar/lib/css/react-big-calendar.css"

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" }
    case "FETCH_SUCCESS":
      return { ...state, loading: false, events: action.payload, error: "" }
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload }
    case "CREATE_REQUEST":
      return { ...state, loadingCreate: true }
    case "CREATE_SUCCESS":
      return { ...state, loadingCreate: false }
    case "CREATE_FAIL":
      return { ...state, loadingCreate: false }
    case "DELETE_REQUEST":
      return { ...state, loadingDelete: true }
    case "DELETE_SUCCESS":
      return { ...state, loadingDelete: false, successDelete: true }
    case "DELETE_FAIL":
      return { ...state, loadingDelete: false }
    case "DELETE_RESET":
      return { ...state, loadingDelete: false, successDelete: false }

    default:
      state
  }
}

export default function AdminEventsScreen() {
  const router = useRouter()
  const DnDCalendar = withDragAndDrop(Calendar)
  const localizer = momentLocalizer(moment)

  const MyCalendar = (props) => (
    <div>
      <DnDCalendar
        localizer={localizer}
        startAccessor='start'
        endAccessor='end'
        style={{ height: 600 }}
        events={events}
        resizable
        selectable
      />
    </div>
  )
  const [
    { loading, error, events, loadingCreate, successDelete, loadingDelete },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    events: [],
    error: "",
  })

  const createHandler = async () => {
    try {
      dispatch({ type: "CREATE_REQUEST" })
      const { data } = await axios.post(`/api/admin/events`)
      dispatch({ type: "CREATE_SUCCESS" })
      toast.success("Event created successfully")
      router.push(`/admin/event/${data.event._id}`)
    } catch (err) {
      dispatch({ type: "CREATE_FAIL" })
      toast.error(getError(err))
    }
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" })
        const { data } = await axios.get(`/api/admin/events`)
        dispatch({ type: "FETCH_SUCCESS", payload: data })
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) })
      }
    }

    if (successDelete) {
      dispatch({ type: "DELETE_RESET" })
    } else {
      fetchData()
    }
  }, [successDelete])

  const deleteHandler = async (eventId) => {
    try {
      dispatch({ type: "DELETE_REQUEST" })
      await axios.delete(`/api/admin/events/${eventId}`)
      dispatch({ type: "DELETE_SUCCESS" })
      toast.success("Event deleted successfully")
    } catch (err) {
      dispatch({ type: "DELETE_FAIL" })
      toast.error(getError(err))
    }
  }

  return (
    <>
      <Layout title='Admin Events'>
        <div>
          <div className='flex justify-between'>
            <h1 className='mb-4 text-xl'>Events</h1>
            {loadingDelete && (
              <div>
                Deleting
                <PulseLoader size={15} color={"#eb5459"} />
              </div>
            )}
            <button
              disabled={loadingCreate}
              onClick={createHandler}
              className='primary-button'
            >
              {loadingCreate ? "Loading" : "Create"}
            </button>
          </div>
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
            <div className='overflow-x-auto'>
              <table className='min-w-full'>
                <thead className='border-b'>
                  <tr>
                    <th className='px-5 text-left'>ID</th>
                    <th className='p-5 text-left'>NAME</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event._id} className='border-b'>
                      <td className=' p-5 '>{event._id.substring(20, 24)}</td>
                      <td className=' p-5 '>{event.title}</td>

                      <td className=' p-5 '>
                        <Link href={`/admin/event/${event._id}`}>
                          <a type='button' className='default-button'>
                            Edit
                          </a>
                        </Link>
                        &nbsp;
                        <button
                          onClick={() => deleteHandler(event._id)}
                          className='default-button'
                          type='button'
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className='mt-8 bg-white'></div>
          <div className='mt-8 bg-white'>
            <MyCalendar></MyCalendar>
          </div>
        </div>
      </Layout>
    </>
  )
}

AdminEventsScreen.auth = { adminOnly: true }
