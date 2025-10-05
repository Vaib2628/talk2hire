"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
const formSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
const AuthForm = ({type}) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    }, 
  });

  function onSubmit(values) {
    console.log(values);
  }

   const isSignIn= type === 'sign-in';


  return (
    <div className="card-border lg-min-w-[400px]">
      <div className="flex flex-col gap-4 py-14 px-16 card">
        <div className="flex flex-row justify-center ">
          <Image src="/logo.svg" alt="logo" width={32} height={32} />
          <h2 className="text-primary-100">Talk2Hire</h2>
        </div>
        <h3>Practise the job interviews with the AI</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Name field - only for sign-up */}
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {/* Email field - for both sign-in and sign-up */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" type="email" {...field} />
                  </FormControl>
                  
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Password field - for both sign-in and sign-up */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your password" type="password" {...field} />
                  </FormControl>
                 
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button className="btn" type="submit">
              {isSignIn ? 'Sign in' : 'Create an Account'}
            </Button>
          </form>
        </Form>
        <p className="text- center">
          {isSignIn ? 'No Account yet ?' :'Have an accout already ?'}
          <Link href={!isSignIn ? '/sign-in' : '/sign-up'}className = "font-bold text-user-primary ml-1"> 
          {!isSignIn ? "Sign in " : 'Sign up'}</Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
