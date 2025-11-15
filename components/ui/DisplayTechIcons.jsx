import { getTechLogos } from '@/lib/utils'
import Image from 'next/image'
import React from 'react'

const DisplayTechIcons = async ({techstack}) => {
    const techIcons =  await getTechLogos(techstack)
    
    // Handle empty techIcons array
    if (!techIcons || techIcons.length === 0) {
      return null;
    }
    
  return (
    <div className='flex '>
       {techIcons.slice(0, 3).map(({tech , url })=>(
        <div key={`${tech}-${url}`} className='relative group bg-dark-300 rounded-full p-2 m-1 flex-center' >
            <span className='tech-tooltip'>{tech}</span>
            <Image 
              src={url} 
              alt={`${tech} icon`} 
              width={20} 
              height={20} 
              className='size-5'
              loading="lazy"
            />
        </div> 
       ))}
    </div>
  )
}

export default DisplayTechIcons