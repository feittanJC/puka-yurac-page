import React from 'react'
import cuaderno from '../assets/cuaderno.jpg'
import anillado from '../assets/anillado.jpg'


function Productos() {

    const productos = [
        {
            'id':1,
            'titulo':'Agendas',
            'descripcion': 'Agendas personalizadas, tapa dura y de cuero, papel de alta calidad',
            'imagen':`${cuaderno}`
        },
        {
            'id':2,
            'titulo':'Cuadernos',
            'descripcion': 'Agendas personalizadas, tapa dura y de cuero, papel de alta calidad',
            'imagen':`${anillado}`
        },
        {
            'id':3,
            'titulo':'Agendas',
            'descripcion': 'Agendas personalizadas, tapa dura y de cuero, papel de alta calidad',
            'imagen':`${cuaderno}`
        },
        
    ]


    return (
        <section className='bg-[#dbd9d9] flex flex-col py-16'>
            <div className="w-[85%] pb-12 flex justify-end">
                <h1 className='text-red-600 font-bold text-5xl'>Nuestros productos</h1>
            </div>

            <div className="flex flex-col lg:flex-row justify-around flex-wrap px-8">
            {productos.map(producto => {
                return(
                    <div className="flex flex-col sm:flex-row  bg-gradient-to-r from-red-500 to-red-900 w-[100%] lg:w-[35%] my-4 rounded-lg" key={producto.id}>
                 <div className="">
                     <img src={producto.imagen} className='w-[100%] h-[350px] rounded-t-lg sm:rounded-l-lg' alt="" />
                 </div>
                 <div className="px-4 flex flex-col justify-center py-4 sm:py-0">
                     <h1 className='text-white font-extrabold text-3xl pb-8'>{producto.titulo}</h1>
                     <p className='text-white text-xl'>{producto.descripcion} </p>
                 </div>
             </div>
                )
                 
            })

            }
               
            </div>
            

        </section>
    )
}

export default Productos