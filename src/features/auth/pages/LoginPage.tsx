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
      className="grid min-h-screen items-center justify-center gap-6 p-8
        grid-cols-[minmax(0,560px)_minmax(280px,420px)] max-[1100px]:grid-cols-1"
    >
      <section
        className="rounded-[1.6rem] border border-[rgba(127,150,186,0.14)]
          bg-gradient-to-b from-[rgba(13,24,41,0.94)] to-[rgba(8,15,27,0.9)]
          p-8 shadow-[0_28px_80px_rgba(0,0,0,0.28)] max-[720px]:px-4"
      >
        <div className="text-[#8fc8ff] text-[0.8rem] font-bold tracking-[0.14em] uppercase">
          Vận hành CareerGraph
        </div>
        <h1 className="mt-1 mb-2 text-[clamp(1.9rem,3vw,2.5rem)] tracking-[-0.04em]">
          Trung tâm điều hành
        </h1>
        <p className="text-[#aeb9ca]">
          Đăng nhập bằng tài khoản quản trị viên để xét duyệt yêu cầu xác thực
          doanh nghiệp, truy cập ngữ cảnh kiểm toán và vận hành từ shell bảo mật.
        </p>

        <div className="flex flex-wrap gap-3 my-4 text-[#8ea0bb] text-[0.86rem]">
          <span>API: {env.apiBaseUrl}</span>
          <span>Chỉ dành cho vai trò ADMIN</span>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit((values) => loginMutation.mutate(values))}
        >
          <Input
            label="Email quản trị"
            type="email"
            placeholder="admin@careergraph.vn"
            error={errors.email?.message}
            autoComplete="email"
            {...register("email")}
          />

          <Input
            label="Mật khẩu"
            type="password"
            placeholder="Nhập mật khẩu của bạn"
            error={errors.password?.message}
            autoComplete="current-password"
            {...register("password")}
          />

          {loginMutation.isError ? (
            <div className="text-[#ff9dad] text-[0.85rem]" role="alert">
              {errorMessage}
            </div>
          ) : null}

          <Button type="submit" loading={loginMutation.isPending}>
            Đăng nhập
          </Button>
        </form>
      </section>
    </main>
  );
}
