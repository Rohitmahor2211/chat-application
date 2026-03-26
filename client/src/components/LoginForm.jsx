import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { LogIn } from "lucide-react"
import { NavLink } from "react-router-dom"

export function LoginForm({
    className,
    ...props
}) {
    return (
        <div className={cn("flex flex-col gap-6 w-[24%] ", className)} {...props}>
            <Card className="py-6 h-[60vh]">
                <CardHeader>
                    <div className="flex justify-center ">
                        <div className="w-12 py-2.5 bg-zinc-100 rounded-sm flex justify-center ">
                            <LogIn className="" />
                        </div>
                    </div>
                    <CardTitle className="py-2">Login to your account</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="pt-6">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                />
                            </Field>
                            <Field>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                    <a
                                        href="#"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        Forgot your password?
                                    </a>
                                </div>
                                <Input id="password" type="password" required />
                            </Field>
                            <Field className="mt-6 ">
                                <Button type="submit" className="cursor-pointer">Login</Button>
                                <FieldDescription className="text-center">
                                    Don&apos;t have an account? <NavLink to='/'>Sign up</NavLink>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div >
    )
}
