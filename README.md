# Future University Social Media Platform

A modern social media platform built with Next.js and Supabase, featuring real-time updates, image sharing, and user interactions.

## 🚀 Technologies Used

- **Frontend:**
  - Next.js 15.3.4 (with Turbopack)
  - React 19.0.0
  - TypeScript 5
  - Styled Components 6.1.19
  - React Icons 5.5.0

- **Backend & Database:**
  - Supabase (PostgreSQL) for database and storage
  - Next.js API Routes
  - NextAuth.js 4.24.11 for authentication

- **Development Tools:**
  - ESLint 9
  - TypeScript
  - Git for version control

## ✨ Key Features

1. **User Authentication**
   - Secure login and signup functionality
   - Protected routes and API endpoints
   - Session management
   - ![image](https://github.com/user-attachments/assets/8d72f0ee-095b-4a32-bd26-027e96ac31ec)

2. **User Profiles**
   - Customizable user profiles
   - Profile picture upload
   - Bio and personal information

3. **Post Creation and Feed**
   - Create posts with text and images
   - Global feed with real-time updates
   - Image upload and storage using Supabase
     ![image](https://github.com/user-attachments/assets/1e4874fb-66ab-4866-96f7-9ebd4ad3092d)

4. **Post Reactions**
   - Like system for posts
   - Multiple likes per user (similar to Medium's Clap)
   - Real-time like count updates
   - ![image](https://github.com/user-attachments/assets/18fae03d-4c69-4566-baf2-86d3fbe4537f)

5. **Responsive Design**
   - Mobile-first approach
   - Responsive UI for all screen sizes
   - Modern and clean interface

## 🛠️ Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/PSINGLA1407/socialmedia.git
   cd socialmedia
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## 📝 Project Structure

```
future-university/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── auth/           # Authentication pages
│   │   ├── create/         # Post creation
│   │   ├── feed/          # Global feed
│   │   └── profile/       # User profiles
│   ├── lib/                # Utility functions
│   └── pages/              # API routes
├── public/                 # Static assets
└── package.json           # Dependencies and scripts
```

## 🔒 Known Limitations

1. **Image Upload:**
   - Maximum file size: 5MB
   - Supported formats: JPG, PNG, GIF
   - Storage quota based on Supabase free tier

2. **Authentication:**
   - Currently using email/password authentication
   - Social login providers can be added as needed

3. **Performance:**
   - Feed pagination limited to recent posts
   - Real-time updates might have slight delay based on network conditions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
