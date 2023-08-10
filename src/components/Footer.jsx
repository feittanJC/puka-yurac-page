import React from 'react'
import logo from '../assets/logo.jpg'

function Footer() {
  return (
    <footer className='text-white'>
      <div className="bg-[#202020] flex max-xl:flex-col justify-around lg:px-24 px-7 py-12">
        <div className="lg:w-1/4 ">
        <img src={logo} className='lg:w-[70%] w-[70%] pb-12'/> 
          <p>Los mejores diseños los encuentras aqui</p>
        </div>
        <div className="">
          <h1 className='font-semibold text-2xl pt-8 pb-12 '>Contactanos</h1>
          <p>Jr. Orbegozo 645 Breña Lima Perú</p>
          <p className='py-8'>+51 999 778 751 </p>
          <p>dorilcastillo73@gmail.com</p>
        </div>
        <div className="">
          <h1 className='font-semibold text-2xl pt-8 pb-12'>Ubicanos</h1>
          <iframe src="https://www.google.com/maps/embed?pb=!1m21!1m12!1m3!1d3901.6972385662407!2d-77.05310538894118!3d-12.06434014614715!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m6!3e0!4m0!4m3!3m2!1d-12.0629495!2d-77.0536793!5e0!3m2!1ses!2spe!4v1625539609050!5m2!1ses!2spe"   className='border-none w-full md:w-96 h-96' allowFullScreen="" loading="lazy"></iframe>
        </div>
      </div>
      <div className="bg-[#101010] flex flex-col lg:flex-row text-center justify-around py-4">
        <h1>© 2023 Todos los Derechos Reservados</h1>
        <h1>Diseñado y desarrollado por: <a href='#'>Josue Castillo</a>  </h1>
      </div>
    </footer>
  )
}

export default Footer