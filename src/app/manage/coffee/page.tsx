"use client";

import { useEffect, useState, useRef } from "react";
import { useContentManager } from "@/hooks/useContentManager";

interface CoffeeItem {
  name: string;
  price?: number;
  description?: string;
}

interface CoffeeSection {
  name: string;
  items: CoffeeItem[];
}

interface CoffeeData {
  sections: CoffeeSection[];
}

export default function ManageCoffeePage() {
  const { data, setData, loading, saving, msg, setMsg, hasChanges, save, handleDiscard } =
    useContentManager<CoffeeData>({
      apiPath: "/api/content/coffee",
    });

  const [editingItem, setEditingItem] = useState<{
    sectionIndex: number;
    itemIndex: number;
  } | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      if (hasChanges) {
        const target = e.target as HTMLElement;
        if (target.closest("a")) {
          if (
            !window.confirm(
              "You have unsaved changes. To save them, please cancel and click the 'Save Changes' button. Are you sure you want to leave?"
            )
          ) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }
    };
    document.addEventListener("click", handleLinkClick, true);
    return () => document.removeEventListener("click", handleLinkClick, true);
  }, [hasChanges]);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, [editingItem]);

  const handleSaveItemEdit = (
    sectionIndex: number,
    itemIndex: number,
    newSectionIndex: number,
    newName: string,
    newPrice: number | undefined,
    newDescription: string
  ) => {
    if (!data) return;
    const newData = JSON.parse(JSON.stringify(data));

    const updatedItem = {
      name: newName,
      price: newPrice,
      description: newDescription,
    };

    if (sectionIndex === newSectionIndex) {
      newData.sections[sectionIndex].items[itemIndex] = updatedItem;
    } else {
      newData.sections[sectionIndex].items.splice(itemIndex, 1);
      newData.sections[newSectionIndex].items.push(updatedItem);
    }

    setData(newData);
    setEditingItem(null);
  };

  const handleCancelItemEdit = () => setEditingItem(null);

  const handleAddItem = (sectionIndex: number) => {
    if (!data) return;
    const newData = JSON.parse(JSON.stringify(data));
    const sectionItems = newData.sections[sectionIndex].items;
    sectionItems.push({ name: "", description: "" });
    setData(newData);
    setEditingItem({ sectionIndex: sectionIndex, itemIndex: sectionItems.length - 1 });
  };

  const handleRemoveItem = (sectionIndex: number, itemIndex: number) => {
    if (!data) return;
    if (!confirm("Are you sure you want to delete this item?")) return;
    const newData = JSON.parse(JSON.stringify(data));
    newData.sections[sectionIndex].items.splice(itemIndex, 1);
    setData(newData);
  };

  const handleAddSection = () => {
    if (!data) return;
    const sectionName = prompt("Enter new section name:");
    if (sectionName) {
      const newData = JSON.parse(JSON.stringify(data));
      newData.sections.push({ name: sectionName, items: [] });
      setData(newData);
    }
  };

  const handleRemoveSection = (sectionIndex: number) => {
    if (!data) return;
    const section = data.sections[sectionIndex];
    const itemsCount = section.items.length;

    let warningMessage = `Are you sure you want to permanently delete the "${section.name}" section?`;
    if (itemsCount > 0) {
      warningMessage += `\n\nThis will also delete all ${itemsCount} items inside it. This action cannot be undone.`;
    }

    if (!window.confirm(warningMessage)) return;

    const confirmationText = "DELETE";
    const finalConfirmation = prompt(
      `This action is permanent. To confirm, please type "${confirmationText}" below:`
    );

    if (finalConfirmation !== confirmationText) return;

    const newData = JSON.parse(JSON.stringify(data));
    newData.sections.splice(sectionIndex, 1);
    setData(newData);
  };

  const currentlyEditingItem = editingItem
    ? data?.sections[editingItem.sectionIndex].items[editingItem.itemIndex]
    : null;

  if (loading) return <main style={{ padding: 24 }}>Loading coffee menu…</main>;
  if (!data) return <main style={{ padding: 24 }}>Could not load coffee menu data.</main>;

  return (
    <section className="bg-gray-100 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Coffee Menu</h1>
        <button
          type="button"
          onClick={handleAddSection}
          className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
        >
          Add Section
        </button>
      </div>
      <div className="space-y-6">
        {data.sections.map((section, secIndex) => (
          <div key={section.name} className="p-4 border rounded-md bg-white">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h3 className="text-xl font-bold">{section.name}</h3>
              <button
                type="button"
                onClick={() => handleRemoveSection(secIndex)}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Delete Section
              </button>
            </div>
            <div className="space-y-4">
              {section.items.map((item, itemIndex) => (
                <div
                  key={`${secIndex}-${itemIndex}`}
                  className="flex justify-between items-center p-2 border-b last:border-b-0"
                >
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    {item.description && (
                      <p className="text-sm text-gray-500">{item.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {item.price !== undefined && (
                      <span className="text-sm font-mono bg-gray-200 px-2 py-1 rounded">
                        ${item.price.toFixed(2)}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditingItem({ sectionIndex: secIndex, itemIndex })}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-md hover:bg-gray-300"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(secIndex, itemIndex)}
                      className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-md hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => handleAddItem(secIndex)}
                className="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-md hover:bg-blue-600"
              >
                + Add Item
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-between items-center gap-4">
        <button
          type="button"
          onClick={handleAddSection}
          className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
        >
          + Add Section
        </button>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handleDiscard}
            disabled={!hasChanges || saving}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Discard Changes
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!hasChanges || saving}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
      {msg && <p className="mt-4 text-sm">{msg}</p>}

      {editingItem && currentlyEditingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Edit Item</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const newName = (form.elements.namedItem("name") as HTMLInputElement).value;
                const newPriceRaw = (form.elements.namedItem("price") as HTMLInputElement).value;
                const newPrice = newPriceRaw ? parseFloat(newPriceRaw) : undefined;
                const newSectionIndex = parseInt(
                  (form.elements.namedItem("section") as HTMLSelectElement).value,
                  10
                );
                const newDescription = (form.elements.namedItem("description") as HTMLInputElement)
                  .value;
                handleSaveItemEdit(
                  editingItem.sectionIndex,
                  editingItem.itemIndex,
                  newSectionIndex,
                  newName,
                  newPrice,
                  newDescription
                );
              }}
            >
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Item Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  ref={nameInputRef}
                  defaultValue={currentlyEditingItem.name}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price (Optional)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  step="0.01"
                  defaultValue={currentlyEditingItem.price}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  defaultValue={currentlyEditingItem.description || ""}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="section" className="block text-sm font-medium text-gray-700">
                  Section
                </label>
                <select
                  id="section"
                  name="section"
                  defaultValue={editingItem.sectionIndex}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {data.sections.map((sec, index) => (
                    <option key={index} value={index}>
                      {sec.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={handleCancelItemEdit}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
