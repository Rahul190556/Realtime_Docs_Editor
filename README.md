# Realtime Docs Editor

A Google Docs–like **real-time collaborative document editor** built using modern web technologies.  
This project demonstrates **CRDT-based collaboration**, **serverless backend architecture**, and **production-ready deployment**, making it ideal for showcasing real-time system design skills.


## 🚀 Realtime Docs Editor — Overview

### ✨ Features
- Real-time multi-user editing with live cursors and presence
- Conflict-free collaboration using CRDTs
- Rich-text editing (tables, images, colors, task lists)
- Secure authentication and access control
- Responsive, modern UI with Tailwind CSS

### 🧠 Tech Stack
- **Frontend:** Next.js 15, React 19, Tailwind CSS
- **Editor:** TipTap (ProseMirror-based)
- **Realtime:** Liveblocks (CRDT-based sync & presence)
- **Backend & DB:** Convex (serverless backend + reactive database)
- **Authentication:** Clerk

### Architecture Flow

![Architecture](https://github.com/Rahul190556/Realtime_Docs_Editor/blob/e34836a3030dafd1de0ab348665986785db8cda1/architecture.png)


### Architecture Responsibilities

- **Next.js / React**
  - Renders UI and routes documents
  - Handles user interactions and editor state
- **TipTap**
  - Manages rich-text editing and document structure
- **Liveblocks**
  - Synchronizes edits in real time using CRDTs
  - Handles cursors, presence, and collaboration state
- **Convex**
  - Stores document metadata and snapshots
  - Handles permissions and backend logic
- **Clerk**
  - Authenticates users and provides secure identity via JWT

This separation ensures the system is **scalable, maintainable, and production-ready**.



## 🔁 How Concurrent Editing Works

- Each user edits the document **locally** for instant feedback
- Changes are sent as **small operations**, not full document updates
- Liveblocks uses **CRDTs (Conflict-free Replicated Data Types)** to merge edits
- All users converge to the same document state automatically
- No locking, no overwriting, no race conditions

This allows **multiple users (10+ or more)** to edit the same document smoothly.



## ⚙️ Local Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm
- Accounts on Convex, Liveblocks, and Clerk (free tiers are sufficient)
  
![Image2](https://github.com/Rahul190556/Realtime_Docs_Editor/blob/e34836a3030dafd1de0ab348665986785db8cda1/image2.png)
![Image1](https://github.com/Rahul190556/Realtime_Docs_Editor/blob/e34836a3030dafd1de0ab348665986785db8cda1/image1.png)


### Installation

```bash
git clone <your-repo-url>
cd my-app
npm install

Set Environment variables:
NEXT_PUBLIC_CONVEX_URL=https://<deployment-id>.convex.cloud
CLERK_ISSUER_URL=https://<your-clerk-id>.clerk.accounts.dev
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_live_xxx
LIVEBLOCKS_SECRET_KEY=sk_live_xxx

Run Locally:
npx convex dev
npm run dev
Open http://localhost:3000 to view the app.

