"use client"

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, Upload, ChevronDown, ChevronUp, Search, 
  History, X, Filter, FileDown, Trash2, Calendar,
  Users, Tag, Star
} from 'lucide-react'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Book {
  id: number
  title: string
  issued: string
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

const MAX_LINES = 3
const MAX_INITIAL_BOOKS = 5
const MAX_SEARCH_HISTORY = 10

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
}

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
  const apiCallMadeRef = useRef(false)
  const { toast } = useToast()

  const genres = [
    "Fiction", "Non-Fiction", "Mystery", "Science Fiction",
    "Romance", "Fantasy", "Biography", "History"
  ]

  useEffect(() => {
    apiCallMadeRef.current = false
  }, [input])

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

  const clearAllHistory = () => {
    setMessages([])
    setSearchHistory([])
    setExpandedMessages(new Set())
    setExpandedBookLists(new Set())
    toast({
      title: "History cleared",
      description: "All search history and messages have been cleared.",
    })
  }

  const processInput = async (text: string) => {
    if (apiCallMadeRef.current) return
    apiCallMadeRef.current = true

    const userMessage: Message = {
      id: Date.now(),
      text: text,
      sender: 'user',
      timestamp: new Date()
    }//commit
    setMessages(prev => [...prev, userMessage])
    addToSearchHistory(text)
    setInput('')
    setIsLoading(true)

    console.log(process.env)
  // Use the environment variable
    const API_URL = process.env.NEXT_PUBLIC_API_URL
    try {
      console.log(API_URL)
      const response = await fetch(`${API_URL}/suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Text: text }),
        credentials: 'omit',
        mode: 'cors'
      })

      if (!response.ok) {
        throw new Error('Server response was not ok')
      }

      const data: Book[] = await response.json()
      const booksArray = Array.isArray(data) ? data : [data]

      const botMessage: Message = {
        id: Date.now(),
        text: 'Here are some book recommendations based on your description:',
        sender: 'bot',
        timestamp: new Date(),
        books: booksArray
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      toast({
        title: "Error",
        description: "Failed to fetch recommendations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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

  const isMessageExpanded = (messageId: number) => expandedMessages.has(messageId)
  const isBookListExpanded = (messageId: number) => expandedBookLists.has(messageId)

  const MessageContent = ({ message }: { message: Message }) => {
    const isExpanded = isMessageExpanded(message.id)
    const lines = message.text.split('\n')
    const needsTruncation = lines.length > MAX_LINES
    const displayText = isExpanded ? message.text : lines.slice(0, MAX_LINES).join('\n')
    
    return (
      <div className="relative">
        <div className="text-sm text-muted-foreground mb-1">
          {message.timestamp.toLocaleTimeString()}
        </div>
        <div className={`whitespace-pre-wrap ${!isExpanded && needsTruncation ? 'max-h-[72px] overflow-hidden' : ''}`}>
          {displayText}
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
    if (!message.books || message.books.length === 0) return null
    
    const isExpanded = isBookListExpanded(message.id)
    const hasMoreBooks = message.books.length > MAX_INITIAL_BOOKS
    const displayedBooks = isExpanded ? message.books : message.books.slice(0, MAX_INITIAL_BOOKS)
    
    return (
      <motion.div 
        className="flex flex-col items-center gap-4 mt-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {displayedBooks.map((book, index) => (
              <motion.div
                key={book.id || index}
                variants={itemVariants}
                layout
                className="group"
              >
                <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg">
                  <div className="relative aspect-[2/3] w-full">
                    <Image 
                      src={book.cover_url} 
                      alt={book.title}
                      // height={250}
                      // width={166}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {book.title}
                    </h3>
                    <div className="space-y-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{book.issued}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Publication Date</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span className="line-clamp-1">{book.authors.join(', ')}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Authors</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <div className="flex flex-wrap gap-1">
                        {book.subjects.slice(0, 3).map((subject, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {hasMoreBooks && (
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
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
      {/* Header */}
      <div className="w-full max-w-4xl mx-auto mb-4">
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
            
            <Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" size="sm">
      <Filter className="h-4 w-4 mr-2" />
      Filters {selectedGenres.length > 0 && `(${selectedGenres.length})`}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-80">
    <div className="space-y-4">
      <div className="font-medium">Filter Books</div>
      <p className="text-sm text-muted-foreground">
        Select genres to narrow down your search
      </p>
      <div className="grid grid-cols-2 gap-2">
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
    </div>
  </PopoverContent>
</Popover>




          </div>
        </div>
      </div>

      {/* Search Area */}
      <div className="w-full max-w-4xl mx-auto mb-8">
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
                  <Button variant="outline" size="icon" className="shrink-0">
                    <History size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[300px]">
                  {searchHistory.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No search history yet
                    </div>
                  ) : (
                    searchHistory.map((query, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => {
                          setInput(query)
                          setShowSuggestions(false)
                        }}
                        className="flex items-center gap-2"
                      >
                        <Search className="h-4 w-4 shrink-0" />
                        <span className="truncate">{query}</span>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* File Upload Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="shrink-0"
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
              <Button type="submit" disabled={isLoading} className="shrink-0">
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
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <BookOpen className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-xl font-medium mb-2">Start Your Book Discovery Journey</h2>
            <p className="text-sm max-w-md mx-auto">
              Describe the kind of book you're looking for - whether it's by plot, genre,
              mood, or similar books you've enjoyed. Our AI will help you find your next great read.
            </p>
            {selectedGenres.length > 0 && (
              <motion.div 
                className="mt-4 flex flex-wrap gap-2 justify-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {selectedGenres.map(genre => (
                  <span key={genre} className="px-2 py-1 bg-primary/10 rounded-full text-xs">
                    {genre}
                  </span>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      ) : (
        <ScrollArea className="flex-1 mb-4 px-4">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {messages.map(message => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
                >
                  <div className={`inline-block max-w-[80%] p-4 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-card text-card-foreground shadow-sm'
                  }`}>
                    <MessageContent message={message} />
                  </div>
                  {message.books && <BookList message={message} />}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
      )}
    </div>
  )
}
