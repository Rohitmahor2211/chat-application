import { z } from 'zod'

export const form_vadidation_schema = z.object({
    name: z.string()
        .trim()
        .min(1, { message: "Name is required..!" }),

    email: z.string()
        .trim()
        .min(1, { message: "Email is required..!" })
        .email({ message: "Invalid email format" }),

    mobile: z.string()
        .trim()
        .length(10, { message: "Mobile number must be 10 digits" })
        .regex(/^[0-9]+$/, { message: "Only numbers allowed" }),

    age: z.preprocess(
        (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
        z.number({ invalid_type_error: "Age is required" })
            .min(1, { message: "Age is required" })
            .min(16, { message: "Age must be greater than 16" })
    ),

    day: z.preprocess(
        (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
        z.number({ invalid_type_error: "Day is required" })
            .min(1, { message: "Day is required" })
    ),

    month: z.preprocess(
        (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
        z.number({ invalid_type_error: "Month is required" })
            .min(1, { message: "Month is required" })
    ),

    year: z.preprocess(
        (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
        z.number({ invalid_type_error: "Year is required" })
            .min(1, { message: "Year is required" })
    ),

    city: z.string()
        .trim()
        .min(1, { message: "City is required..!" }),

    country: z.string()
        .trim()
        .min(1, { message: "Country is required..!" }),

    policy: z.boolean().refine(val => val === true, {
        message: "Must be checked..!"
    })
})