import React, { useEffect, useRef, useState } from 'react'
import { Navigation2, RefreshCw } from 'lucide-react'
import api from '../api/api'
import { useNavigate } from 'react-router-dom'



const Email_varification = () => {
    const token = localStorage.getItem("token")
    const navigate = useNavigate()

    const [otp, setOtp] = useState(new Array(6).fill(""))
    const inputRefs = useRef([])
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus()
        }
    }, [])

    const handleChange = (value, i) => {
        if (isNaN(value)) return;

        const newOtp = [...otp]
        newOtp[i] = value
        // console.log(newOtp)
        setOtp(newOtp)

        if (value && i < 5) {
            inputRefs.current[i + 1].focus()
        }
    }

    const handleKeyDown = (e, i) => {
        if (e.key === "Backspace" && i > 0 && !otp[i]) {
            inputRefs.current[i - 1].focus()
        }
    }


    const handleSubmit = async () => {
        const code = otp.join("")
        if (code.length === 6) {
            setOtp(new Array(6).fill(""))
            inputRefs.current[0].focus()

            try {
                const response = await api.post("/verify-otp",
                    { code },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response) {
                    navigate('/user-profile')
                }
            }
            catch (error) {
                console.log(error.message)
            }
        }
    }

    return (
        <>
            <div className='w-[36%] h-[50%] shadow shadow-zinc-600 rounded-sm flex flex-col items-center py-10 '>
                <h1 className='font-semibold text-3xl py-2 text-gray-900'>Verify Your Email</h1>
                <p className='text-lg font-medium text-gray-700'>Enter the verification code sent to your Email</p>

                <div className='flex gap-2 py-10'>
                    {
                        otp.map((digit, i) => {
                            return (
                                <input type='text' key={i + 1}
                                    placeholder='0'
                                    maxLength={1}
                                    className='w-14 h-14 border border-gray-500 rounded-sm text-center focus:outline-none focus:border-black text-3xl placeholder:text-center '
                                    value={digit}
                                    ref={(el) => inputRefs.current[i] = el}
                                    onChange={(e) => { handleChange(e.target.value, i) }}
                                    onKeyDown={(e) => { handleKeyDown(e, i) }}
                                />
                            )
                        })
                    }
                </div>
                <button
                    onClick={handleSubmit}
                    className='w-[70%] py-2 mt-8  bg-zinc-800 text-white text-lg flex justify-center items-center gap-4 rounded-sm hover:bg-gray-950 cursor-pointer'>
                    <span>Continue</span> <Navigation2 className='rotate-90' /></button>
            </div>
        </>
    )
}

export default Email_varification