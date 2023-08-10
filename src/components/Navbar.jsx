import React, { useState } from 'react'
import logo from '../assets/logo.jpg'
import { Link } from "react-scroll";

function Navbar() {

  const [click, setClick] = useState(false);
  const handleClick = () =>  setClick(!click);

  const content = <>
        <div className="lg:hidden text-white font-semibold block absolute top-16 w-full left-0 right-0 bg-red-700 transition">
            <ul className="text-center text-xl p-20">
                <Link spy={true} smooth={true} to="Home">
                    <li className="my-4 py-4 border-b border-slate-800 hover:bg-slate-800 hover:rounded">Inicio</li>
                </Link >
                <Link spy={true} smooth={true} to="About">
                    <li className="my-4 py-4 border-b border-slate-800 hover:bg-slate-800 hover:rounded"> Quienes somos</li>
                </Link>
                <Link spy={true} smooth={true} to="Services">
                    <li className="my-4 py-4 border-b border-slate-800 hover:bg-slate-800 hover:rounded">Productos</li>
                </Link>
                <Link spy={true} smooth={true} to="Projects">
                    <li className="my-4 py-4 border-b border-slate-800 hover:bg-slate-800 hover:rounded">Servicios</li>
                </Link>
                <Link spy={true} smooth={true} to="Contact">
                    <li className="my-4 py-4 border-b border-slate-800 hover:bg-slate-800 hover:rounded">Nuestros clientes</li>
                </Link>
                <Link spy={true} smooth={true} to="Contact">
                    <li className="my-4 py-4  border-slate-800 hover:bg-slate-800 hover:rounded">Contacto</li>
                </Link>
            </ul>
        </div>
    </>

  return (
    <header className=' py-5 px-4'>
      <div className="flex justify-around">
      <div className="w-[30%]">
        <img src={logo} className='w-[200px] ' />
        </div>
        
        <ul className='lg:flex items-center w-[35%] [&>li>a]:cursor-pointer justify-between font-semibold max-2xl:w-[45%] max-[1230px]:w-[50%] hidden'>
            <li><a> Inicio</a></li>
            <li><a> Quienes somos</a></li>
            <li><a>Productos</a> </li>
            <li><a>Servicios</a> </li>
            <li><a>Nuestros clientes</a> </li>
            <li><a>Contacto</a> </li>
        </ul>
        <div>
            {click && content}
        </div>
        <ul className='lg:hidden block transition' onClick={handleClick}>
        {click ?
        <svg fill="#000000" className='w-5 h-4' version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 460.775 460.775" xml:space="preserve"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M285.08,230.397L456.218,59.27c6.076-6.077,6.076-15.911,0-21.986L423.511,4.565c-2.913-2.911-6.866-4.55-10.992-4.55 c-4.127,0-8.08,1.639-10.993,4.55l-171.138,171.14L59.25,4.565c-2.913-2.911-6.866-4.55-10.993-4.55 c-4.126,0-8.08,1.639-10.992,4.55L4.558,37.284c-6.077,6.075-6.077,15.909,0,21.986l171.138,171.128L4.575,401.505 c-6.074,6.077-6.074,15.911,0,21.986l32.709,32.719c2.911,2.911,6.865,4.55,10.992,4.55c4.127,0,8.08-1.639,10.994-4.55 l171.117-171.12l171.118,171.12c2.913,2.911,6.866,4.55,10.993,4.55c4.128,0,8.081-1.639,10.992-4.55l32.709-32.719 c6.074-6.075,6.074-15.909,0-21.986L285.08,230.397z"></path> </g></svg> 
        :
         
        <svg  className='w-8 h-8' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g clip-path="url(#clip0_429_11066)"> <path d="M3 6.00092H21M3 12.0009H21M3 18.0009H21" stroke="#292929" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path> </g> <defs> <clipPath id="clip0_429_11066"> <rect width="24" height="24" fill="white" transform="translate(0 0.000915527)"></rect> </clipPath> </defs> </g></svg>
          }
        </ul>
      </div>
    </header>
  )
}

export default Navbar