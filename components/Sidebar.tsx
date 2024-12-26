'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, ChevronLeft, ChevronRight, BookIcon, PlusCircle, Trash2 } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { ThemeProvider } from "./theme-provider"

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [chatHistory, setChatHistory] = useState([1, 2, 3]) // This is just example data

  const handleNewChat = () => {
    // Logic to start a new chat
    setChatHistory(prev => [...prev, prev.length + 1])
  }

  const handleClearHistory = () => {
    // Logic to clear chat history
    setChatHistory([])
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <motion.div 
        className="bg-card border-r border-border h-screen flex flex-col"
        initial={{ width: 256 }}
        animate={{ width: isOpen ? 256 : 64 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between p-4">
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center"
              >
                <BookIcon className="h-6 w-6 text-primary" />
                <span className="ml-2 font-bold text-lg">Book Chat</span>
              </motion.div>
            )}
          </AnimatePresence>
          <Button 
            onClick={() => setIsOpen(!isOpen)} 
            variant="ghost"
            size="icon"
            aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </Button>
        </div>
        <AnimatePresence>
            {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-grow flex flex-col"
            >
              <div className="px-4 mb-4 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Button onClick={handleNewChat} className="flex-1 flex items-center justify-center">
                <PlusCircle size={16} className="mr-2 sm:mr-0" />
                <span className="hidden sm:inline">New</span>
              </Button>
              <Button onClick={handleClearHistory} variant="outline" className="flex-1 flex items-center justify-center">
                <Trash2 size={16} className="mr-2 sm:mr-0" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
              </div>
              <ScrollArea className="flex-grow px-4">
              <h2 className="mb-2 text-lg font-semibold">History</h2>
              {chatHistory.map((item) => (
                <div key={item} className="mb-2 p-2 bg-muted rounded-md flex items-center">
                <BookOpen size={16} className="mr-2" />
                <span>Book Chat {item}</span>
                </div>
              ))}
              </ScrollArea>
            </motion.div>
            )}
        </AnimatePresence>
        <div className="p-4">
          <ThemeToggle />
        </div>
      </motion.div>
    </ThemeProvider>
  )
}

