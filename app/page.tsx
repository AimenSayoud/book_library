'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, BookOpen, Upload, ChevronDown, ChevronUp, Search, History, X, Filter, FileDown , Trash2} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  books?: { title: string; imageUrl: string; genre?: string; rating?: number }[]
}

const MAX_LINES = 3
const MAX_INITIAL_BOOKS = 5
const MAX_SEARCH_HISTORY = 10

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set())
  const [expandedBookLists, setExpandedBookLists] = useState<Set<number>>(new Set())
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const genres = [
    "Fiction", "Non-Fiction", "Mystery", "Science Fiction",
    "Romance", "Fantasy", "Biography", "History"
  ]

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    try {
      const text = await file.text()
      setInput(text)
      toast({
        title: "File uploaded",
        description: `"${file.name}" content has been loaded.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to read the file. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt']
    },
    multiple: false,
    noClick: true,
    noKeyboard: true
  })

  const addToSearchHistory = (query: string) => {
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== query)
      return [query, ...filtered].slice(0, MAX_SEARCH_HISTORY)
    })
  }

  // Add this new function inside the Home component
  const clearAllHistory = () => {
    // Clear messages and search history
    setMessages([]);
    setSearchHistory([]);
    // Reset any expanded states
    setExpandedMessages(new Set());
    setExpandedBookLists(new Set());
    // Show toast notification
    toast({
      title: "History cleared",
      description: "All search history and messages have been cleared.",
    });
  };


  interface Book {
    id: number
    title: string
    issued_date: string
    authors: string[]
    subjects: string[]
    cover_url: string
  }
  
  interface Message {
    id: number
    text: string
    sender: 'user' | 'bot'
    timestamp: Date
    books?: Book[]
  }
  
  // Dummy data for fallback
  const dummyBooks: Book[] = [
    {
      id: 1,
      title: "The Great Gatsby",
      issued_date: "1925-04-10",
      authors: ["F. Scott Fitzgerald"],
      subjects: ["Fiction", "Classical Literature", "American Literature"],
      cover_url: "https://covers.openlibrary.org/b/id/12000-L.jpg"
    },
    {
      id: 2,
      title: "1984",
      issued_date: "1949-06-08",
      authors: ["George Orwell"],
      subjects: ["Science Fiction", "Dystopian", "Political Fiction"],
      cover_url: "https://covers.openlibrary.org/b/id/12001-L.jpg"
    },
    {
      id: 3,
      title: "Pride and Prejudice",
      issued_date: "1813-01-28",
      authors: ["Jane Austen"],
      subjects: ["Romance", "Classic Literature", "Social Commentary"],
      cover_url: "https://covers.openlibrary.org/b/id/12002-L.jpg"
    },
    {
      id: 4,
      title: "The Hobbit",
      issued_date: "1937-09-21",
      authors: ["J.R.R. Tolkien"],
      subjects: ["Fantasy", "Adventure", "Children's Literature"],
      cover_url: "https://covers.openlibrary.org/b/id/12003-L.jpg"
    },
    {
      id: 5,
      title: "To Kill a Mockingbird",
      issued_date: "1960-07-11",
      authors: ["Harper Lee"],
      subjects: ["Fiction", "Legal Story", "Southern Literature"],
      cover_url: "https://covers.openlibrary.org/b/id/12004-L.jpg"
    },
    {
      id: 6,
      title: "The Catcher in the Rye",
      issued_date: "1951-07-16",
      authors: ["J.D. Salinger"],
      subjects: ["Fiction", "Coming of Age", "Literary Fiction"],
      cover_url: "https://covers.openlibrary.org/b/id/12005-L.jpg"
    },
    {
      id: 7,
      title: "Lord of the Rings",
      issued_date: "1954-07-29",
      authors: ["J.R.R. Tolkien"],
      subjects: ["Fantasy", "Epic", "Adventure"],
      cover_url: "https://covers.openlibrary.org/b/id/12006-L.jpg"
    },
    {
      id: 8,
      title: "Brave New World",
      issued_date: "1932-01-01",
      authors: ["Aldous Huxley"],
      subjects: ["Science Fiction", "Dystopian", "Classics"],
      cover_url: "https://covers.openlibrary.org/b/id/12007-L.jpg"
    }
  ];
  
  const processInput = async (text: string) => {
    const userMessage: Message = {
      id: Date.now(),
      text: text,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    addToSearchHistory(text);
    setInput('');
    setIsLoading(true);
  
    try {
      const response = await fetch('/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          genres: selectedGenres
        }),
      });
      
      if (!response.ok) {
        throw new Error('Server response was not ok');
      }
  
      const data: { books: Book[] } = await response.json();
      const botMessage: Message = {
        id: Date.now(),
        text: 'Here are some book recommendations based on your description:',
        sender: 'bot',
        timestamp: new Date(),
        books: data.books
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      
      // Filter dummy books based on selected genres and search text
      let filteredBooks = dummyBooks;
      
      if (selectedGenres.length > 0) {
        filteredBooks = dummyBooks.filter(book => 
          book.subjects.some(subject => 
            selectedGenres.some(genre => 
              subject.toLowerCase().includes(genre.toLowerCase())
            )
          )
        );
      }
  
      // Further filter by search text if present
      if (text.trim()) {
        const searchTerms = text.toLowerCase().split(' ');
        filteredBooks = filteredBooks.filter(book =>
          searchTerms.some(term =>
            book.title.toLowerCase().includes(term) ||
            book.subjects.some(subject => subject.toLowerCase().includes(term)) ||
            book.authors.some(author => author.toLowerCase().includes(term))
          )
        );
      }
  
      // Ensure we have at least some results
      if (filteredBooks.length === 0) {
        filteredBooks = dummyBooks.slice(0, 3);
      }
  
      const botMessage: Message = {
        id: Date.now(),
        text: 'Here are some book recommendations that might interest you:',
        sender: 'bot',
        timestamp: new Date(),
        books: filteredBooks
      };
      setMessages(prev => [...prev, botMessage]);
      
      toast({
        title: "Using offline recommendations",
        description: "Couldn't connect to the server. Showing available recommendations instead.",
        variant: "default",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMessageExpansion = (messageId: number) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

  const toggleBookListExpansion = (messageId: number) => {
    setExpandedBookLists(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

  const isMessageExpanded = (messageId: number) => {
    return expandedMessages.has(messageId)
  }

  const isBookListExpanded = (messageId: number) => {
    return expandedBookLists.has(messageId)
  }

  const shouldTruncate = (text: string) => {
    const lineCount = text.split('\n').length
    return lineCount > MAX_LINES
  }

  const truncateText = (text: string) => {
    const lines = text.split('\n')
    if (lines.length > MAX_LINES) {
      return lines.slice(0, MAX_LINES).join('\n')
    }
    return text
  }

  const MessageContent = ({ message }: { message: Message }) => {
    const isExpanded = isMessageExpanded(message.id)
    const needsTruncation = shouldTruncate(message.text)
    
    return (
      <div className="relative">
        <div className="text-sm text-muted-foreground mb-1">
          {message.timestamp.toLocaleTimeString()}
        </div>
        <div className={`whitespace-pre-wrap ${!isExpanded && needsTruncation ? 'max-h-[72px] overflow-hidden' : ''}`}>
          {isExpanded || !needsTruncation ? message.text : truncateText(message.text)}
        </div>
        {needsTruncation && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 h-6 text-xs"
            onClick={() => toggleMessageExpansion(message.id)}
          >
            {isExpanded ? (
              <><ChevronUp className="h-4 w-4 mr-1" /> Show less</>
            ) : (
              <><ChevronDown className="h-4 w-4 mr-1" /> Show more</>
            )}
          </Button>
        )}
      </div>
    )
  }

  const BookList = ({ message }: { message: Message }) => {
    if (!message.books) return null
    
    const isExpanded = isBookListExpanded(message.id)
    const hasMoreBooks = message.books.length > MAX_INITIAL_BOOKS
    const displayedBooks = isExpanded ? message.books : message.books.slice(0, MAX_INITIAL_BOOKS)
    
    return (
      <motion.div 
        className="flex flex-col items-center gap-4 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="flex flex-wrap gap-6 justify-center">
        <AnimatePresence>
  {displayedBooks.map((book, index) => (
    <motion.div 
      key={index}
      className="w-[180px] bg-card rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.1 + index * 0.1, duration: 0.3 }}
    >
      <div className="relative aspect-[2/3] w-full">
        <Image 
          src={book.cover_url} 
          alt={book.title} 
          fill
          className="object-cover rounded-t-lg"
          priority
        />
        {book.issued_date && (
          <span className="absolute top-3 right-3 bg-white/90 text-black text-xs px-3 py-1 rounded-full shadow-sm">
            {book.issued_date}
          </span>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-3 line-clamp-2">
          {book.title}
        </h3>

        {book.subjects && (
          <div className="flex flex-wrap gap-1.5">
            {book.subjects.map((subject, i) => (
              <span 
                key={i} 
                className="text-xs font-medium bg-secondary px-2.5 py-1 rounded-full"
              >
                {subject}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  ))}
</AnimatePresence>
        </div>
        {hasMoreBooks && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => toggleBookListExpansion(message.id)}
          >
            {isExpanded ? (
              <><ChevronUp className="h-4 w-4 mr-1" /> Show less books</>
            ) : (
              <><ChevronDown className="h-4 w-4 mr-1" /> Show {message.books.length - MAX_INITIAL_BOOKS} more books</>
            )}
          </Button>
        )}
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col h-screen p-4 bg-background">
      {/* Header with Filters */}
      {/* Header with Filters */}
<div className="w-full max-w-2xl mx-auto mb-4">
  <div className="flex items-center justify-between">
    <h1 className="text-2xl font-bold">Book Discovery</h1>
    
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={clearAllHistory}
        className="flex items-center gap-2"
      >
        <Trash2 className="h-4 w-4" />
        Clear History
      </Button>
      
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filter Books</SheetTitle>
            <SheetDescription>
              Select genres to narrow down your search
            </SheetDescription>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {genres.map(genre => (
              <Button
                key={genre}
                variant={selectedGenres.includes(genre) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedGenres(prev =>
                    prev.includes(genre)
                      ? prev.filter(g => g !== genre)
                      : [...prev, genre]
                  )
                }}
                className="justify-start"
              >
                {genre}
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  </div>
</div>

      {/* Search Area */}
      <div className="w-full max-w-2xl mx-auto mb-8">
        <div className="relative">
          <form onSubmit={(e) => {
            e.preventDefault()
            if (!input.trim()) return
            processInput(input)
            setShowSuggestions(false)
          }}>
            <div className="flex gap-2" {...getRootProps()}>
              <div className="relative flex-1">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Describe the book you're looking for or drop a text file..."
                  className="pr-10"
                  disabled={isLoading}
                />
                <input {...getInputProps()} />
                {input && (
                  <button
                    type="button"
                    onClick={() => setInput('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* History Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <History size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  {searchHistory.map((query, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => {
                        setInput(query)
                        setShowSuggestions(false)
                      }}
                    >
                      {query}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* File Upload Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    <FileDown size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      open()
                    }}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload .txt file
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Search Button */}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Search size={20} />
                  </motion.div>
                ) : (
<Search size={20} />
                  )}
              </Button>
            </div>
          </form>
          
          {isDragActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg border-2 border-dashed border-primary">
              <p className="text-lg font-medium text-primary">Drop your text file here</p>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <BookOpen className="h-16 w-16 mb-4" />
          <h2 className="text-xl font-medium mb-2">Start Your Book Discovery Journey</h2>
          <p className="text-sm text-center max-w-md">
            Describe the kind of book you're looking for - whether it's by plot, genre,
            mood, or similar books you've enjoyed. Our AI will help you find your next great read.
            You can also upload a text file with your description.
          </p>
          {selectedGenres.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {selectedGenres.map(genre => (
                <span key={genre} className="px-2 py-1 bg-primary/10 rounded-full text-xs">
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <ScrollArea className="flex-1 mb-4 pr-4">
          <AnimatePresence>
            {messages.map(message => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
              >
                <div className={`inline-block p-3 rounded-lg ${
                  message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}>
                  <MessageContent message={message} />
                </div>
                {message.books && <BookList message={message} />}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </ScrollArea>
      )}
    </div>
  )
}