import React from 'react'



function Presentacion() {
  return (
    <section className='h-screen sm:h-screen'>
    <section className='h-2/4 sm:h-2/3 bg-imagen flex justify-center items-center ' >
      
      
    </section>
    <div className="h-2/4 sm:h-1/3 backdrop-blur-md text-white bg-gradient-to-r from-red-500 to-red-800 font-semibold text-center w-full py-12 px-5">
        <h1 className='text-5xl font-bold'>DESARROLLAMOS LOS MEJORES DISEÑOS PARA TU EMPRESA</h1>
        <p className='mb-12 mt-4'>Todo tipo de diseños y personalizados. Entregas a todo Lima.</p>
        <a href="" className='bg-white rounded-lg  text-red-600 p-4 hover:bg-red-800 hover:text-white transition-all ease-in '>Contactanos</a>
      </div>
    </section>
    )
}

export default Presentacion