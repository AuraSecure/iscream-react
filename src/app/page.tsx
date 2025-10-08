import Image from "next/image";

interface GeneralSettings {
  businessName: string;
}

async function getGeneralSettings(): Promise<GeneralSettings> {
  // Use an absolute URL pointing to our running dev server.
  // The empty `{}` for the second argument tells Next.js to use its default caching.
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/content/general`, {});
  const data = await res.json();
  return data.json;
}

export default async function HomePage() {
  const settings = await getGeneralSettings();

  return (
    <main className="flex flex-col items-center justify-center p-8 text-center">
      <div className="flex items-center gap-4 mb-4">
        <Image src="/logo.png" alt="I Scream Ice Cream Logo" width={80} height={80} priority />
        <h1 className="text-5xl font-bold">{settings.businessName}</h1>
      </div>
      <p className="text-lg text-gray-600">Welcome to our site!</p>
      <a href="/manage" className="text-blue-600 hover:underline mt-4 inline-block">
        Go to Manage
      </a>
    </main>
  );
}
