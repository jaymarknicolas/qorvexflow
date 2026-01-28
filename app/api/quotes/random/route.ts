import { NextResponse } from "next/server";

interface Quote {
  _id: string;
  content: string;
  author: string;
  tags: string[];
  authorSlug: string;
  length: number;
}

// Comprehensive collection of inspirational quotes
const LOCAL_QUOTES: Quote[] = [
  {
    _id: "local-1",
    content: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    tags: ["inspirational", "work"],
    authorSlug: "steve-jobs",
    length: 52,
  },
  {
    _id: "local-2",
    content: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    tags: ["inspirational", "wisdom"],
    authorSlug: "theodore-roosevelt",
    length: 42,
  },
  {
    _id: "local-3",
    content:
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    tags: ["inspirational", "wisdom"],
    authorSlug: "winston-churchill",
    length: 85,
  },
  {
    _id: "local-4",
    content:
      "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    tags: ["inspirational", "life"],
    authorSlug: "eleanor-roosevelt",
    length: 70,
  },
  {
    _id: "local-5",
    content:
      "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
    tags: ["wisdom", "life"],
    authorSlug: "confucius",
    length: 64,
  },
  {
    _id: "local-6",
    content: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
    tags: ["inspirational", "wisdom"],
    authorSlug: "albert-einstein",
    length: 45,
  },
  {
    _id: "local-7",
    content: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
    tags: ["inspirational", "life"],
    authorSlug: "tony-robbins",
    length: 55,
  },
  {
    _id: "local-8",
    content: "Life is what happens when you're busy making other plans.",
    author: "John Lennon",
    tags: ["life", "wisdom"],
    authorSlug: "john-lennon",
    length: 56,
  },
  {
    _id: "local-9",
    content: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb",
    tags: ["wisdom", "life"],
    authorSlug: "chinese-proverb",
    length: 75,
  },
  {
    _id: "local-10",
    content: "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs",
    tags: ["inspirational", "life"],
    authorSlug: "steve-jobs",
    length: 63,
  },
  {
    _id: "local-11",
    content:
      "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    author: "Nelson Mandela",
    tags: ["inspirational", "wisdom"],
    authorSlug: "nelson-mandela",
    length: 89,
  },
  {
    _id: "local-12",
    content: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    tags: ["inspirational", "work"],
    authorSlug: "walt-disney",
    length: 58,
  },
  {
    _id: "local-13",
    content:
      "If life were predictable it would cease to be life, and be without flavor.",
    author: "Eleanor Roosevelt",
    tags: ["life", "wisdom"],
    authorSlug: "eleanor-roosevelt",
    length: 74,
  },
  {
    _id: "local-14",
    content:
      "Spread love everywhere you go. Let no one ever come to you without leaving happier.",
    author: "Mother Teresa",
    tags: ["love", "life"],
    authorSlug: "mother-teresa",
    length: 83,
  },
  {
    _id: "local-15",
    content:
      "When you reach the end of your rope, tie a knot in it and hang on.",
    author: "Franklin D. Roosevelt",
    tags: ["inspirational", "wisdom"],
    authorSlug: "franklin-d-roosevelt",
    length: 66,
  },
  {
    _id: "local-16",
    content: "Always remember that you are absolutely unique. Just like everyone else.",
    author: "Margaret Mead",
    tags: ["wisdom", "life"],
    authorSlug: "margaret-mead",
    length: 72,
  },
  {
    _id: "local-17",
    content:
      "The purpose of our lives is to be happy.",
    author: "Dalai Lama",
    tags: ["happiness", "life"],
    authorSlug: "dalai-lama",
    length: 40,
  },
  {
    _id: "local-18",
    content: "You only live once, but if you do it right, once is enough.",
    author: "Mae West",
    tags: ["life", "wisdom"],
    authorSlug: "mae-west",
    length: 58,
  },
  {
    _id: "local-19",
    content:
      "Many of life's failures are people who did not realize how close they were to success when they gave up.",
    author: "Thomas A. Edison",
    tags: ["inspirational", "wisdom"],
    authorSlug: "thomas-a-edison",
    length: 104,
  },
  {
    _id: "local-20",
    content: "If you want to live a happy life, tie it to a goal, not to people or things.",
    author: "Albert Einstein",
    tags: ["happiness", "life"],
    authorSlug: "albert-einstein",
    length: 76,
  },
  {
    _id: "local-21",
    content: "Never let the fear of striking out keep you from playing the game.",
    author: "Babe Ruth",
    tags: ["inspirational", "life"],
    authorSlug: "babe-ruth",
    length: 66,
  },
  {
    _id: "local-22",
    content:
      "Money and success don't change people; they merely amplify what is already there.",
    author: "Will Smith",
    tags: ["wisdom", "life"],
    authorSlug: "will-smith",
    length: 81,
  },
  {
    _id: "local-23",
    content:
      "Not how long, but how well you have lived is the main thing.",
    author: "Seneca",
    tags: ["wisdom", "life"],
    authorSlug: "seneca",
    length: 60,
  },
  {
    _id: "local-24",
    content:
      "If you look at what you have in life, you'll always have more.",
    author: "Oprah Winfrey",
    tags: ["happiness", "wisdom"],
    authorSlug: "oprah-winfrey",
    length: 62,
  },
  {
    _id: "local-25",
    content:
      "The mind is everything. What you think you become.",
    author: "Buddha",
    tags: ["wisdom", "inspirational"],
    authorSlug: "buddha",
    length: 50,
  },
  {
    _id: "local-26",
    content: "Strive not to be a success, but rather to be of value.",
    author: "Albert Einstein",
    tags: ["inspirational", "wisdom"],
    authorSlug: "albert-einstein",
    length: 54,
  },
  {
    _id: "local-27",
    content:
      "Two roads diverged in a wood, and I took the one less traveled by, and that has made all the difference.",
    author: "Robert Frost",
    tags: ["life", "wisdom"],
    authorSlug: "robert-frost",
    length: 104,
  },
  {
    _id: "local-28",
    content:
      "I have learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel.",
    author: "Maya Angelou",
    tags: ["wisdom", "love"],
    authorSlug: "maya-angelou",
    length: 140,
  },
  {
    _id: "local-29",
    content:
      "Whether you think you can or you think you can't, you're right.",
    author: "Henry Ford",
    tags: ["inspirational", "wisdom"],
    authorSlug: "henry-ford",
    length: 63,
  },
  {
    _id: "local-30",
    content:
      "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson",
    tags: ["inspirational", "life"],
    authorSlug: "ralph-waldo-emerson",
    length: 74,
  },
  {
    _id: "local-31",
    content: "Go confidently in the direction of your dreams! Live the life you've imagined.",
    author: "Henry David Thoreau",
    tags: ["inspirational", "life"],
    authorSlug: "henry-david-thoreau",
    length: 78,
  },
  {
    _id: "local-32",
    content:
      "When I was 5 years old, my mother always told me that happiness was the key to life.",
    author: "John Lennon",
    tags: ["happiness", "life"],
    authorSlug: "john-lennon",
    length: 84,
  },
  {
    _id: "local-33",
    content: "Everything has beauty, but not everyone sees it.",
    author: "Confucius",
    tags: ["wisdom", "life"],
    authorSlug: "confucius",
    length: 47,
  },
  {
    _id: "local-34",
    content: "Happiness is not something ready made. It comes from your own actions.",
    author: "Dalai Lama",
    tags: ["happiness", "wisdom"],
    authorSlug: "dalai-lama",
    length: 69,
  },
  {
    _id: "local-35",
    content:
      "The best and most beautiful things in the world cannot be seen or even touched - they must be felt with the heart.",
    author: "Helen Keller",
    tags: ["love", "wisdom"],
    authorSlug: "helen-keller",
    length: 113,
  },
  {
    _id: "local-36",
    content: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle",
    tags: ["inspirational", "wisdom"],
    authorSlug: "aristotle",
    length: 69,
  },
  {
    _id: "local-37",
    content:
      "Whoever is happy will make others happy too.",
    author: "Anne Frank",
    tags: ["happiness", "love"],
    authorSlug: "anne-frank",
    length: 44,
  },
  {
    _id: "local-38",
    content: "Do not go where the path may lead, go instead where there is no path and leave a trail.",
    author: "Ralph Waldo Emerson",
    tags: ["inspirational", "life"],
    authorSlug: "ralph-waldo-emerson",
    length: 87,
  },
  {
    _id: "local-39",
    content:
      "Tell me and I forget. Teach me and I remember. Involve me and I learn.",
    author: "Benjamin Franklin",
    tags: ["wisdom", "inspirational"],
    authorSlug: "benjamin-franklin",
    length: 70,
  },
  {
    _id: "local-40",
    content:
      "The best revenge is massive success.",
    author: "Frank Sinatra",
    tags: ["inspirational", "life"],
    authorSlug: "frank-sinatra",
    length: 36,
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("tags");

  // Filter quotes by category if provided
  let filteredQuotes = LOCAL_QUOTES;
  if (category && category !== "all") {
    filteredQuotes = LOCAL_QUOTES.filter((q) =>
      q.tags.some((tag) => tag.toLowerCase() === category.toLowerCase())
    );
    // If no quotes match the category, use all quotes
    if (filteredQuotes.length === 0) {
      filteredQuotes = LOCAL_QUOTES;
    }
  }

  // Return a random quote
  const randomQuote =
    filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];

  return NextResponse.json(randomQuote);
}
