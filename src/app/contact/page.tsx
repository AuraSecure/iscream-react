import { SITE } from "@/lib/site";
export default function ContactPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold mb-4">Contact</h1>
      <p>
        Email:{" "}
        <a className="underline" href={`mailto:${SITE.email}`}>
          {SITE.email}
        </a>
      </p>
      <p>Address: {SITE.address}</p>
    </div>
  );
}
