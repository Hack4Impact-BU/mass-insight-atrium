"use client";

import { signInAction } from "@/app/actions";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Link
} from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
export default function Login() {
  // const searchParams = await props.searchParams;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const searchParams = useSearchParams();
  return (
    // add input validation
    <div className="flex w-full">
      <div className="flex flex-col justify-center px-10 h-screen w-full">
        <h1 className="text-white font-semibold text-7xl mb-5">Atrium</h1>
        <h3 className="text-white font-light text-2xl">
          Seamlessless uniting data and events for streamlined success.
        </h3>
      </div>
      <div className="flex items-center justify-center h-screen w-full">
        <div className="w-3/5">
          <form className="bg-white flex-1 flex flex-col p-10 rounded-lg" onSubmit={async (e) => {e.preventDefault(); await signInAction({email: email, password: password})}}>
            <h1 className="text-2xl font-semibold text-[#006EB6] mb-4">Sign in</h1>
            <p className="text-sm text-[#006EB6] mb-5">
              Sign in with the data you entered during your registration.
            </p>
            <p className="text-sm text-[#b60043]">
              {searchParams.get('error')}
            </p>
            <div className="flex flex-col gap-3 [&>input]:mb-3 mt-8">
              {/* <InputLabel htmlFor="email-input ">Email Address</InputLabel> */}
              <TextField
                label="Email Address"
                name="email-input"
                id="email-input"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                type="email"
              />
              <div className="flex justify-end items-center">
                <Link
                  fontSize={12}
                  href="/forgot-password"
                >
                  Forgot Password?
                </Link>
              </div>
              <TextField
                label="Password"
                name="email-input"
                id="email-input"
                variant="outlined"
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() =>
                            setIsPasswordVisible(!isPasswordVisible)
                          }
                        >
                          {isPasswordVisible ? (
                            <Visibility />
                          ) : (
                            <VisibilityOff />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Button variant="outlined" size="large" type="submit" className="text-black">
                Login to Atrium
              </Button>
              {/* <FormMessage message={searchParams} /> */}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
