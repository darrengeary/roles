import Link from "next/link"
import React, { useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import Layout from "../components/Layout"
import { getError } from "../utils/error"
import { toast } from "react-toastify"
import { useRouter } from "next/router"

export default function LoginScreen() {
  const { data: session } = useSession()

  const router = useRouter()
  const { redirect } = router.query

  useEffect(() => {
    if (session?.user) {
      router.push(redirect || "/")
    }
  }, [router, session, redirect])

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm()
  const submitHandler = async ({ email, password }) => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })
      if (result.error) {
        toast.error(result.error)
      }
    } catch (err) {
      toast.error(getError(err))
    }
  }
  return (
    <Layout title='Login'>
      <form
        className='bg-grey login-card text-white mx-auto max-w-screen-sm'
        onSubmit={handleSubmit(submitHandler)}
      >
        <h1 className='text-center font-extrabold mb-4 text-xl'>Sign In</h1>
        <div className='mb-4'>
          <label className='text-sm' htmlFor='email'>
            Email
          </label>
          <input
            type='email'
            {...register("email", {
              required: "Please enter email",
              pattern: {
                value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/i,
                message: "Please enter valid email",
              },
            })}
            className='text-black w-full'
            id='email'
            autoFocus
          ></input>
          {errors.email && (
            <div className='text-red-500'>{errors.email.message}</div>
          )}
        </div>
        <div className='mb-4'>
          <label className='text-sm' htmlFor='password'>
            Password
          </label>
          <input
            type='password'
            {...register("password", {
              required: "Please enter password",
              minLength: { value: 6, message: "password is more than 5 chars" },
            })}
            className='text-black w-full'
            id='password'
          ></input>
          {errors.password && (
            <div className='text-red-500 '>{errors.password.message}</div>
          )}
        </div>
        <div className='mb-4 '>
          <button className='primary-button big-btn bg-white'>Login</button>
        </div>
        <div className='mb-4 no-deco'>
          Don&apos;t have an account? &nbsp;
          <Link href={`/register?redirect=${redirect || "/"}`}>Register</Link>
        </div>
      </form>
    </Layout>
  )
}
