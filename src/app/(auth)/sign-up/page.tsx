import { SignUpForm } from "../../../components/(auth)/signup-form";
import Image from "next/image";

export default function SignUpPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-black">
      <Image
        src="/assets/overlay-bg.svg"
        alt="Background Image"
        layout="fill"
        objectFit="cover"
        className="absolute inset-0 z-0 opacity-20"
      />
      <div className="relative z-10 w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  );
}
