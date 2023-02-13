/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import React from "react"

export default function StaffItem({ staff, addToCartHandler }) {
  return (
    <div className='card'>
      <div className='flex flex-col items-center justify-center p-5'>
        <Link href={`/staff/${staff.slug}`}>
          <a>
            <h2 className='text-lg'>{staff.name}</h2>
          </a>
        </Link>
      </div>
    </div>
  )
}
