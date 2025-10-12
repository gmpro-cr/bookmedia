import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, BookOpen, MessageCircle, Calendar, User } from 'lucide-react'

const Navigation = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/books', icon: BookOpen, label: 'Books' },
    { path: '/discussions', icon: MessageCircle, label: 'Discussions' },
    { path: '/events', icon: Calendar, label: 'Events' },
    { path: '/profile', icon: User, label: 'Profile' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary-600' : ''}`} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default Navigation
