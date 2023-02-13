import axios from "axios"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { useState, useCallback, useEffect, useReducer } from "react"
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop"
import { toast } from "react-toastify"
import Layout from "../../components/Layout"
import { getError } from "../../utils/error"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/addons/dragAndDrop/styles.css"
import "react-big-calendar/lib/css/react-big-calendar.css"
import Timeline from "react-calendar-timeline"
import "react-calendar-timeline/lib/Timeline.css"
import Staff from "../../models/Staff"
import Shift from "../../models/Shift"
import { PulseLoader } from "react-spinners"
import { useForm } from "react-hook-form"
import Select from "react-select"

const keys = {
  groupIdKey: "id",
  groupTitleKey: "title",
  groupRightTitleKey: "rightTitle",
  itemIdKey: "id",
  itemTitleKey: "title",
  itemDivTitleKey: "title",
  itemGroupKey: "group",
  itemTimeStartKey: "start",
  itemTimeEndKey: "end",
  groupLabelKey: "title",
}

export default function AdminShiftsScreen({ staff, shifts }) {
  //client side routing
  const router = useRouter()
  const [staffSelected, setStaffSelected] = useState([])
  const [staffOptions, setStaffOptions] = useState([])
  const [activeTab, setActiveTab] = useState("standard")
  const [startView, setStartView] = useState()
  const [endView, setEndView] = useState()
  const [week, setWeek] = useState(0)
  const [editView, setEditView] = useState(false)
  const [editShift, setEditShift] = useState({})
  const currentDate = moment()
  const weekStart = currentDate.clone().startOf("week").add(week, "weeks")
  const weekEnd = currentDate.clone().endOf("week").add(week, "weeks")
  const DnDCalendar = withDragAndDrop(Calendar)
  const localizer = momentLocalizer(moment)
  const days = []
  let currentDay = weekStart

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm()

  while (currentDay <= weekEnd) {
    days.push(currentDay.clone())
    currentDay = currentDay.clone().add(1, "day")
  }
  const weekDays = days.map((day) => {
    return {
      header: moment(day).format("ddd DD"),
      dateString: moment(day),
    }
  })
  const handleNext = () => {
    setWeek(week + 1)
  }
  const handlePrev = () => {
    setWeek(week - 1)
  }
  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const MyCalendar = (props) => (
    <div>
      <DnDCalendar
        localizer={localizer}
        startAccessor='start'
        endAccessor='end'
        style={{ height: 600 }}
        shifts={shifts}
        resizable
        selectable
      />
    </div>
  )

  //async function represents eventual completion
  //await operator waits for successful result before continuing. Must be in async function
  const createHandler = async () => {
    try {
      dispatch({ type: "CREATE_REQUEST" })
      const { data } = await axios.post(`/api/admin/shifts`) //The desired data.data destructed to just data
      dispatch({ type: "CREATE_SUCCESS" })
      router.push(`/admin/shift/${data.shift._id}`)
    } catch (err) {
      dispatch({ type: "CREATE_FAIL" })
      toast.error(getError(err))
    }
  }
  //delete async function awaits deletion and dispatches delete_success
  //if error then it will not proceed and catches err
  const deleteHandler = async (shiftId) => {
    setEditView(false)
    setEditShift({})
    try {
      await axios.delete(`/api/admin/shifts/${shiftId}`)
    } catch (err) {
      toast.error(getError(err))
    }
  }
  const handleItemResize = (itemId, time, edge) => {
    const itemIndex = shifts.findIndex((item) => item.id === itemId)
    let updatedItem = { ...shifts[itemIndex] }
    if (edge === "right") {
      updatedItem = { ...updatedItem, end_time: time }
    } else {
      updatedItem = { ...updatedItem, start_time: time }
    }

    dispatch({
      type: "SHIFTS_SUCCESS",
      payload: [
        ...shifts.slice(0, itemIndex),
        updatedItem,
        ...shifts.slice(itemIndex + 1),
      ],
    })
  }
  const itemRenderer = ({
    item,
    timelineContext,
    itemContext,
    getItemProps,
    getResizeProps,
  }) => {
    const { left: leftResizeProps, right: rightResizeProps } = getResizeProps()
    const backgroundColor = itemContext.selected ? "yellow" : "orange"
    const borderColor = itemContext.resizing ? "red" : item.color

    return (
      <div
        {...getItemProps({
          style: {
            backgroundColor,
            color: item.color,
            borderColor,
            borderStyle: "solid",
            borderWidth: 1,
            borderRadius: 4,
            borderLeftWidth: itemContext.selected ? 3 : 1,
            borderRightWidth: itemContext.selected ? 3 : 1,
          },
          onMouseDown: () => {
            toast.success("Mouse")
          },
          onTouchStart: () => {
            toast.success("Touch")
          },
        })}
      >
        {itemContext.useResizeHandle ? (
          <div className='ps-5' {...rightResizeProps}>
            &#9656;
          </div>
        ) : null}

        <div
          style={{
            height: itemContext.dimensions.height,
            overflow: "hidden",
            paddingLeft: 3,
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          <div className='text-center'>
            {moment(itemContext.dimensions.collisionLeft).format("HH:mm") +
              " - " +
              moment(itemContext.dimensions.collisionLeft)
                .add(itemContext.dimensions.collisionWidth)
                .format("HH:mm")}
          </div>
        </div>

        {itemContext.useResizeHandle ? <div {...rightResizeProps} /> : null}
      </div>
    )
  }
  const handleTimeChange = (
    visibleTimeStart,
    visibleTimeEnd,
    updateScrollCanvas
  ) => {
    updateScrollCanvas(visibleTimeStart, visibleTimeEnd)
  }
  const handleItemMove = (itemId, dragTime, newGroupOrder) => {
    const itemIndex = shifts.findIndex((item) => item.id === itemId)
    const dragEndTime = dragTime - moment(shifts[itemIndex].start_time)
    let updatedItem = { ...shifts[itemIndex] }
    updatedItem = {
      ...updatedItem,
      start_time: dragTime,
      end_time: moment(shifts[itemIndex].end_time) + dragEndTime,
      group: staff[newGroupOrder].id,
    }
    // Dispatch an action to update the shifts state
    dispatch({
      type: "SHIFTS_SUCCESS",
      payload: [
        ...shifts.slice(0, itemIndex),
        updatedItem,
        ...shifts.slice(itemIndex + 1),
      ],
    })
  }

  const createInit = async (employeeId, day) => {
    const options = staff.map((item) => ({
      value: item.id,
      label: item.title,
    }))

    options.forEach((e) => {
      if (e.value === employeeId) {
        setStaffSelected(e)
      }
    })

    setStaffOptions(options)

    setEditShift({
      staffId: employeeId,
      day: moment(day.dateString),
    })
    setEditView(true)
  }

  const editInit = (s, title) => {
    const options = staff.map((item) => ({
      value: item.id,
      label: item.title,
    }))

    options.forEach((e) => {
      if (e.value === s.staff.id) {
        setStaffSelected(e)
      }
    })

    setStaffOptions(options)

    setEditView(true)
    setEditShift({
      staffId: s.staff,
      title: title,
      day: moment(s.start),
      shiftId: s.id,
      shiftStart: moment(s.start).format("HH:mm"),
      shiftEnd: moment(s.end).format("HH:mm"),
    })
  }

  const submitHandler = async ({ startInput, endInput, nextDay }) => {
    const startDate = moment(
      moment(editShift.day).format("DD MMM YYYY") + " " + startInput,
      "DD MMM YYYY HH:mm"
    )
    const endDate = moment(
      moment(editShift.day).format("DD MMM YYYY") + " " + endInput,
      "DD MMM YYYY HH:mm"
    )

    if (nextDay) {
      moment(endDate).add(1, "days")
    }

    if (moment(startDate).isAfter(moment(endDate))) {
      toast.error("End time is before start time")
    } else {
      const updateOrCreateShift = async (selected) => {
        const existingShift = shifts.find(
          (shift) =>
            shift.staff === selected.value &&
            moment(startDate).format("YYYY MM DD") ===
              moment(shift.start).format("YYYY MM DD")
        )
        try {
          if (existingShift) {
            await axios.put(`/api/admin/shifts/${existingShift._id}`, {
              staff: selected.value,
              start: startDate,
              end: endDate,
            })
          } else {
            await axios.post("/api/admin/shifts", {
              staff: selected.value,
              start: startDate,
              end: endDate,
            })
          }
        } catch (err) {
          setEditShift({})
          toast.error(`Error Updating/Creating Shift for ${selected.label}`)
        }
      }

      if (Array.isArray(staffSelected)) {
        staffSelected.forEach(updateOrCreateShift)
      } else {
        updateOrCreateShift(staffSelected)
      }

      setEditShift({})
      setEditView(false)
      setStaffSelected()
    }
  }

  return (
    <>
      <Layout title='Admin Shifts'>
        <div>
          <div className='flex justify-between'>
            <h1 className='mb-4 text-xl'>Shifts</h1>

            <button onClick={createHandler} className='primary-button'></button>
          </div>
          {!staff ? (
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
          ) : (
            <>
              <div>
                <div className='tab-container'>
                  <div
                    className={`tab ${
                      activeTab === "standard" ? "active" : ""
                    }`}
                    onClick={() => handleTabChange("standard")}
                  >
                    Standard
                  </div>
                  <div
                    className={`tab ${
                      activeTab === "calendar" ? "active" : ""
                    }`}
                    onClick={() => handleTabChange("calendar")}
                  >
                    Calendar
                  </div>
                  <div
                    className={`tab ${
                      activeTab === "timeline" ? "active" : ""
                    }`}
                    onClick={() => handleTabChange("timeline")}
                  >
                    Interactive
                  </div>
                </div>
                <div className='tab-content-container'>
                  {activeTab === "standard" ? (
                    <div className='w-full'>
                      {editView ? (
                        <div className='flex justify-center'>
                          <div className='fixed flex items-center justify-center'>
                            <div className='edit-view h-auto bg-white rounded-lg mx-auto mt-20'>
                              <div className='p-5 text-black'>
                                <h2 className='text-lg  text-center font-medium'>
                                  {editShift.title}
                                </h2>

                                <h2 className='text-lg  text-center font-medium'>
                                  {moment(editShift.day).format("ddd MMM YYYY")}
                                </h2>
                                <form onSubmit={handleSubmit(submitHandler)}>
                                  {!editShift.staff ? (
                                    <Select
                                      multiple
                                      id='staffList'
                                      options={staffOptions}
                                      defaultValue={staffSelected}
                                      isMulti
                                      required
                                      onChange={setStaffSelected}
                                      name='colors'
                                      className='w-full text-black basic-multi-select'
                                      classNamePrefix='select'
                                    />
                                  ) : (
                                    <></>
                                  )}
                                  <div className='grid grid-cols-3 gap-3 my-5'>
                                    <div>
                                      Start:
                                      <input
                                        className='time-input'
                                        type='time'
                                        defaultValue={editShift.shiftStart}
                                        {...register("startInput", {
                                          required: "Please enter start time",
                                        })}
                                      />
                                    </div>

                                    <div className='time-input'>
                                      End:
                                      <input
                                        className='time-input'
                                        type='time'
                                        defaultValue={editShift.shiftEnd}
                                        {...register("endInput", {
                                          required: "Please enter end time",
                                        })}
                                      />
                                    </div>
                                    <div className='mt-8'>
                                      <input
                                        className='time-input'
                                        type='checkbox'
                                        defaultValue={editShift.shiftEnd}
                                        {...register("nextDay")}
                                      />
                                      +1 Day
                                    </div>
                                  </div>
                                  <div className='flex justify-center align-items-center text-center'>
                                    <div
                                      onClick={() =>
                                        deleteHandler(editShift.shiftId)
                                      }
                                      className='delete p-5 '
                                    >
                                      <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        fill='none'
                                        viewBox='0 0 24 24'
                                        strokeWidth={1.5}
                                        stroke='red'
                                        className='w-6 h-6'
                                      >
                                        <path
                                          strokeLinecap='round'
                                          strokeLinejoin='round'
                                          d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
                                        />
                                      </svg>
                                    </div>
                                    <button className='primary-button save-button text-white font-medium py-2 px-4 rounded-lg'>
                                      Save
                                    </button>
                                  </div>
                                </form>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <></>
                      )}
                      <button onClick={handlePrev}>Previous</button>
                      <button onClick={handleNext}>Next</button>
                      <table className='standard-table'>
                        <thead className='grey-cell'>
                          <tr className='head'>
                            <th>Staff</th>
                            {weekDays.map((day) => (
                              <th key={day.header}>{day.header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {staff.map((employee) => (
                            <tr key={employee.id}>
                              <td className='grey-cell staff-col'>
                                {employee.title}
                              </td>
                              {weekDays.map((day) => {
                                const column = moment(day.dateString).format(
                                  "DD MM YYYY"
                                )

                                let shift = null
                                shifts.forEach((s) => {
                                  if (
                                    employee.id == s.staff &&
                                    moment(s.start).format("DD MM YYYY") ===
                                      column
                                  ) {
                                    shift = (
                                      <td
                                        onClick={() =>
                                          editInit(s, employee.title)
                                        }
                                        className='text-center shift-active'
                                        key={s.id}
                                      >
                                        {moment(s.start).format("HH:mm") +
                                          " - " +
                                          moment(s.end).format("HH:mm")}
                                      </td>
                                    )
                                  }
                                })
                                return (
                                  shift || (
                                    <td
                                      onClick={() =>
                                        createInit(employee.id, day)
                                      }
                                      key={day.header}
                                    />
                                  )
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <></>
                  )}

                  {activeTab && activeTab === "timeline" ? (
                    <>
                      <Timeline
                        groups={staff}
                        items={shifts}
                        stackItems={true}
                        useResizeHandle={true}
                        defaultTimeStart={moment().startOf("day").toDate()}
                        defaultTimeEnd={moment()
                          .startOf("day")
                          .add(1, "day")
                          .toDate()}
                        visibleTimeStart={startView}
                        visibleTimeEnd={endView}
                        canMove={true}
                        dragSnap={15 * 60 * 1000}
                        onItemMove={handleItemMove}
                        itemRenderer={itemRenderer}
                        onItemResize={handleItemResize}
                        onTimeChange={handleTimeChange}
                        showCursorLine={true}
                      />
                    </>
                  ) : (
                    <></>
                  )}
                  {activeTab == "calendar" ? (
                    <div className='calendar'>
                      <MyCalendar />
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
              <div className='overflow-x-auto'>
                <table className='min-w-full'>
                  <thead className='border-b'>
                    <tr>
                      <th className='px-5 text-left'>ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shifts.map((shift) => (
                      <tr key={shift._id} className='border-b'>
                        <td className=' p-5 '>{shift.id.substring(20, 24)}</td>

                        <td className=' p-5 '>
                          <Link href={`/admin/shift/${shift.id}`}>
                            <a type='button' className='default-button'>
                              Edit
                            </a>
                          </Link>
                          &nbsp;
                          <button
                            onClick={() => deleteHandler(shift.id)}
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
            </>
          )}
        </div>
      </Layout>
    </>
  )
}

AdminShiftsScreen.auth = { adminOnly: true }

export async function getServerSideProps() {
  const staffData = await Staff.find()

  const staff = staffData.map((emp) => ({
    id: emp._id.toString(),
    title: emp.name,
  }))

  const startRange = moment(new Date()).subtract(1, "weeks").startOf("week")
  const endRange = moment(new Date()).add(2, "weeks").endOf("week")

  const shiftData = await Shift.find({
    start: {
      $gte: startRange,
      $lt: endRange,
    },
  }).populate("staff")

  const shifts = shiftData.map((item) => ({
    id: item._id.toString(),
    staff: item.staff.id.toString(),
    start: item.start.toString(),
    end: item.end.toString(),
  }))

  return {
    props: {
      staff,
      shifts,
    },
  }
}
