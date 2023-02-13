import { signOut, useSession } from "next-auth/react"
import Head from "next/head"
import Link from "next/link"
import React, { useContext, useEffect, useState } from "react"
import { ToastContainer } from "react-toastify"
import { Menu } from "@headlessui/react"
import "react-toastify/dist/ReactToastify.css"
import { Spin as Hamburger } from "hamburger-react"
import DropdownLink from "./DropdownLink"
import { useRouter } from "next/router"

const sideList = [
  {
    svg: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        strokeWidth={1.5}
        stroke='currentColor'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z'
        />
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z'
        />
      </svg>
    ),
    title: "Dashboard",
    link: "/admin/dashboard",
  },
  {
    svg: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        strokeWidth={1.5}
        stroke='currentColor'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z'
        />
      </svg>
    ),
    title: "Shifts",
    link: "/admin/shifts",
  },
  {
    svg: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        strokeWidth={1.5}
        stroke='currentColor'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z'
        />
      </svg>
    ),
    title: "Events",
    link: "/admin/events",
  },
  {
    svg: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        strokeWidth={1.5}
        stroke='currentColor'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z'
        />
      </svg>
    ),
    title: "Employees",
    link: "/admin/staffs",
  },
]

export default function Layout({ title, children }) {
  const { status, data: session } = useSession()
  const router = useRouter()
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [active, setActive] = useState(router.asPath)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    setHeight(window.innerHeight)
    window.addEventListener("resize", () => setHeight(window.innerHeight))
  }, [])

  useEffect(() => {
    setActive(router.asPath)
  }, [router.asPath])

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible)
  }

  const logoutClickHandler = () => {
    signOut({ callbackUrl: "/login" })
  }
  const getYear = () => {
    return new Date().getFullYear()
  }
  return (
    <>
      <Head>
        <title>{title ? title + " - ShiftMate" : "ShiftMate"}</title>
        <meta name='description' content='Rota and Staff Management System' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <ToastContainer position='bottom-center' limit={1} />
      <div className={`sidebar ${sidebarVisible ? "sidebar-visible" : ""}`}>
        <div className='second-burger'>
          <Hamburger
            toggled={sidebarVisible}
            toggle={() => setSidebarVisible(!sidebarVisible)}
            size={22}
          />
        </div>
        <div className='inner-sidebar'>
          {sideList.map((item) => (
            <Link href={item.link}>
              <div className='pointer sidebar-item'>
                <>
                  <div className='sidebar-svg'>{item.svg}</div>

                  <div
                    className={
                      !sidebarVisible
                        ? "item-textHidden"
                        : "item-text " +
                          (item.link === active ? "sidebar-active" : "")
                    }
                  >
                    {item.title}
                  </div>
                </>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <header>
        <nav className='header full-container px-4 shadow-md'>
          <div className='mx-auto flex justify-between items-center h-full '>
            <div className='align-content-center flex inline'>
              {
                <Hamburger
                  toggled={sidebarVisible}
                  toggle={() => setSidebarVisible(!sidebarVisible)}
                  size={22}
                />
              }
              <div className='ml-8 logo'>
                <Link href='/'>
                  <img className='h-6 min pointer' src='/images/logo.png'></img>
                </Link>
              </div>
            </div>

            <Menu as='div' className='relative inline-block'>
              <Menu.Button className='h-full flex text-center user-button'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='white'
                  width='2rem'
                  height='2rem'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z'
                  />
                </svg>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='white'
                  className='w-4 h-4'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M19.5 8.25l-7.5 7.5-7.5-7.5'
                  />
                </svg>
              </Menu.Button>
              <Menu.Items className='absolute menu-right right-0 w-56 origin-top-right bg-white  shadow-lg '>
                {status === "loading" ? (
                  <Menu.Item>
                    <DropdownLink className='dropdown-link'>
                      My Account
                    </DropdownLink>
                  </Menu.Item>
                ) : session?.user ? (
                  <>
                    {session.user.isAdmin && (
                      <>
                        <Menu.Item>
                          <DropdownLink
                            className='dropdown-link'
                            href='/admin/dashboard'
                          >
                            Dashboard
                          </DropdownLink>
                        </Menu.Item>
                        <Menu.Item>
                          <DropdownLink
                            className='dropdown-link'
                            href='/admin/shifts'
                          >
                            Shifts / Events
                          </DropdownLink>
                        </Menu.Item>
                        <Menu.Item>
                          <DropdownLink
                            className='dropdown-link'
                            href='/admin/staffs'
                          >
                            My Staff
                          </DropdownLink>
                        </Menu.Item>
                      </>
                    )}
                    <Menu.Item>
                      <DropdownLink className='dropdown-link' href='/profile'>
                        My Account
                      </DropdownLink>
                    </Menu.Item>
                    <Menu.Item>
                      <DropdownLink
                        className='dropdown-link'
                        href='/'
                        onClick={logoutClickHandler}
                      >
                        Logout
                      </DropdownLink>
                    </Menu.Item>
                  </>
                ) : (
                  <Menu.Item>
                    <DropdownLink
                      href='/login'
                      className='no-deco p-2 dropdown-link'
                    >
                      Login
                    </DropdownLink>
                  </Menu.Item>
                )}
              </Menu.Items>
            </Menu>
          </div>
        </nav>
      </header>
      <div className='right-content'>
        <div
          className={`custom-main justify-between ${
            sidebarVisible ? "push custom-main-open" : ""
          }`}
        >
          <main className='full-container mt-4 px-md-4'>{children}</main>
        </div>
      </div>
      <footer className='flex h-10 justify-center items-center shadow-inner'>
        <p>Copyright © {getYear()} ShiftMate</p>
      </footer>
    </>
  )
}
