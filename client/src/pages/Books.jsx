import React, { useState } from 'react'
import BookCard from '../components/BookCard'
import { Search, Filter, Grid, List } from 'lucide-react'

const Books = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [viewMode, setViewMode] = useState('grid')

  // Mock data
  const books = [
    {
      _id: '1',
      title: 'The Palace of Illusions',
      author: 'Chitra Banerjee Divakaruni',
      coverImage: null,
      averageRating: 4.2,
      reviewCount: 156,
      genres: ['Fiction', 'Mythology', 'Indian Literature']
    },
    {
      _id: '2',
      title: 'The White Tiger',
      author: 'Aravind Adiga',
      coverImage: null,
      averageRating: 3.8,
      reviewCount: 89,
      genres: ['Fiction', 'Contemporary']
    },
    {
      _id: '3',
      title: 'The God of Small Things',
      author: 'Arundhati Roy',
      coverImage: null,
      averageRating: 4.5,
      reviewCount: 234,
      genres: ['Fiction', 'Literary Fiction']
    },
    {
      _id: '4',
      title: 'Midnight\'s Children',
      author: 'Salman Rushdie',
      coverImage: null,
      averageRating: 4.1,
      reviewCount: 312,
      genres: ['Fiction', 'Magical Realism']
    }
  ]

  const genres = ['All', 'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Fantasy', 'Sci-Fi', 'Indian Literature']

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGenre = selectedGenre === '' || selectedGenre === 'All' || 
                        book.genres.includes(selectedGenre)
    return matchesSearch && matchesGenre
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Discover Books</h1>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search books or authors..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              className="input-field"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className={`grid gap-4 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {filteredBooks.map((book) => (
          <BookCard key={book._id} book={book} />
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No books found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}

export default Books
