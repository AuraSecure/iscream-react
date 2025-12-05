import { getFundraisers } from "@/lib/content";
import FundraiserList from "./FundraiserList";

export default async function FundraisersPage() {
  const fundraisers = await getFundraisers();
  console.log("Fundraisers on page:", fundraisers);

  return (
    <main className="min-h-screen bg-soft-yellow text-charcoal-gray p-6 md:p-12">
      <h1 className="text-5xl md:text-6xl font-heading text-center mb-8 text-charcoal-gray drop-shadow-md uppercase">
        Fundraisers
      </h1>
      <FundraiserList fundraisers={fundraisers} />
    </main>
  );
}
