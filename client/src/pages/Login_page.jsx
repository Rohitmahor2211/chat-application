import React from 'react'
import { LoginForm } from '../components/LoginForm'

const Login_page = () => {
    return (
        <>
            <div className='w-full h-screen bg-zinc-900 flex justify-center items-center'>
                <LoginForm />
            </div>
        </>
    )
}

export default Login_page