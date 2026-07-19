import { Cigarette } from "lucide-react";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirectTo?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirectTo ?? "/";

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-900">
            <Cigarette className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">
            Kardeşler Tobacco ERP
          </h1>
          <p className="text-sm text-slate-500">Hesabınızla giriş yapın</p>
        </div>

        {params.error && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {params.error}
          </div>
        )}

        <form action={login} className="space-y-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              E-posta
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}
