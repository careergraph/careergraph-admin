import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { adminAuthApi } from "@/features/auth/api/adminAuthApi";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { env } from "@/config/env";

const loginSchema = z.object({
  email: z.email("Please enter a valid admin email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setAdmin = useAuthStore((state) => state.setAdmin);
  const from = (location.state as { from?: Location })?.from?.pathname ?? "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: adminAuthApi.login,
    onSuccess: ({ accessToken, admin }) => {
      setAccessToken(accessToken);
      setAdmin(admin);
      navigate(from, { replace: true });
    },
  });

  const errorMessage =
    loginMutation.error instanceof Error
      ? loginMutation.error.message
      : "Unable to sign in with the provided credentials.";

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="eyebrow">CareerGraph operations</div>
        <h1>Admin control center</h1>
        <p className="lead">
          Sign in with an administrator account to review company verification
          traffic, access audit context, and operate from a protected shell.
        </p>

        <div className="login-meta">
          <span>API: {env.apiBaseUrl}</span>
          <span>Role locked to ADMIN</span>
        </div>

        <form
          className="stack-lg"
          onSubmit={handleSubmit((values) => loginMutation.mutate(values))}
        >
          <Input
            label="Admin email"
            type="email"
            placeholder="admin@careergraph.vn"
            error={errors.email?.message}
            autoComplete="email"
            {...register("email")}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            error={errors.password?.message}
            autoComplete="current-password"
            {...register("password")}
          />

          {loginMutation.isError ? (
            <div className="inline-error" role="alert">
              {errorMessage}
            </div>
          ) : null}

          <Button type="submit" loading={loginMutation.isPending}>
            Sign in to admin
          </Button>
        </form>
      </section>

      {/* <section className="login-aside">
        <div className="surface-card">
          <div className="eyebrow">Phase 2 scope</div>
          <h2>Foundation only</h2>
          <p>
            This scaffold wires routing, guards, API access, layout, and shared
            primitives so Phase 3 can focus on verification workflows instead of
            app plumbing.
          </p>
        </div>
      </section> */}
    </main>
  );
}
