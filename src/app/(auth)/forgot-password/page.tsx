import ForgotPasswordForm from "@/components/(auth)/forgot/forgot-form";
import Image from "next/image";

export default function ForgotPage() {
  return (
    <div className="flex  flex-col items-center justify-center p-6 md:p-10 bg-black min-h-screen">
      <Image
        src="/assets/overlay-bg.svg"
        alt="Background Image"
        layout="fill"
        objectFit="cover"
        className="absolute inset-0 z-0 opacity-20"
      />
      <div className="w-full max-w-sm md:max-w-3xl z-10">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
