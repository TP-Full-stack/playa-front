import LoginPage from "./(auth)/login/page";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-black">
      <Image
        src="/assets/overlay-bg.svg"
        alt="Background Image"
        layout="fill"
        objectFit="cover"
        className="absolute inset-0 z-0 opacity-20"
      />
      <div className="z-10">
        <LoginPage />
      </div>
    </div>
  );
}
