import axios from "axios"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { useEffect, useReducer } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import Layout from "../../../components/Layout"
import { getError } from "../../../utils/error"
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
export default function AdminStaffEditScreen() {
  const { query } = useRouter()
  const staffId = query.id
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
        const { data } = await axios.get(`/api/admin/staffs/${staffId}`)
        dispatch({ type: "FETCH_SUCCESS" })
        setValue("name", data.name)
        setValue("slug", data.slug)

        setValue("wage", data.wage)
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) })
      }
    }

    fetchData()
  }, [staffId, setValue])

  const router = useRouter()

  const submitHandler = async ({ name, slug, wage }) => {
    try {
      dispatch({ type: "UPDATE_REQUEST" })
      await axios.put(`/api/admin/staffs/${staffId}`, {
        name,
        slug,

        wage,
      })
      dispatch({ type: "UPDATE_SUCCESS" })
      toast.success("Staff updated successfully")
      router.push("/admin/staffs")
    } catch (err) {
      dispatch({ type: "UPDATE_FAIL", payload: getError(err) })
      toast.error(getError(err))
    }
  }

  return (
    <Layout title={`Edit Staff ${staffId}`}>
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
              <h1 className='mb-4 text-xl'>{`Edit Staff ${staffId}`}</h1>
              <div className='mb-4'>
                <label htmlFor='name'>Name</label>
                <input
                  type='text'
                  className='w-full'
                  id='name'
                  autoFocus
                  {...register("name", {
                    required: "Please enter name",
                  })}
                />
                {errors.name && (
                  <div className='text-red-500'>{errors.name.message}</div>
                )}
              </div>
              <div className='mb-4'>
                <label htmlFor='slug'>Slug</label>
                <input
                  type='text'
                  className='w-full'
                  id='slug'
                  {...register("slug", {
                    required: "Please enter slug",
                  })}
                />
                {errors.slug && (
                  <div className='text-red-500'>{errors.slug.message}</div>
                )}
              </div>

              <div className='mb-4'>
                <button
                  disabled={loadingUpdate}
                  className='primary-button shiftmate-color'
                >
                  {loadingUpdate ? "Loading" : "Update"}
                </button>
              </div>
              <div className='mb-4'>
                <Link href={`/admin/staffs`}>Back</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  )
}

AdminStaffEditScreen.auth = { adminOnly: true }
