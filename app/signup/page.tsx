import { AuthForm } from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 transition-colors duration-200 dark:bg-[#131f24]">
      {/* Decorative background gradients */}
      <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-duo-green/5 blur-3xl dark:bg-duo-green/10 pointer-events-none" />
      <div className="absolute right-1/4 bottom-1/4 h-72 w-72 rounded-full bg-duo-blue/5 blur-3xl dark:bg-duo-blue/10 pointer-events-none" />

      {/* Signup Card */}
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <AuthForm initialMode="signup" />
      </div>
    </main>
  );
}
