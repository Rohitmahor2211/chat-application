import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Sign_Up_page from '../pages/Sign_Up_page'
import Login_page from '../pages/Login_page'
import Varification_page from '../pages/Varification_page'
import User_profile_page from '../pages/User_profile_page'
import Route_protection from './Route_protection'

const Routing = () => {
  return (
    <>
      <Routes>
        <Route path='/' element={<Sign_Up_page />} />
        <Route path='/login' element={<Login_page />} />

        <Route path='/verification-page' element={
          <Route_protection>
            <Varification_page />
          </Route_protection>
        } />
        <Route path='/user-profile' element={
          <Route_protection>
            <User_profile_page />
          </Route_protection>
        } />
      </Routes>
    </>
  )
}

export default Routing