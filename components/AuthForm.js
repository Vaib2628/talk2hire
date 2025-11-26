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
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/client";
import { toast } from "sonner";

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

async function onSubmit(values) {
    try {
      if (type === 'sign-up') {
        const {name , email , password} = values;
        try {
          const userCrediantials = await createUserWithEmailAndPassword(auth , email , password );

          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uid: userCrediantials.user.uid,
              name: name,
              email: email
            }),
          });
          
          const result = await response.json();

          if (!result?.success) {
            alert("Failed to create account ")
            toast.error(result?.message || 'Failed to create account');
            return ;
          }

          toast.success('Account created Successfully. Please Sign In');
          
          // Smooth redirect to sign-in
          if (typeof window !== 'undefined') {
            router.push('/sign-in');
          }
        } catch (err) {
          const code = err?.code;
          if (code === 'auth/email-already-in-use') {
            toast.error('Email already in use. Please sign in or use another email.');
            return;
          } else if (code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
            toast.error('Invalid credentials. Please check your email and password.');
            return;
          }
          throw err;
        }
      } else {
        const {email , password} = values ;
        
        try {
          const userCrediantial = await signInWithEmailAndPassword(auth ,email , password)
          const idToken = await userCrediantial.user.getIdToken();

          if (!idToken) {
            toast.error('Failed to get authentication token')
            return ;
          }

          const response = await fetch('/api/auth/signin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, idToken }),
          });
          
          const result = await response.json();
          
          // Add a small delay to ensure server-side cookie is properly set
          await new Promise(resolve => setTimeout(resolve, 500));

          if (!result?.success) {
            toast.error(result?.message || 'Failed to sign in');
            return;
          }

          toast.success("Sign In successfully .")
          
          localStorage.removeItem('auth_cache');
          
          if (typeof window !== 'undefined') {
            router.replace('/');
          }
        } catch (err) {
          const code = err?.code;
          if (code === 'auth/user-not-found') {
            toast.error('No account found with this email. Please sign up first.');
          } else if (code === 'auth/wrong-password') {
            toast.error('Incorrect password. Please try again.');
          } else if (code === 'auth/invalid-email') {
            toast.error('Invalid email address.');
          } else if (code === 'auth/too-many-requests') {
            toast.error('Too many failed attempts. Please try again later.');
          } else if (code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
            toast.error('Invalid credentials. Please check your email and password.');
          } else {
            throw err;
          }
        }
      }
    } catch (error) {
      const code = error?.code || "unknown";
      const message = error?.message || "An error occurred. Please try again.";
      if (code === 'auth/email-already-in-use') {
        toast.error('Email already in use. Please sign in or use another email.');
      } else if (code === 'auth/weak-password') {
        toast.error('Password is too weak. Use at least 6 characters.');
      } else if (code === 'auth/invalid-email') {
        toast.error('Invalid email address.');
      } else if (code === 'auth/network-request-failed') {
        toast.error('Network error. Check your connection and try again.');
      } else if (code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
        toast.error('Invalid credentials. Please check your email and password.');
      } else {
        toast.error(message);
      }
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
            
            <Button className="btn" type="submit" disabled={form.formState.isSubmitting} aria-busy={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? (isSignIn ? 'Signing in…' : 'Creating account…')
                : (isSignIn ? 'Sign in' : 'Create an Account')}
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
