import axios from "axios"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { useEffect, useState, useReducer } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import Layout from "../../../components/Layout"
import { getError } from "../../../utils/error"
import moment from "moment"
import Select from "react-select"
import { PulseLoader } from "react-spinners"

function reducer(state, action) {
  switch (action.type) {
    case "SHIFTS_REQUEST":
      return { ...state, loadingShifts: true, errorShifts: "" }
    case "SHIFTS_SUCCESS":
      return { ...state, loadingShifts: false, errorShifts: "" }
    case "SHIFTS_FAIL":
      return { ...state, loadingShifts: false, errorShifts: action.payload }

    case "OPTIONS_REQUEST":
      return { ...state, loadingOptions: true, errorOptions: "" }
    case "OPTIONS_SUCCESS":
      return { ...state, loadingOptions: false, errorOptions: "" }
    case "OPTIONS_FAIL":
      return { ...state, loadingOptions: false, errorOptions: action.payload }

    case "UPDATE_REQUEST":
      return { ...state, loadingUpdate: true, errorUpdate: "" }
    case "UPDATE_SUCCESS":
      return { ...state, loadingUpdate: false, errorUpdate: "" }
    case "UPDATE_FAIL":
      return { ...state, loadingUpdate: false, errorUpdate: action.payload }
    default:
      return state
  }
}

export default function AdminShiftEditScreen() {
  //router for routing and destruct shift id passed in URL
  const router = useRouter()
  const shiftId = router.query.id

  //useStates
  const [staffSelected, setStaffSelected] = useState([])
  const [staffOptions, setStaffOptions] = useState([])
  const [staffSelectedLoading, setStaffSelectedLoading] = useState(true)

  //reducer states
  const [
    { loadingShifts, errorShifts, loadingOptions, errorOptions, loadingUpdate },
    dispatch,
  ] = useReducer(reducer, {
    loadingShifts: true,
    errorShifts: "",
    loadingOptions: true,
    errorOptions: "",
  })

  //destructuring properties that handle form logic
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm()

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "OPTIONS_REQUEST" })
        const { data } = await axios.get(`/api/admin/staffs`)
        dispatch({ type: "OPTIONS_SUCCESS" })
        const options = data.map((item) => ({
          value: item._id,
          label: item.name,
        }))
        setStaffOptions(options)
      } catch (err) {
        dispatch({ type: "OPTIONS_FAIL", payload: getError(err) })
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setStaffSelectedLoading(true)
      try {
        dispatch({ type: "SHIFTS_REQUEST" })
        const { data } = await axios.get(`/api/admin/shifts/${shiftId}`)
        dispatch({ type: "SHIFTS_SUCCESS" })
        setValue("startDate", moment(data.start).format("YYYY-MM-DD"))
        setValue("endDate", moment(data.end).format("YYYY-MM-DD"))
        setValue("startTime", moment(data.start).format("HH:mm"))
        setValue("endTime", moment(data.end).format("HH:mm"))

        // Populate staffSelected
        const staffSelected = data.staff.map((staff) => {
          return {
            value: staff._id,
            label: staff.name,
          }
        })
        setStaffSelected(staffSelected)
        setStaffSelectedLoading(false)
        console.log(staffSelected)
      } catch (err) {
        dispatch({ type: "SHIFTS_FAIL", payload: getError(err) })
      }
    }
    fetchData()
  }, [shiftId, setValue])

  const submitHandler = async ({ startDate, startTime, endDate, endTime }) => {
    try {
      const start = moment(startDate + " " + startTime, "YYYY-MM-DD HH:mm")
      const end = moment(endDate + " " + endTime, "YYYY-MM-DD HH:mm")
      const staffIdArray = []
      staffSelected.forEach((element) => staffIdArray.push(element.value))
      dispatch({ type: "UPDATE_REQUEST" })
      await axios.put(`/api/admin/shifts/${shiftId}`, {
        staffIdArray,
        start,
        end,
      })

      dispatch({ type: "UPDATE_SUCCESS" })
      toast.success("Shifts created successfully")
      router.push("/admin/shifts")
    } catch (err) {
      dispatch({ type: "UPDATE_FAIL", payload: getError(err) })
      toast.error(getError(err))
    }
  }

  return (
    <Layout title={`Edit Shift ${shiftId}`}>
      <div>
        <div>
          {loadingShifts ? (
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
          ) : errorShifts ? (
            <div className='alert-error'>{errorShifts}</div>
          ) : (
            <form
              className='mx-auto max-w-screen-md'
              onSubmit={handleSubmit(submitHandler)}
            >
              <h1 className='mb-4 text-xl'>{`Edit Shift ${shiftId}`}</h1>
              <div className='mb-4 no-overflow'>
                <label htmlFor='staffList'>Staff</label>
                {!staffSelectedLoading ? (
                  <Select
                    multiple
                    id='staffList'
                    options={staffOptions}
                    defaultValue={staffSelected}
                    isMulti
                    required
                    onChange={setStaffSelected}
                    name='colors'
                    className='w-full basic-multi-select'
                    classNamePrefix='select'
                  />
                ) : (
                  <PulseLoader />
                )}
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
                <Link href={`/admin/shifts`}>Back</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  )
}

AdminShiftEditScreen.auth = { adminOnly: true }
