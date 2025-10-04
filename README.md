# I Scream Ice Cream Website

This repo holds the Next.js + Tailwind project for **I Scream Ice Cream** in Albuquerque, NM.  
The site is built to be simple to update, easy to run, and flexible enough to grow with new features as we go.

---

## How to run it

Clone the repo and install packages:

```bash
# (From terminal or PowerShell...inside VS Code hit Ctrl+` to open PowerShell, then enter these commands)
git clone https://github.com/AuraSecure/iscream-react.git
cd iscream-react
npm install
npm run dev

Open

http://localhost:3000

in your browser to see the site running locally.

 //📂 How the content works

Instead of a heavy CMS, all content is stored as JSON files in public/content:

public/content/settings/general.json → business info like name, address, email, Instagram, etc.

public/content/announcements/*.json → announcements that show up on the site.

public/content/events/*.json → events listed on the events page.

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
