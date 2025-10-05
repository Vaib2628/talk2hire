"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import FormField from "@/components/FormField";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const authFormSchema = (type) => {
  return z.object({
    name: type === 'sign-up' ? z.string().min(2).max(50) : z.string().optional(),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters")
  });
};

  
const AuthForm = ({type}) => {
  const router = useRouter();
  const formSchema = authFormSchema(type);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    }, 
  });

  function onSubmit(values) {
    console.log('Form submitted with values:', values);
    console.log('Form type:', type);
    
    try {
      if (type === 'sign-up') {
        console.log('Creating account for:', values.email);
        // Simulate account creation (replace with actual Firebase auth)
        setTimeout(() => {
          console.log('Redirecting to sign-in page...');
          alert('Account created successfully! Redirecting to sign in...');
          router.push('/sign-in');
        }, 1000);
      } else {
        console.log('Signing in with:', values.email);
        // Simulate sign in (replace with actual Firebase auth)
        setTimeout(() => {
          console.log('Redirecting to home page...');
          alert('Sign in successful! Redirecting to home page...');
          router.push('/');
        }, 1000);
      }
    } catch (error) {
      console.error('Error in onSubmit:', error);
      alert('An error occurred. Please try again.');
    }
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="form space-y-8">
            {/* Name field - only for sign-up */}
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Full Name"
                placeholder="Enter your full name"
                type="text"
              />
            )}
            
            {/* Email field - for both sign-in and sign-up */}
            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Enter your email"
              type="email"
            />
            
            {/* Password field - for both sign-in and sign-up */}
            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
            />
            
            <Button className="btn" type="submit">
              {isSignIn ? 'Sign in' : 'Create an Account'}
            </Button>
          </form>
        </Form>
        <p className="text-center">
          {isSignIn ? 'No Account yet ?' :'Have an accout already ?'}
          <Link href={!isSignIn ? '/sign-in' : '/sign-up'}className = "font-bold text-user-primary ml-1"> 
          {!isSignIn ? "Sign in " : 'Sign up'}</Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
