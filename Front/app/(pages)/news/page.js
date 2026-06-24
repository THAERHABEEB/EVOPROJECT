// app/news/page.js
"use client";
import '@/styles/news.css'
import NewsCard from "@/app/components/NewsCard";
import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import CircularMenu from '@/app/components/CircularMenu';
import { useNewsStore } from '@/app/components/newsStore';

export default function NewsPage() {
  const router = useRouter();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeDate, setActiveDate] = useState('All');

  useEffect(() => {
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);

    // Fetch news from API
    import('@/lib/api').then(({ api }) => {
      api.news.getAll().then((res) => {
        if (res.status === 'success' && res.data) {
          const formatted = res.data.map(item => ({
            id: item.id,
            title: item.title,
            date: new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            img_url: item.img_url || '/Pics/1.jpg',
            description: item.content || item.description || '',
            category: item.type_size === 'large' ? 'Major' : 'General',
          }));
          setNews(formatted);
        }
        setLoading(false);
      }).catch(err => {
        console.error('Error fetching news:', err);
        setLoading(false);
      });
    });

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const categories = ['All', ...new Set(news.map(item => item.category).filter(Boolean))];

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const itemDate = new Date(item.date.replace(/(\d{1,2}) (\w+) (\d{4})/, '$2 $1, $3'));
    const isRecent = itemDate > new Date('January 1, 2025');
    const matchesDate =
      activeDate === 'All' ||
      (activeDate === 'Recent' && isRecent) ||
      (activeDate === 'Older' && !isRecent);
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesDate && matchesCategory;
  });

  return (
    <div className="newsPage">

      <section className="hero">
        <h1>HITU Campus News</h1>
        <p>Latest news and announcements from Helwan International Technological University</p>
        {/* ── Add News Button ── */}
        <button
          className="addNewsBtn"
          onClick={() => router.push("/news/admin")}
        >
          + Add News
        </button>
      </section>

      {/* ── Search + Filter Bar ── */}
      <div className="controls-bar">
        <input
          type="text"
          placeholder="Search news..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />

        <div className="filter-buttons">
          {/* Category Filters */}
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}

          {/* Date Filters */}
          <button
            className={`filter-btn ${activeDate === 'Recent' ? 'active' : ''}`}
            onClick={() => setActiveDate(activeDate === 'Recent' ? 'All' : 'Recent')}
          >
            Recent
          </button>
          <button
            className={`filter-btn ${activeDate === 'Older' ? 'active' : ''}`}
            onClick={() => setActiveDate(activeDate === 'Older' ? 'All' : 'Older')}
          >
            Older
          </button>
        </div>
      </div>

      {/* ── News Grid ── */}
      <section className="newsGrid">
        {loading ? (
          <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '50px', fontSize: '1.2rem', color: '#666' }}>
            Loading latest news...
          </div>
        ) : filteredNews.length > 0 ? (
          filteredNews.map((item) => (
            <NewsCard key={item.id} news={item} />
          ))
        ) : (
          <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '50px', fontSize: '1.2rem', color: '#666' }}>
            No news found matching your filters.
          </div>
        )}
      </section>

      <CircularMenu />
    </div>
  );
}