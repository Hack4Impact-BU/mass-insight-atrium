import { resetPasswordAction } from "@/app/(auth-pages)/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function ResetPassword({ searchParams }: PageProps) {
  // Await the searchParams
  const params = await searchParams;
  
  // Check if valid access_token and type=recovery exist
  const accessToken = params["access_token"];
  const type = params["type"];

  const isValid = accessToken && type === "recovery";

  if (!isValid) {
    // Return 404-like page if invalid
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
        <p className="mt-4 text-foreground/60">
          This page is only accessible through a valid password reset link.
        </p>
      </div>
    );
  }

  return (
    <form className="flex flex-col w-full max-w-md p-4 gap-2 [&>input]:mb-4">
      <h1 className="text-2xl font-medium">Reset password</h1>
      <p className="text-sm text-foreground/60">
        Please enter your new password below.
      </p>
      <Label htmlFor="password">New password</Label>
      <Input
        type="password"
        name="password"
        placeholder="New password"
        required
      />
      <Label htmlFor="confirmPassword">Confirm password</Label>
      <Input
        type="password"
        name="confirmPassword"
        placeholder="Confirm password"
        required
      />
      <SubmitButton formAction={resetPasswordAction}>
        Reset password
      </SubmitButton>
      <FormMessage message={params as Message} />
    </form>
  );
}
