# Content Architecture

This document outlines how the website's content is structured, managed, and rendered.

---

## 🧠 **How The Menu JSON Files Work**

The menu data is structured across multiple JSON files to make it modular and easy to manage via a Git-based CMS.

### 📂 **Directory Layout**

All menu-related content is stored in the `/content/menu/` directory.

```
/content/menu/
 ├── coffee.json
 ├── flavors.json
 └── toppings.json
 └── food.json
```

### ✅ **1. Decap CMS Integration**

Each file appears as a **collection** in your `config.yml`, allowing for easy editing:

```yaml
collections:
  - name: "menu"
    label: "Menu"
    files:
      - file: "content/menu/coffee.json"
        label: "Coffee & Drinks"
        name: "coffee"
      - file: "content/menu/flavors.json"
        label: "Ice Cream Flavors"
        name: "flavors"
      - file: "content/menu/toppings.json"
        label: "Toppings"
        name: "toppings"
```

### ✅ **2. Dynamic React Page Rendering**

The `/menu` page can automatically loop through these lists, meaning any changes made in the CMS are instantly reflected on the live site.

### ✅ **3. Easy Expansion**

If new menu categories (like _“Sandwiches”_ or _“Pastries”_) are added, they will automatically appear on the page because the code maps over all sections dynamically. No code changes are needed for new content.

---

## 📅 Events & Announcements

Events and announcements are managed as a "folder collection," where each item is its own JSON file within a specific directory. This makes it easy to add, remove, or update individual items.

### Directory Layout

```
/content/
 ├── announcements/
 │    └── some-announcement.json
 └── events/
      └── summer-music-night.json
```

### Example Event (`content/events/summer-music-night.json`)

The filename (`summer-music-night.json`) acts as the unique ID or "slug" for the event.

This structure is designed to be highly flexible, especially for recurring events.

```json
{
  "title": "Summer Music Night",
  "startDate": "2024-08-16",
  "description": "Live acoustic music on the patio. All ages welcome!",
  "image": "/images/events/summer-music-flyer.png",
  "recurrence": {
    "frequency": "WEEKLY",
    "interval": 1,
    "byday": ["FR"]
  }
}
```

A more complex example for an event on the **3rd Friday of every month**:

```json
{
  "title": "Monthly Game Night",
  "startDate": "2024-09-20",
  "description": "Join us for board games and fun!",
  "image": "/images/events/game-night-flyer.png",
  "recurrence": {
    "frequency": "MONTHLY",
    "byday": "FR",
    "bysetpos": 3
  }
}
```

This structure allows the `/events` page to read all files from the `/content/events/` directory and display them as a list. The management UI will be responsible for creating, updating, and deleting these individual JSON files.
