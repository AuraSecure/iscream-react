import Image from "next/image";
import { getGeneralSettings } from "@/lib/content";

export default async function HomePage() {
  const settings = await getGeneralSettings();

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 text-center bg-hot-pink">
      <div className="flex items-center gap-4 mb-4">
        <Image
          src="/logo.png"
          alt="I Scream Ice Cream Logo"
          width={80}
          height={80}
          priority
          className="[filter:drop-shadow(0_0_8px_#FF007F)]"
        />
        <h1 className="text-7xl font-heading text-cream-white drop-shadow-lg uppercase tracking-wider [text-shadow:1px_1px_2px_#333333]">
          {settings.businessName}
        </h1>
      </div>
      <p className="text-lg text-cream-white/90">{settings.tagline}</p>
      <p className="text-lg text-cream-white/90 mt-2">{settings.phone}</p>
    </main>
  );
}
