import axios from "axios"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { useEffect, useState, useReducer } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import Layout from "../../../components/Layout"
import { getError } from "../../../utils/error"
import moment from "moment"
import { PulseLoader } from "react-spinners"

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" }
    case "FETCH_SUCCESS":
      return { ...state, loading: false, error: "" }
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload }

    case "UPDATE_REQUEST":
      return { ...state, loadingUpdate: true, errorUpdate: "" }
    case "UPDATE_SUCCESS":
      return { ...state, loadingUpdate: false, errorUpdate: "" }
    case "UPDATE_FAIL":
      return { ...state, loadingUpdate: false, errorUpdate: action.payload }

    case "UPLOAD_REQUEST":
      return { ...state, loadingUpload: true, errorUpload: "" }
    case "UPLOAD_SUCCESS":
      return {
        ...state,
        loadingUpload: false,
        errorUpload: "",
      }
    case "UPLOAD_FAIL":
      return { ...state, loadingUpload: false, errorUpload: action.payload }

    default:
      return state
  }
}
export default function AdminEventEditScreen() {
  const { query } = useRouter()
  const eventId = query.id
  const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: "",
    })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm()

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" })
        const { data } = await axios.get(`/api/admin/events/${eventId}`)
        dispatch({ type: "FETCH_SUCCESS" })
        console.log(moment(data.start).format("HH:mm"))
        setValue("title", data.title)
        setValue("startDate", moment(data.start).format("YYYY-MM-DD"))
        setValue("endDate", moment(data.end).format("YYYY-MM-DD"))
        setValue("startTime", moment(data.start).format("HH:mm"))
        setValue("endTime", moment(data.end).format("HH:mm"))
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) })
      }
    }

    fetchData()
  }, [eventId, setValue])

  const router = useRouter()

  const submitHandler = async ({
    title,
    slug,
    startDate,
    startTime,
    endDate,
    endTime,
    end,
  }) => {
    try {
      var start = moment(startDate + " " + startTime, "YYYY-MM-DD HH:mm")
      var end = moment(endDate + " " + endTime, "YYYY-MM-DD HH:mm")
      dispatch({ type: "UPDATE_REQUEST" })
      await axios.put(`/api/admin/events/${eventId}`, {
        title,
        slug,
        start,
        end,
      })
      dispatch({ type: "UPDATE_SUCCESS" })
      toast.success("Event updated successfully")
      router.push("/admin/events")
    } catch (err) {
      dispatch({ type: "UPDATE_FAIL", payload: getError(err) })
      toast.error(getError(err))
    }
  }

  return (
    <Layout title={`Edit Event ${eventId}`}>
      <div>
        <div>
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
            <form
              className='mx-auto max-w-screen-md'
              onSubmit={handleSubmit(submitHandler)}
            >
              <h1 className='mb-4 text-xl'>{`Edit Event ${eventId}`}</h1>
              <div className='mb-4'>
                <label htmlFor='title'>Name</label>
                <input
                  type='text'
                  className='w-full'
                  id='title'
                  autoFocus
                  {...register("title", {
                    required: "Please enter title",
                  })}
                />
                {errors.title && (
                  <div className='text-red-500'>{errors.title.message}</div>
                )}
              </div>
              <div className='grid grid-cols-2 gap-5'>
                <div className='col-span-1 mb-4'>
                  <label htmlFor='startDate'>Start Date</label>
                  <input
                    type='date'
                    className='w-full'
                    id='startDate'
                    {...register("startDate", {
                      required: "Please enter start date",
                    })}
                  />
                </div>
                <div className='col-span-1 mb-4'>
                  <label htmlFor='endDate'>End Date</label>
                  <input
                    type='date'
                    className='w-full'
                    id='endDate'
                    {...register("endDate", {
                      required: "Please enter end date",
                    })}
                  />
                </div>
              </div>
              <div className='grid grid-cols-2 gap-5'>
                <div className='col-span-1 mb-4'>
                  <label htmlFor='startTime'>Start Time</label>
                  <input
                    type='time'
                    {...register("startTime", {
                      required: "Please enter start time",
                    })}
                    className='w-full'
                    id='startTime'
                  />
                </div>
                <div className='col-span-1 mb-4'>
                  <label htmlFor='endTime'>End Time</label>
                  <input
                    type='time'
                    {...register("endTime", {
                      required: "Please enter end time",
                    })}
                    className='w-full'
                    id='endTime'
                  />
                </div>
                {errors.start && (
                  <div className='text-red-500'>{errors.start.message}</div>
                )}
                {errors.end && (
                  <div className='text-red-500'>{errors.end.message}</div>
                )}
              </div>
              <div className='mb-4'>
                <button disabled={loadingUpdate} className='primary-button'>
                  {loadingUpdate ? "Loading" : "Update"}
                </button>
              </div>
              <div className='mb-4'>
                <Link href={`/admin/events`}>Back</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  )
}

AdminEventEditScreen.auth = { adminOnly: true }
