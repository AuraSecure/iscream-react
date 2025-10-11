# I Scream Ice Cream - Website

This is the Next.js frontend for the I Scream Ice Cream website. It uses a Git-based CMS approach, pulling content from a separate GitHub repository.

## 🚀 Getting Started

Follow these steps to get the development environment running.

### 1. Clone the Repository

ANYWHERE IN THIS FILE '''bash just meeans open the command prompt CMD in window and enter commands there. You must be in the project folder

```bash
git clone <your-repository-url>
cd iscream-react
```

Open

### 2. Install Dependencies

http://localhost:3000

```bash
npm install
```

in your browser to see the site running locally.

### 3. Set Up Environment Variables

// 📂 How the content works
This project uses a "Git-based CMS" approach. All website content (like events and announcements) is stored as JSON files directly within this repository in the `content/` directory.

`content/settings/general.json` → business info like name, address, email, Instagram, etc.

### 4. Run the Development Server

`content/announcements/*.json` → announcements that show up on the site.

```bash
npm run dev
```

public/content/events/\*.json → events listed on the events page.

API routes in src/app/api/content/ handle reading and updating these files.
This makes the site lightweight and easy to maintain.

🛠 Manage page

Go to /manage while running locally and you’ll see the current site settings pulled from JSON.

Right now they show up read-only...the next step will be making them editable with Confirm / No Changes logic.

🌐 Deployment

The site is built for Vercel.
To deploy:

# Steps to deploy on Vercel

1. Log into https://vercel.com and connect your GitHub account
2. Import the repo AuraSecure/iscream-react
3. Use the default settings (Vercel detects Next.js automatically)
4. After the first deploy, you’ll get a live URL like:
   https://iscream-react.vercel.app
5. Every push to the main branch will automatically redeploy the site

🔮 Roadmap

Editable fields in the /manage screen with save functionality.

Authentication so only staff can update content.

Calendar integration for events.

Instagram feed integration.

Expanded design and theming.

```
Open http://localhost:3000 with your browser to see the result. You can start editing the page by modifying `src/app/page.tsx`.
```
