import { LoginForm } from "../_components/LoginForm"; 

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-white">
      <div className="flex flex-col md:flex-row gap-12 items-center bg-slate-50 p-12 rounded-2xl shadow-sm">
        <div className="hidden md:block">
           <img src="/images/logo.jpg" alt="MEro Baazar" width={300} />
        </div>
        <LoginForm />
      </div>
    </main>
  );
}