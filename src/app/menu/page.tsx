import { getMenuData } from "@/lib/content/menu";
import { MenuSection } from "@/components/menu/MenuSection";

const menuSections = [
  { id: "creations", title: "Ice Cream Creations" },
  { id: "flavors", title: "Classic Scoops & Cones" },
  { id: "toppings", title: "Toppings & Extras" },
  { id: "coffee", title: "Coffee & Espresso" },
  { id: "drinks", title: "Drinks & Floats" },
  { id: "food", title: "Food & Snacks" },
];

export default async function MenuPage() {
  const menu = await getMenuData();

  return (
    <main className="bg-cream min-h-screen">
      <div className="max-w-4xl mx-auto p-4 sm:p-8 md:p-12">
        <h1 className="text-5xl font-extrabold text-center mb-4 text-deep-magenta">Our Menu</h1>
        <p className="text-center text-lg text-dark-magenta/80 mb-12">
          Classic scoops, sundaes, and rotating flavors. Ask in-shop for today’s specials!
        </p>

        {/* Jump Links */}
        <nav className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
          {menuSections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="px-4 py-2 bg-hot-pink/20 text-deep-magenta font-semibold rounded-full hover:bg-hot-pink/40 transition-colors"
            >
              {section.title}
            </a>
          ))}
        </nav>

        {/* -- Ice Cream Creations -- */}
        <div id="creations" className="mb-16 scroll-mt-24">
          <h2 className="text-4xl font-bold text-center text-hot-pink mb-8">Ice Cream Creations</h2>
          {menu.creations.categories.map((cat) => (
            <MenuSection key={cat.name} category={cat} />
          ))}
        </div>

        {/* -- Flavors & Toppings -- */}
        <div id="flavors" className="mb-16 scroll-mt-24">
          <h2 className="text-4xl font-bold text-center text-hot-pink mb-8">
            Classic Scoops, Cones, & Toppings
          </h2>
          {menu.flavors.categories.map((cat) => (
            <MenuSection key={cat.name} category={cat} />
          ))}
        </div>
        <div id="toppings" className="mb-16 scroll-mt-24">
          {menu.toppings.categories.map((cat) => (
            <MenuSection key={cat.name} category={cat} />
          ))}
        </div>

        {/* -- Beverages -- */}
        <div id="coffee" className="mb-16 scroll-mt-24">
          <h2 className="text-4xl font-bold text-center text-hot-pink mb-8">Beverages</h2>
          {menu.coffee.sections.map((cat) => (
            <MenuSection key={cat.name} category={cat} />
          ))}
        </div>
        <div id="drinks" className="mb-16 scroll-mt-24">
          {menu.drinks.categories.map((cat) => (
            <MenuSection key={cat.name} category={cat} />
          ))}
        </div>

        {/* -- Food -- */}
        <div id="food" className="mb-16 scroll-mt-24">
          <h2 className="text-4xl font-bold text-center text-hot-pink mb-8">Food & Snacks</h2>
          {menu.food.categories.map((cat) => (
            <MenuSection key={cat.name} category={cat} />
          ))}
        </div>
      </div>
    </main>
  );
}
