import "../styles/globals.css"

import { SessionProvider, useSession } from "next-auth/react"
import ReactModal from "react-modal"
import { useRouter } from "next/router"
import { PayPalScriptProvider } from "@paypal/react-paypal-js"
import { PulseLoader } from "react-spinners"

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  ReactModal.setAppElement("#__next")
  return (
    <SessionProvider session={session}>
      <PayPalScriptProvider deferLoading={true}>
        {Component.auth ? (
          <Auth adminOnly={Component.auth.adminOnly}>
            <Component {...pageProps} />
          </Auth>
        ) : (
          <Component {...pageProps} />
        )}
      </PayPalScriptProvider>
    </SessionProvider>
  )
}

function Auth({ children, adminOnly }) {
  const router = useRouter()
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login")
    },
  })
  if (status === "loading") {
    return (
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
    )
  }
  if (adminOnly && !session.user.isAdmin) {
    router.push("/unauthorized?message=admin Admin Login Required")
  }

  return children
}

export default MyApp
