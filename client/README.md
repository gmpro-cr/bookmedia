# 📚 BookCircle India - Frontend

A modern React frontend for the BookCircle India social platform, built with mobile-first design principles.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Axios** - HTTP client
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Toast notifications

## 📱 Features

- **Mobile-First Design** - Optimized for mobile devices
- **Authentication** - Login/Register with JWT
- **Book Discovery** - Search and filter books
- **Social Feed** - Reviews and discussions
- **User Profiles** - Personal shelves and stats
- **Community** - Discussions and events
- **Responsive** - Works on all screen sizes

## 🎨 Design System

- **Primary Colors**: Cream (#F5F5DC), Pastel Green (#98FB98), Light Brown (#D2B48C)
- **Typography**: Inter font family
- **Components**: Reusable card, button, and input components
- **Icons**: Lucide React icon library

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx      # Top navigation
│   ├── Navigation.jsx  # Bottom mobile nav
│   ├── BookCard.jsx    # Book display card
│   └── UserProfile.jsx # User profile component
├── pages/              # Page components
│   ├── Home.jsx        # Home feed
│   ├── Login.jsx       # Login page
│   ├── Register.jsx   # Registration page
│   ├── Profile.jsx     # User profile
│   ├── Books.jsx       # Book discovery
│   ├── BookDetail.jsx  # Book details
│   ├── Discussions.jsx # Community discussions
│   └── Events.jsx      # Events and meetups
├── context/            # React context
│   └── AuthContext.jsx # Authentication state
├── App.jsx             # Main app component
├── main.jsx            # App entry point
└── index.css           # Global styles
```

## 🔧 Configuration

The app is configured to proxy API requests to the backend server running on port 3000. Update `vite.config.js` if your backend runs on a different port.

## 📱 Mobile Optimization

- Bottom navigation for easy thumb access
- Touch-friendly buttons and inputs
- Responsive grid layouts
- Optimized images and loading states
- Progressive Web App ready

## 🌟 Next Steps

- Connect to real API endpoints
- Add book cover images
- Implement real-time features
- Add push notifications
- Deploy to Vercel
