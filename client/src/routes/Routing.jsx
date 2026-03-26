import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Sign_Up_page from '../pages/Sign_Up_page'
import Login_page from '../pages/Login_page'
import Varification_page from '../pages/Varification_page'

const Routing = () => {
  return (
    <>
      <Routes>
        <Route path='/' element={<Sign_Up_page />} />
        <Route path='/login' element={<Login_page />} />
        <Route path='/verification-page' element={<Varification_page />} />
      </Routes>
    </>
  )
}

export default Routing