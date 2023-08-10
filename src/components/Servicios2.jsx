import React from 'react'
import impresion from '../assets/impresion.png'
import agenda from '../assets/agenda.png'
import facturas from '../assets/facturas.png'

function Servicios2() {
  return (
    <section className='py-24'>
        <div className="w-[100%] py-14 flex px-5 sm:px-12 lg:px-36  justify-start">
          <h1 className='text-red-600 font-bold text-5xl'>Nuestros servicios</h1>
        </div>
        <div className="flex sm:flex-row flex-col justify-center px-8 py-16 ">
            <div className="flex flex-col justify-center items-center pb-8 sm:pb-0">
                <img src={impresion} className='w-1/4 pb-8' alt="" />
                <h1>Impresiones</h1>
            </div>
            <div className="flex flex-col justify-center items-center pb-8 sm:pb-0">
                <img src={agenda} className='w-1/4 pb-8' alt="" />
                <h1>Agendas</h1>
            </div>
            <div className="flex flex-col justify-center items-center pb-8 sm:pb-0">
                <img src={facturas} className='w-1/4 pb-8' alt="" />
                <h1>Facturas</h1>
            </div>
            <div className="flex flex-col  justify-center items-center pb-8 sm:pb-0">
                <img src={impresion} className='w-1/4 pb-8' alt="" />
                <h1>Impresiones</h1>
            </div>
        </div>
    </section>
  )
}

export default Servicios2