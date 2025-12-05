import { getMenuData } from "@/lib/content/menu";
import { MenuSection } from "@/components/menu/MenuSection";
import { BackToTopButton } from "@/components/BackToTopButton";

const menuSections = [
  { id: "flavors", title: "Flavors" },
  { id: "creations", title: "Sundaes & Splits" },
  { id: "drinks", title: "Shakes, Malts & Floats" },
  { id: "coffee", title: "Specialty Coffee & Affogato" },
  { id: "food", title: "Hot Dogs & Treats" },
  { id: "toppings", title: "Toppings & Extras" },
];

export default async function MenuPage() {
  const menu = await getMenuData();
  const flavorCount = menu.flavors.categories.reduce(
    (total, category) => total + category.items.length,
    0
  );

  return (
    <main className="bg-hot-pink min-h-screen">
      <div className="max-w-4xl mx-auto p-4 sm:p-8 md:p-12">
        <h1 className="text-6xl font-heading text-center mb-4 text-cream-white drop-shadow-lg">
          Our Menu
        </h1>
        <p className="text-center text-lg text-cream-white/90 mb-12">
          Classic scoops, sundaes, and rotating flavors. Ask in-shop for today’s specials!
        </p>

        {/* Jump Links */}
        <nav className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
          {menuSections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="px-4 py-2 bg-electric-aqua text-charcoal-gray font-bold rounded-full hover:bg-cream-white shadow-md transition-all transform hover:scale-105"
            >
              {section.title}
            </a>
          ))}
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column */}
          <div className="flex flex-col gap-12">
            {/* -- Scoops, Cups & Cones -- */}
            <div
              id="flavors"
              className="scroll-mt-24 bg-cream-white/90 text-charcoal-gray rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-4xl font-heading text-center text-hot-pink mb-6">
                🍦 Our {flavorCount} Flavors
              </h2>
              {menu.flavors.categories.map((cat) => (
                <MenuSection key={cat.name} category={cat} />
              ))}
            </div>

            {/* -- Ice Cream Creations -- */}
            <div
              id="creations"
              className="scroll-mt-24 bg-cream-white/90 text-charcoal-gray rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-4xl font-heading text-center text-hot-pink mb-6">
                🍨 Sundaes & Splits
              </h2>
              {menu.creations.categories.map((cat) => (
                <MenuSection key={cat.name} category={cat} />
              ))}
            </div>

            {/* -- Shakes, Malts & Floats -- */}
            <div
              id="drinks"
              className="scroll-mt-24 bg-cream-white/90 text-charcoal-gray rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-4xl font-heading text-center text-hot-pink mb-6">
                🥤 Shakes, Malts & Floats
              </h2>
              {menu.drinks.categories.map((cat) => (
                <MenuSection key={cat.name} category={cat} />
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-12">
            {/* -- Toppings & Extras -- */}
            <div
              id="toppings"
              className="scroll-mt-24 bg-cream-white/90 text-charcoal-gray rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-4xl font-heading text-center text-hot-pink mb-6">
                🎉 Toppings & Extras
              </h2>
              {menu.toppings.categories.map((cat) => (
                <MenuSection key={cat.name} category={cat} />
              ))}
            </div>

            {/* -- Specialty Coffee & Affogato -- */}
            <div
              id="coffee"
              className="scroll-mt-24 bg-cream-white/90 text-charcoal-gray rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-4xl font-heading text-center text-hot-pink mb-6">
                ☕ Specialty Coffee & Affogato
              </h2>
              {menu.coffee.sections.map((cat) => (
                <MenuSection key={cat.name} category={cat} />
              ))}
            </div>

            {/* -- Hot Dogs & Treats -- */}
            <div
              id="food"
              className="scroll-mt-24 bg-cream-white/90 text-charcoal-gray rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-4xl font-heading text-center text-hot-pink mb-6">
                🌭 Hot Dogs & Treats
              </h2>
              {menu.food.categories.map((cat) => (
                <MenuSection key={cat.name} category={cat} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <BackToTopButton />
    </main>
  );
}

