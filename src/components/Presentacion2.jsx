import React from 'react'
import background from '../assets/background.png'

function Presentacion2() {
  return (
    <section className='flex flex-col sm:flex-row justify-around px-6 sm:px-16 py-24 items-center'>
        <div className="text-red-600 font-semibold sm:w-1/3">
            <h1 className='text-4xl font-bold '>QUIENES SOMOS</h1>
            <p className='mb-12 mt-4'>Todo tipo de diseños y personalizados. Entregas a todo Lima.</p>
            <a href="" className='bg-red-600 rounded-lg  text-white p-4 hover:bg-red-800 transition-all ease-in '>Contactanos</a>
        </div>
        <img src={background} alt="" className='sm:w-1/3 sm:h-1/3 mt-10 sm:mt-0 '  />

    </section>
  )
}

export default Presentacion2