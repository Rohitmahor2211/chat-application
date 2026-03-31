const { z } = require("zod")

const fileSchema = z.object({
    originalname: z.string(),
    mimetype: z.string().refine((type) =>
        ['image/jpeg', 'image/png', 'image/webp'].includes(type),
        "Only JPEG, PNG, and WebP are allowed"
    ),
    size: z.number().max(1 * 1024 * 1024, "File must be less than 1MB"),
})


module.exports = fileSchema