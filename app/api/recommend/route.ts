import { NextResponse } from 'next/server'

const mockBooks = [
  { title: "The Great Gatsby", imageUrl: "https://m.media-amazon.com/images/I/71FTb9X6wsL._AC_UY436_FMwebp_QL65_.jpg" },
  { title: "To Kill a Mockingbird", imageUrl: "https://m.media-amazon.com/images/I/71FxgtFKcQL._AC_UY436_FMwebp_QL65_.jpg" },
  { title: "1984", imageUrl: "https://m.media-amazon.com/images/I/71kxa1-0mfL._AC_UY436_FMwebp_QL65_.jpg" },
  { title: "Pride and Prejudice", imageUrl: "https://m.media-amazon.com/images/I/71Q1tPupKjL._AC_UY436_FMwebp_QL65_.jpg" },
  { title: "The Catcher in the Rye", imageUrl: "https://m.media-amazon.com/images/I/61fgOuZfBGL._AC_UY436_FMwebp_QL65_.jpg" },
]

export async function POST(request: Request) {
  const { description } = await request.json()
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // In a real application, you would use the description to fetch relevant books
  // For this example, we'll just return random books from our mock data
  const recommendedBooks = mockBooks
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)

  return NextResponse.json({ books: recommendedBooks })
}

