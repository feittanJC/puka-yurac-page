import React from 'react'
import folleto from '../assets/folleto.jpg'

function Servicios() {
  return (
    <section className='flex flex-col '>
      <div className="w-[100%] py-14 flex px-36  justify-start">
          <h1 className='text-red-600 font-bold text-5xl'>Nuestros servicios</h1>
      </div>
      <div className="flex flex-col justify-end ">
        <div className="py-12 flex w-1/2 pl-4 rounded-r-full mb-12 bg-[#202020]">
          <div className="h-3/4  w-1/3">
          <h1 className='text-white font-bold text-2xl'>Impresiones</h1>
          <img src={folleto} className='py-8 rounded-[50%]' alt="" />
          </div>
          <div className="flex items-center text-left mx-4 text-white w-1/2">
            <p>Impresiones o copias en todo tipo de papeles, todo tipo de formatos y tamaños.</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-end items-end">
        <div className="py-12 flex w-1/2 pr-4 rounded-l-full justify-end mb-12 bg-red-700">
          <div className="flex items-center text-left mx-4 text-white w-1/2">
            <p>Impresiones o copias en todo tipo de papeles, todo tipo de formatos y tamaños.</p>
          </div>
          <div className="h-3/4  w-1/3">
          <h1 className='text-white text-right font-bold text-2xl'>Impresiones</h1>
          <img src={folleto} className='py-8 rounded-full' alt="" />
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-end ">
        <div className="py-12 flex w-1/2 pl-4 rounded-r-full mb-12 bg-[#202020]">
          <div className="h-3/4  w-1/3">
          <h1 className='text-white font-bold text-2xl'>Impresiones</h1>
          <img src={folleto} className='py-8 rounded-full' alt="" />
          </div>
          <div className="flex items-center text-left mx-4 text-white w-1/2">
            <p>Impresiones o copias en todo tipo de papeles, todo tipo de formatos y tamaños.</p>
          </div>
        </div>
      </div>

      
    </section>
  )
}

export default Servicios