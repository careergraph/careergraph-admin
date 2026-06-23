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
  email: z.email("Vui lòng nhập email quản trị hợp lệ."),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setAdmin = useAuthStore((state) => state.setAdmin);
  const from =
    (location.state as { from?: Location })?.from?.pathname ?? "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
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
      : "Không thể đăng nhập với thông tin đã cung cấp.";

  return (
    <main
      className="flex min-h-screen items-center justify-center gap-6 p-6 sm:p-8"
    >
      <section
        className="w-full max-w-[40rem] rounded-[1.9rem] border border-[rgba(127,150,186,0.14)]
          bg-gradient-to-b from-[rgba(13,24,41,0.94)] to-[rgba(8,15,27,0.9)]
          px-6 py-7 shadow-[0_28px_80px_rgba(0,0,0,0.28)] sm:px-10 sm:py-9"
      >
        <div className="text-[#8fc8ff] text-4xl font-semibold">
            CareerGraph Admin
        </div>
        <form
          className="mt-4 flex flex-col gap-5"
          onSubmit={handleSubmit((values) => loginMutation.mutate(values))}
        >
          <Input
            label="Email quản trị"
            type="email"
            placeholder="admin@careergraph.vn"
            error={errors.email?.message}
            autoComplete="email"
            className="min-h-[4.25rem] !text-xl placeholder:!text-xl"
            {...register("email")}
          />

          <Input
            label="Mật khẩu"
            type="password"
            placeholder="Nhập mật khẩu của bạn"
            error={errors.password?.message}
            autoComplete="current-password"
            className="min-h-[4.25rem] !text-xl placeholder:!text-xl"
            {...register("password")}
          />

          {loginMutation.isError ? (
            <div className="text-[#ff9dad] text-[0.95rem]" role="alert">
              {errorMessage}
            </div>
          ) : null}

          <Button
            type="submit"
            loading={loginMutation.isPending}
            className="mt-1 min-h-[3.25rem] text-[1.05rem] font-semibold"
          >
            Đăng nhập
          </Button>
        </form>
      </section>
    </main>
  );
}
