// app/store/newsStore.js
"use client";

import { createContext, useContext, useState, useEffect } from "react";

const defaultNews = [
  {
    id: 1,
    title: "HITU Robotics Team Wins Competition",
    date: "20 April 2025",
    image: "/pics/1.jpg",
    description: "The robotics team at HITU won the national robotics competition.",
    category: "Technology",
    videoLink: "",
    sourceLink: "",
  },
  {
    id: 2,
    title: "New Scholarship Announcement",
    date: "18 April 2025",
    image: "/pics/2.jpg",
    description: "HITU announces new scholarships for outstanding students.",
    category: "Education",
    videoLink: "",
    sourceLink: "",
  },
  {
    id: 3,
    title: "Technology Conference 2025",
    date: "15 April 2025",
    image: "/pics/3.jpg",
    description: "HITU hosts international technology conference.",
    category: "Events",
    videoLink: "",
    sourceLink: "",
  },
  {
    id: 4,
    title: "Technology Conference 2025",
    date: "15 April 2025",
    image: "/pics/4.jpg",
    description: "HITU hosts international technology conference.",
    category: "Events",
    videoLink: "",
    sourceLink: "",
  },
];

// Module-level fallback store used when NewsProvider is not in the tree
let _fallbackNews = [...defaultNews];
const fallbackStore = {
  get newsList() { return _fallbackNews; },
  addNews(item) { _fallbackNews = [item, ..._fallbackNews]; },
};

const NewsContext = createContext(null);

export function NewsProvider({ children }) {
  const [newsList, setNewsList] = useState([]);

  useEffect(() => {
    import('@/lib/api').then(({ api }) => {
      api.news.getAll().then((res) => {
        if (res.status === 'success' && res.data) {
          // Format data to match old expected format
          const formatted = res.data.map(item => ({
            id: item.id,
            title: item.title,
            date: new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            img_url: item.img_url || '/Pics/1.jpg',
            description: item.content || item.description || '',
            category: item.type_size === 'large' ? 'Major' : 'General',
            videoLink: "",
            sourceLink: "",
          }));
          setNewsList(formatted);
          _fallbackNews = formatted;
        }
      }).catch(err => console.error('Error fetching news:', err));
    });
  }, []);

  function addNews(item) {
    setNewsList((prev) => [item, ...prev]);
  }

  return (
    <NewsContext.Provider value={{ newsList, addNews }}>
      {children}
    </NewsContext.Provider>
  );
}

export function useNewsStore() {
  const ctx = useContext(NewsContext);
  // Return fallback store when used outside NewsProvider
  return ctx ?? fallbackStore;
}