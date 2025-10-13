"use client";

import { useEffect, useState, useRef } from "react";

interface Topping {
  name: string;
  description?: string;
}

interface ToppingCategory {
  name: string;
  items: Topping[];
}

interface ToppingsData {
  categories: ToppingCategory[];
}

export default function ManageToppingsPage() {
  const [data, setData] = useState<ToppingsData | null>(null);
  const [sha, setSha] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<ToppingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    categoryIndex: number;
    itemIndex: number;
  } | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/content/toppings", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setMsg(`Failed to load toppings: ${data.error}`);
        } else {
          const jsonData = data.json;
          setData(jsonData);
          setSha(data.sha);
          // Create a deep copy for initial state to allow for discarding changes
          setInitialData(JSON.parse(JSON.stringify(jsonData)));
        }
        setLoading(false);
      });
  }, []);

  const hasChanges = JSON.stringify(data) !== JSON.stringify(initialData);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        // Most browsers show a generic message and ignore this one.
        e.returnValue =
          "You have unsaved changes. To save them, please cancel and click the 'Save Changes' button.";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasChanges]);

  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      if (hasChanges) {
        const target = e.target as HTMLElement;
        // Check if the click is on a link or inside a link
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
    document.addEventListener("click", handleLinkClick, true); // Use capture phase
    return () => {
      document.removeEventListener("click", handleLinkClick, true);
    };
  }, [hasChanges]);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, [editingItem]);

  const handleItemChange = (
    categoryIndex: number,
    itemIndex: number,
    field: keyof Topping,
    value: string
  ) => {
    if (!data) return;
    const newData = JSON.parse(JSON.stringify(data)); // Deep copy
    newData.categories[categoryIndex].items[itemIndex][field] = value;
    setData(newData);
  };

  const handleSaveItemEdit = (
    categoryIndex: number,
    itemIndex: number,
    newCategoryIndex: number,
    newName: string,
    newDescription: string
  ) => {
    if (!data) return;
    const newData = JSON.parse(JSON.stringify(data)); // Deep copy

    if (categoryIndex === newCategoryIndex) {
      // Item stays in the same category, just update its properties
      const item = newData.categories[categoryIndex].items[itemIndex];
      item.name = newName;
      item.description = newDescription;
    } else {
      // Item is moving to a new category
      const [itemToMove] = newData.categories[categoryIndex].items.splice(itemIndex, 1);
      itemToMove.name = newName;
      itemToMove.description = newDescription;
      newData.categories[newCategoryIndex].items.push(itemToMove);
    }

    setData(newData); // Update the state with the modified data
    setEditingItem(null); // Close the modal
  };

  const handleCancelItemEdit = () => {
    setEditingItem(null);
  };

  const handleAddItem = (categoryIndex: number) => {
    if (!data) return;
    const newData = JSON.parse(JSON.stringify(data)); // Deep copy
    const categoryItems = newData.categories[categoryIndex].items;
    categoryItems.push({ name: "", description: "" });
    setData(newData);
    // Immediately open the edit modal for the new item
    setEditingItem({ categoryIndex: categoryIndex, itemIndex: categoryItems.length - 1 });
  };

  const handleRemoveItem = (categoryIndex: number, itemIndex: number) => {
    if (!data) return;
    if (!confirm("Are you sure you want to delete this topping?")) return;
    const newData = JSON.parse(JSON.stringify(data)); // Deep copy
    newData.categories[categoryIndex].items.splice(itemIndex, 1);
    setData(newData);
  };

  const handleAddCategory = () => {
    if (!data) return;
    const categoryName = prompt("Enter new category name:");
    if (categoryName) {
      const newData = JSON.parse(JSON.stringify(data)); // Deep copy
      newData.categories.push({ name: categoryName, items: [] });
      setData(newData);
    }
  };

  const handleRemoveCategory = (categoryIndex: number) => {
    if (!data) return;
    const category = data.categories[categoryIndex];
    const toppingsCount = category.items.length;

    let warningMessage = `Are you sure you want to permanently delete the "${category.name}" category?`;
    if (toppingsCount > 0) {
      warningMessage += `\n\nThis will also delete all ${toppingsCount} toppings inside it. This action cannot be undone.`;
    }

    // First confirmation
    if (!window.confirm(warningMessage)) return;

    // Second, more deliberate confirmation
    const confirmationText = "DELETE";
    const finalConfirmation = prompt(
      `This action is permanent. To confirm, please type "${confirmationText}" below:`
    );

    if (finalConfirmation !== confirmationText) return;

    const newData = JSON.parse(JSON.stringify(data)); // Deep copy
    newData.categories.splice(categoryIndex, 1);
    setData(newData);
  };

  const save = async () => {
    if (!data) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/content/toppings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: data, sha }),
      });
      if (!res.ok) throw new Error(await res.text());
      setMsg("✅ Saved to GitHub");
      // Update initialData to the new saved state
      setInitialData(JSON.parse(JSON.stringify(data)));
      // We would refetch the sha here in a real app, but for now this is fine
    } catch (e) {
      console.error(e);
      setMsg("❌ Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setData(initialData);
  };

  const currentlyEditingTopping = editingItem
    ? data?.categories[editingItem.categoryIndex].items[editingItem.itemIndex]
    : null;

  if (loading) return <main style={{ padding: 24 }}>Loading toppings…</main>;
  if (!data) return <main style={{ padding: 24 }}>Could not load toppings data.</main>;

  return (
    <section className="bg-gray-100 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Toppings</h1>
        <button
          type="button"
          onClick={handleAddCategory}
          className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
        >
          Add Category
        </button>
      </div>
      <div className="space-y-6">
        {data.categories.map((category, catIndex) => (
          <div key={category.name} className="p-4 border rounded-md bg-white">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h3 className="text-xl font-bold">{category.name}</h3>
              <button
                type="button"
                onClick={() => handleRemoveCategory(catIndex)}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Delete Category
              </button>
            </div>
            <div className="space-y-4">
              {category.items.map((item, itemIndex) => (
                <div
                  key={`${catIndex}-${itemIndex}`}
                  className="flex justify-between items-center p-2 border-b last:border-b-0"
                >
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    {item.description && (
                      <p className="text-sm text-gray-500">{item.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingItem({ categoryIndex: catIndex, itemIndex: itemIndex })
                      }
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-md hover:bg-gray-300"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(catIndex, itemIndex)}
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
                onClick={() => handleAddItem(catIndex)}
                className="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-md hover:bg-blue-600"
              >
                + Add Topping
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-between items-center gap-4">
        <button
          type="button"
          onClick={handleAddCategory}
          className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
        >
          + Add Category
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

      {/* Edit Modal */}
      {editingItem && currentlyEditingTopping && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Edit Topping</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const newName = (form.elements.namedItem("name") as HTMLInputElement).value;
                const newCategoryIndex = parseInt(
                  (form.elements.namedItem("category") as HTMLSelectElement).value,
                  10
                );
                const newDescription = (form.elements.namedItem("description") as HTMLInputElement)
                  .value;
                handleSaveItemEdit(
                  editingItem.categoryIndex,
                  editingItem.itemIndex,
                  newCategoryIndex,
                  newName,
                  newDescription
                );
              }}
            >
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Topping Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  ref={nameInputRef}
                  defaultValue={currentlyEditingTopping.name}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
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
                  defaultValue={currentlyEditingTopping.description || ""}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  defaultValue={editingItem.categoryIndex}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {data.categories.map((cat, index) => (
                    <option key={index} value={index}>
                      {cat.name}
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
