import React, { useRef } from 'react';


function Contacto() {

    return (
        <section className='bg-[#dbd9d9] py-5'>
        <div className="text-end w-[95%] lg:w-[90%] py-8 flex justify-end">
                <h1 className=' text-red-600 font-bold text-5xl'>Contactate con nosotros</h1>
        </div>
            <div className="container my-24 mx-auto md:px-6">
                <section className="mb-32">
                    <div
                        className="relative h-[300px] overflow-hidden bg-cover bg-[50%] bg-no-repeat bg-[url('https://mdbcdn.b-cdn.net/img/new/textures/full/171.jpg')]">
                    </div>
                    <div className="container px-6 md:px-12">
                        <div
                            className="block rounded-lg  px-6 py-12 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] bg-[hsla(0,0%,5%,0.7)] shadow-black/20 md:py-16 md:px-12 -mt-[100px] backdrop-blur-[30px]">
                            <div className="mb-12 justify-around flex flex-col sm:flex-row">
                                <div className="mx-auto mb-12 text-center lg:mb-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2"
                                        stroke="currentColor" className="mx-auto mb-6 h-8 w-8 text-red-600 ">
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                            d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 00-8.862 12.872M12.75 3.031a9 9 0 016.69 14.036m0 0l-.177-.529A2.25 2.25 0 0017.128 15H16.5l-.324-.324a1.453 1.453 0 00-2.328.377l-.036.073a1.586 1.586 0 01-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643m5.276-3.67a9.012 9.012 0 01-5.276 3.67m0 0a9 9 0 01-10.275-4.835M15.75 9c0 .896-.393 1.7-1.016 2.25"  />
                                    </svg>
                                    <h6 className="font-medium">Perú</h6>
                                </div>
                                <div className="mx-auto mb-12 text-center lg:mb-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2"
                                        stroke="currentColor" className="mx-auto mb-6 h-8 w-8 text-red-600 ">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                    </svg>
                                    <h6 className="font-medium">Jr. Orbegozo 637</h6>
                                </div>
                                <div className="mx-auto mb-6 text-center md:mb-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2"
                                        stroke="currentColor" className="mx-auto mb-6 h-8 w-8 text-red-600 ">
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                            d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                    </svg>
                                    <h6 className="font-medium">+ 51 999 778 751</h6>
                                </div>
                            </div>
                            <div className="mx-auto max-w-[700px]">
                                <div className="flex text-center justify-center text-white font-bold text-3xl py-5">
                                <h1>Envia tu mensaje</h1>
                                </div>
                                
                                <form className='text-white'>
                                    <div className="flex flex-col pt-2">
                                        <label className='px-3 pb-2 font-semibold'>Nombre</label>
                                        <input type='text' className='bg-transparent border-2 outline-none rounded py-1 px-3 focus:border-red-600'/>
                                    </div>
                                    <div className="flex flex-col pt-2">
                                        <label className='px-3 pb-2 font-semibold'>Correo</label>
                                        <input type='email' className='bg-transparent border-2 outline-none rounded py-1 px-3 focus:border-red-600 '/>
                                    </div>
                                    <div className="flex flex-col pt-2">
                                        <label className='px-3 pb-2 font-semibold'>Mensaje</label>
                                        <textarea className='bg-transparent border-2 rounded py-1 outline-none  px-3 focus:border-red-600'/>
                                    </div>
                                    <button type='submit' className='w-full bg-red-600 hover:bg-red-700 ease-out duration-200 mt-8 py-2 rounded'>Enviar</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </section>
    )
}

export default Contacto