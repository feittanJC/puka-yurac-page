import React from 'react'
import cuaderno from '../assets/cuaderno.jpg'
import anillado from '../assets/anillado.jpg'

const productos = [
  {
    'imagen': `${cuaderno}`
  },
  {
    'imagen': `${anillado}`
  },
  {
    'imagen': `${cuaderno}`
  }
]

function Clientes() {

  return (

    <section className='py-24'>
      <div className="w-[100%] py-14 flex px-5 sm:px-12 lg:px-36  justify-start">
                <h1 className='text-red-600 font-bold text-5xl'>Nuestros clientes</h1>
      </div>
      <div className="relative m-auto w-[80%]  overflow-hidden bg-white before:absolute before:left-0 before:top-0 before:z-[2] before:h-full before:w-[100px] before:bg-[linear-gradient(to_right,white_0%,rgba(255,255,255,0)_100%)] before:content-[''] after:absolute after:right-0 after:top-0 after:z-[2] after:h-full after:w-[100px] after:-scale-x-100 after:bg-[linear-gradient(to_right,white_0%,rgba(255,255,255,0)_100%)] after:content-['']">
        <div className=" h-[300px] animate-infinite-slider flex w-[calc(250px*10)]">
          {productos.map((logo, index) => (
            <div
              className="slide flex w-[350px] items-center justify-center"
              key={index}
            >
              <img src={logo.imagen} className='h-full w-full' />
            </div>
          ))}
          {productos.map((logo, index) => (
            <div
              className="slide flex w-[350px] items-center justify-center"
              key={index}
            >
              <img src={logo.imagen} className='h-full' />
            </div>
          ))}
        </div>
      </div>

    </section>


  )
}

export default Clientes