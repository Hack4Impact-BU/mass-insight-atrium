"use client";
import { signInAction } from "@/app/actions";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Link,
} from "@mui/material";
import { useSearchParams } from "next/navigation";
import { Suspense, useActionState, useState } from "react";
export default function Login() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  // https://react.dev/reference/react/useActionState
  const [_, formAction, pending] = useActionState(signInAction, null);
  // for the error message, since it's going to be in the url (supabase login functionality is a server action)
  const searchParams = useSearchParams();

  return (
    <div className="flex w-full">
      <div className="flex flex-col justify-center px-10 h-screen w-full">
        <h1 className="text-white font-semibold text-7xl mb-5">Atrium</h1>
        <h3 className="text-white font-light text-2xl">
          Seamlessly uniting data and events for streamlined success.
        </h3>
      </div>
      <div className="flex items-center justify-center h-screen w-full">
        <div className="w-3/5">
          <form
            className="bg-white flex-1 flex flex-col p-10 rounded-lg"
            action={formAction}
          >
            <h1 className="text-2xl font-semibold text-[#006EB6] mb-4">
              Sign in
            </h1>
            <p className="text-sm text-[#006EB6]">
              Sign in with the data you entered during your registration.
            </p>
            <p className="text-sm text-[#b60043] mt-2">
              {searchParams.get("error")?.replaceAll("-", " ")}
            </p>
            <div className="flex flex-col gap-2 mt-5">
              <TextField
                required
                label="Email Address"
                name="email"
                id="email"
                variant="outlined"
                type="email"
              />
              <div className="flex justify-end items-center">
                <Link fontSize={12} href="/forgot-password">
                  Forgot Password?
                </Link>
              </div>
              <TextField
                required
                label="Password"
                name="password"
                id="password"
                variant="outlined"
                type={isPasswordVisible ? "text" : "password"}
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
              <Button
                variant="outlined"
                size="large"
                type="submit"
                loading={pending}
              >
                Login to Atrium
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
