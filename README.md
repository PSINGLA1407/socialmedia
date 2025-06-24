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
  - Database View ![image](https://github.com/user-attachments/assets/64c319ce-ad92-467d-b097-10d0b4c699e7)


- **Development Tools:**
  - ESLint 9
  - TypeScript
  - Git for version control

## ✨ Key Features

1. **User Authentication**
   - Secure login and signup functionality
   - Protected routes and API endpoints
   - Session management
   - ![image](https://github.com/user-attachments/assets/0a27c67e-4e9c-4883-901d-6c6e273bea52)

2. **User Profiles**
   - Customizable user profiles
   - Profile picture upload
   - Bio and personal information
   - ![image](https://github.com/user-attachments/assets/fd95cf6b-494f-4148-a8a8-6819d136fb08)

3. **Post Creation and Feed**
   - Create posts with text and images
   - Global feed with real-time updates
   - Image upload and storage using Supabase
     ![image](https://github.com/user-attachments/assets/76a6f1cb-da01-46ba-88eb-674dcf2cd221)

4. **Post Reactions**
   - Like system for posts
   - Multiple likes per user (similar to Medium's Clap)
   - Real-time like count updates
   - ![image](https://github.com/user-attachments/assets/e03b237e-2372-4149-96df-a13322262aeb)

5. **Responsive Design**
   - Mobile-first approach
   - Responsive UI for all screen sizes
   - Modern and clean interface
   - ![image](https://github.com/user-attachments/assets/b4b9f8d2-ff66-4909-b51b-c29063df60b3)


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
