'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, BookOpen, Upload, ChevronDown, ChevronUp } from 'lucide-react'

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
  books?: { title: string, imageUrl: string }[]
}

const MAX_LINES = 3;
const MAX_INITIAL_BOOKS = 5;

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set())
  const [expandedBookLists, setExpandedBookLists] = useState<Set<number>>(new Set())
  const { toast } = useToast()

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

  const processInput = async (text: string) => {
    const userMessage: Message = { id: Date.now(), text: text, sender: 'user' }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Text: text }),
      })
      const data = await response.json()
      const botMessage: Message = { 
        id: Date.now(), 
        text: 'Here are some book recommendations based on your description:', 
        sender: 'bot',
        books: data.books
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      toast({
        title: "Error",
        description: "Failed to fetch book recommendations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    await processInput(input)
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    try {
      const text = await file.text()
      setInput(text)
      toast({
        title: "File uploaded",
        description: "Text has been extracted and is ready to process.",
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

  const MessageContent = ({ message }: { message: Message }) => {
    const isExpanded = isMessageExpanded(message.id)
    const needsTruncation = shouldTruncate(message.text)
    
    return (
      <div className="relative">
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

  const BookList = ({ message }: { message: Message & { books?: { title: string, imageUrl: string }[] } }) => {
    if (!message.books) return null;
    
    const isExpanded = isBookListExpanded(message.id)
    const hasMoreBooks = message.books.length > MAX_INITIAL_BOOKS
    const displayedBooks = isExpanded ? message.books : message.books.slice(0, MAX_INITIAL_BOOKS)
    
    return (
      <motion.div 
        className="flex flex-col items-center gap-4 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="flex flex-wrap gap-4 justify-center">
          <AnimatePresence>
            {displayedBooks.map((book, index) => (
              <motion.div 
                key={index}
                className="text-center bg-card p-4 rounded-lg shadow-lg"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.1, duration: 0.3 }}
              >
                <Image 
                  src={book.imageUrl} 
                  alt={book.title} 
                  width={120} 
                  height={180} 
                  className="rounded-md mb-2" 
                />
                <p className="text-sm font-medium">{book.title}</p>
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
      {/* Central Search Area */}
      <div className="w-full max-w-2xl mx-auto mb-8 mt-8">
        <div {...getRootProps()} className={`
          p-4 rounded-lg transition-all relative
          ${isDragActive ? 'bg-secondary/50 border-2 border-dashed border-primary' : ''}
        `}>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe the book you're looking for or drop a .txt file here..."
              className="flex-1"
              disabled={isLoading}
            />
            <input {...getInputProps()} />
            <Button 
              type="button" 
              variant="secondary" 
              className="px-3"
              onClick={(e) => {
                e.stopPropagation()
                open()
              }}
            >
              <Upload size={20} />
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Send size={20} />
                </motion.div>
              ) : (
                <Send size={20} />
              )}
            </Button>
          </form>
          {isDragActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
              <p className="text-lg font-medium text-primary">Drop your text file here</p>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground">
          <BookOpen className="h-12 w-12 mb-4" />
          <p className="text-lg font-medium">Start Your Book Discovery</p>
          <p className="text-sm text-center mt-2">
            Type a description or drop a .txt file to get recommendations
            <br />
            You can also click the upload button to select a file
          </p>
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
        </ScrollArea>
      )}
    </div>
  )
}