'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  BookIcon,
  PlusCircle,
  Trash2,
  Search,
  Clock,
  BookmarkIcon,
  TrendingUp,
  Filter,
  Heart,
  Star,
  Settings
} from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { ThemeProvider } from "./theme-provider"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface SearchHistory {
  id: number
  query: string
  timestamp: Date
  results: number
}

interface SavedBook {
  id: number
  title: string
  author: string
  isFavorite: boolean
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([
    { id: 1, query: "Epic fantasy with dragons", timestamp: new Date(), results: 20 },
    { id: 2, query: "Science fiction space opera", timestamp: new Date(), results: 12 },
    { id: 3, query: "Mystery set in Victorian era", timestamp: new Date(), results: 8 }
  ])
  const [savedBooks, setSavedBooks] = useState<SavedBook[]>([
    { id: 1, title: "The Midnight Library", author: "Matt Haig", isFavorite: true },
    { id: 2, title: "Project Hail Mary", author: "Andy Weir", isFavorite: false },
    { id: 3, title: "Dune", author: "Frank Herbert", isFavorite: true }
  ])
  // const [activeFilters, setActiveFilters] = useState<string[]>([])

  const handleNewSearch = () => {
    // Logic to start a new search
  }

  const handleClearHistory = () => {
    setSearchHistory([])
  }

  const handleRemoveBook = (id: number) => {
    setSavedBooks(prev => prev.filter(book => book.id !== id))
  }

  const handleToggleFavorite = (id: number) => {
    setSavedBooks(prev => prev.map(book => 
      book.id === id ? { ...book, isFavorite: !book.isFavorite } : book
    ))
  }

  const SidebarSection = ({ children }: { children: React.ReactNode }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <motion.div
        className="bg-card border-r border-border h-screen flex flex-col"
        initial={{ width: 256 }}
        animate={{ width: isOpen ? 320 : 64 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
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
                <span className="ml-2 font-bold text-lg">Book Explorer</span>
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

        {/* Main Content */}
        <ScrollArea className="flex-grow">
          <div className="p-4 space-y-4">
            {/* Quick Actions */}
            {/* <SidebarSection>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleNewSearch} className="flex items-center justify-center">
                  <PlusCircle size={16} className="mr-2" />
                  New Search
                </Button>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="flex items-center justify-center">
                      <Filter size={16} className="mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Search Filters</SheetTitle>
                      <SheetDescription>
                        Refine your book search
                      </SheetDescription>
                    </SheetHeader>
                    {/* Add filter content here */}
                 {/* </SheetContent>
                </Sheet>
              </div>
            </SidebarSection> */}

            {/* Trending Searches */}
            <SidebarSection>
              <Accordion type="single" collapsible>
                <AccordionItem value="trending">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center">
                      <TrendingUp size={16} className="mr-2" />
                      <span>Trending Searches</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                        {["Science Fiction", "Fantasy Adventure", "Non-Fiction"].map((trend, i) => (
                        <Button
                          key={i}
                          variant="ghost"
                          className="w-full justify-start text-sm"
                        >
                          {trend}
                        </Button>
                        ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </SidebarSection>

            {/* Search History */}
            <SidebarSection>
              <Accordion type="single" collapsible>
                <AccordionItem value="history">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock size={16} className="mr-2" />
                        <span>Recent Searches</span>
                      </div>
                      {searchHistory.length > 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleClearHistory()
                          }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {searchHistory.map((item) => (
                        <div
                          key={item.id}
                          className="p-2 bg-muted rounded-md text-sm"
                        >
                          <div className="font-medium">{item.query}</div>
                          <div className="text-xs text-muted-foreground flex justify-between mt-1">
                            <span>{item.results} results</span>
                            <span>{item.timestamp.toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </SidebarSection>

            {/* Saved Books */}
            <SidebarSection>
              <Accordion type="single" collapsible>
                <AccordionItem value="saved">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center">
                      <BookmarkIcon size={16} className="mr-2" />
                      <span>Saved Books</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {savedBooks.map((book) => (
                        <div
                          key={book.id}
                          className="p-2 bg-muted rounded-md text-sm flex items-start justify-between group"
                        >
                          <div>
                            <div className="font-medium">{book.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {book.author}
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleToggleFavorite(book.id)}
                            >
                              <Heart
                                size={14}
                                className={book.isFavorite ? "fill-current text-red-500" : ""}
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveBook(book.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </SidebarSection>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t flex items-center justify-between">
          <ThemeToggle />
        </div>
      </motion.div>
    </ThemeProvider>
  )
}