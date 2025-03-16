import LandingPage from "@/components/landing-page";
import { Toaster } from "sonner";

export default function Home() {
  return (
    <main className="flex flex-col items-center w-full">
      <LandingPage />
      <Toaster />
    </main>
  );
}
