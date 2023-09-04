import React from 'react'
import Error1 from './Error.jpg'
import { useNavigate } from 'react-router-dom'

export default function Error() {
    const navigate = useNavigate();
    const handleBackHome = ()=>{
        navigate('/')
    }
  return (
    <div >
        <img src={Error1} alt="..." style={{ width:'100vw', height:'90vh'}}/>
      <button onClick={handleBackHome} className='btn btn-primary z-4 position-absolute start-50 translate-middle' style={{top:'60%'}}>Go to Home</button>
    </div>
  )
}
