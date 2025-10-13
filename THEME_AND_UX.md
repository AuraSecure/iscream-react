# IScreamIceCream - Theme & UX Discussion

This document is for discussing and defining the design theme, user experience (UX), and overall feel of the "I Scream Ice Cream" website.

---

## 1. Overall Vibe & Target Audience

Let's define the brand's personality. This will guide all our design decisions.

- **Keywords**: What are 3-5 words that should describe the website? (e.g., Fun, Playful, Modern, Nostalgic, Premium, Family-Friendly)
- **Target Audience**: Who are we building this for? (e.g., Families with kids, young adults, tourists, local community members)
- **Competitors/Inspiration**: Are there other ice cream shop websites or local business sites that you like (or dislike)?

---

## 2. Color Palette

We have a great starting point in `tailwind.config.js`. Let's define how to use these colors.

**Current Colors:**

- `hot-pink`: `#FF69B4`
- `deep-magenta`: `#D9006C`
- `dark-magenta`: `#8B008B`
- `cream`: `#FFFDD0`
- `brand-yellow`: `#FFD700`

**Questions:**

- Which of these is our primary brand color? (e.g., for buttons, links, important highlights)
- Which are secondary/accent colors?
- What color should be used for backgrounds? The `cream` color seems like a good candidate for a warm, inviting feel.
- Do we need standard colors for success, error, or warning messages?

---

## 3. Typography

Consistent fonts are key to a professional look.

- **Heading Font**: What font should be used for main titles (like the business name on the homepage)? Should it be bold, playful, or elegant?
- **Body Font**: What font should be used for paragraphs and general text? It should be highly readable.
- **Font Sizes**: We can establish a scale (e.g., `text-sm`, `text-base`, `text-lg`, `text-xl`, etc.) to ensure consistency. The homepage currently uses `text-5xl` for the main heading and `text-lg` for the paragraph. Does this feel right?

---

## 4. Layout & Components

Let's think about the key building blocks of the site.

- **Buttons**: What should our standard buttons look like? What about hover and active states?
- **Cards**: How will we display items like events or announcements? Will they be in a card format?
- **Navigation**: How will the main menu be structured?
- **Forms**: For the `/manage` page, what will the input fields, labels, and save/cancel buttons look like?

---

## 5. User Experience (UX)

- **Homepage Goal**: What is the main action we want a user to take when they land on the homepage? (e.g., View the menu, see hours/location, check for events?)
- **Management Flow**: For the `/manage` page, how should the "editable with Confirm / No Changes logic" work? Should it be an "edit mode" toggle, or should fields become editable on click? How do we provide feedback when changes are saved successfully?
- **Mobile Experience**: How should the layout adapt for mobile users? Is there anything that should be prioritized or hidden on smaller screens?

---

## 6. Management Page (`/manage`) UX Flow

This section details the user experience for editing site content. The overall goal is a simple, utilitarian interface optimized for editing, without unnecessary visual effects.

### 6.1. Main Management View

This is the entry point at `/manage`.

- **Layout**: The page will display a simple vertical list of links to the different editable content areas (e.g., "General Settings", "Toppings", "Coffee Menu").
  - **Decision**: A simple list is chosen over a grid of cards for a more utilitarian feel.

- **Navigation**: When a user clicks a link, it will navigate to a dedicated sub-page for that section.
  - **Decision**: Use a multi-page approach (e.g., `/manage/toppings`). This is simpler to implement and maintain in Next.js, and the performance is acceptable for an admin panel.

### 6.2. General Editing UI (Applies to all sections)

- **Saving Changes**: Each management page (e.g., for an item, an event, or a list of items) will have a single "Save Changes" button. This button will be disabled by default and will only become active when the user has made one or more changes on the page.
  - **Decision**: Use a single save button per page/form, not per individual field.

- **User Feedback**: After a successful save, a temporary confirmation message (a "toast" notification) will appear to inform the user that their changes were saved.
  - **Decision**: Implement toast notifications for save confirmations.

- **Discarding Changes**: A "Discard Changes" or "Cancel" button will be present. Clicking it will revert all fields on the page back to their last saved state.
  - **Decision**: Implement a discard/cancel functionality.

- **Navigation Warning**: If a user has unsaved changes and attempts to navigate away from the page (by clicking a link, closing the tab, etc.), the browser will show a native confirmation prompt asking if they are sure they want to leave.
  - **Decision**: Implement a navigation warning for unsaved changes.

### 6.3. Toppings & Flavors (List-based content)

This logic would apply to `toppings.json` and `flavors.json`.

- **Adding an Item**: An "Add New" form will be available.
  - **Decision**: To select a category, a dropdown will show existing categories. The last option will be "Create new category...", which will reveal a text input for the new category name.

- **Editing an Item**: Each item will have an "Edit" button.
  - **Decision**: Editing allows for changing the item's name, moving it to another category, and adding/editing an optional description.
  - **Note**: This requires changing the JSON structure from a simple array of strings to an array of objects.

- **Deleting an Item**: Each item will have a "Delete" button.
  - **Decision**: A confirmation modal will appear before an item is permanently deleted.

- **Managing Categories**:
  - **Editing**: A "Rename" button/icon next to each category title will allow for inline editing.
  - **Deleting**: A "Delete" button/icon next to each category title. Deletion will be disabled if the category contains any items, preventing accidental data loss. The user must move or delete all items from a category before the category itself can be deleted.

### 6.4. Coffee Menu (Object-based list content)

The `coffee.json` and `food.json` files are structured into `sections`, where each section has a name and a list of items. Items can have a `name`, `price`, and an optional `description`.

- **Editing an Item**:
  - **Decision**: When a user edits a coffee item, all its fields (`name`, `price`, `description`) will become editable within a single form.

- **Handling Price**:
  - **Decision**: The price input field will strictly enforce numeric values. This rule applies to all price, date, and time fields throughout the management UI.
  - **Decision**: The price field is optional. An item can have a numeric price (including `0`) or no price property at all.
  - **Decision**: A global setting will be created (likely in `general.json` or a new `menu-settings.json`) to control price visibility on the public menu.
  - **Decision**: A separate setting will define how a price of `0` is displayed to the public (e.g., as "Free" or left blank).

### 6.5. Events & Announcements (Folder-based content)

This logic applies to content where each entry is a separate file (e.g., events).

- **Main View (`/manage/events`)**:
  - **Decision**: The page will show a list of all events (title and next date). Each event will have "Edit" and "Delete" buttons. An "Add New Event" button will be at the top.

- **Editing/Adding View (`/manage/events/edit/[slug]`)**: This page will be a form for all event properties.
  - **Image Handling**:
    - **Decision**: A file uploader will be used. The user will select an image from their computer, and the system will save it to `public/images/events/`.
  - **Slug Generation**:
    - **Decision**: The filename/slug will be automatically generated from the event title to ensure it is URL-friendly and prevent errors.

* **Recurrence UI**: This is the most complex part. How should we present the recurrence options to the user? Here's a proposed flow:
  - **Decision**: The UI for setting recurrence rules will follow a conditional flow:
    1.  A **Frequency** dropdown ("One Time", "Weekly", "Monthly", "Yearly").
    2.  An **Interval** input appears for recurring frequencies ("Repeat every `[ 1 ]` week(s)...").
    3.  Conditional inputs appear based on frequency:
        - **Weekly**: Checkboxes for days of the week.
        - **Monthly**: Options for "On day `[ 15 ]`" or "On the `[ Third ]` `[ Friday ]`".

* **Automatic Rescheduling**:
  - **Decision**: The system will automatically handle updating the `startDate` for recurring events in the background via an API. This is not a manual user task.
