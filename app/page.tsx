'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, BookOpen } from 'lucide-react'

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
  books?: { title: string, imageUrl: string }[]
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = { id: Date.now(), text: input, sender: 'user' }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: input }),
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

  return (
    <div className="flex flex-col h-screen p-4 bg-background">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <BookOpen className="h-12 w-12 mb-4" />
          <p className="text-lg font-medium">Your chat is empty</p>
          <p className="text-sm">Start by asking for a book recommendation!</p>
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
                <div className={`inline-block p-3 rounded-lg ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                  {message.text}
                </div>
                {message.books && (
                  <motion.div 
                    className="flex flex-wrap gap-4 mt-4 justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    {message.books.map((book, index) => (
                      <motion.div 
                        key={index}
                        className="text-center bg-card p-4 rounded-lg shadow-lg"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                      >
                        <Image src={book.imageUrl} alt={book.title} width={120} height={180} className="rounded-md mb-2" />
                        <p className="text-sm font-medium">{book.title}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe the book you're looking for..."
          className="flex-1"
          disabled={isLoading}
        />
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
    </div>
  )
}

