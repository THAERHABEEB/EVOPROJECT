"use client";

import React, { useState } from "react";
import Header from '@/app/components/Header'
import CircularMenu from '@/app/components/CircularMenu'
import { FilterIcon } from '@/app/components/Icons'

export default function LibraryPage() {

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const uniqueCategories = ["All", ...new Set(books.map(book => book.category).filter(Boolean))];
  const categories = uniqueCategories.length > 1 ? uniqueCategories : ["All"];

  React.useEffect(() => {
    import('@/lib/api').then(({ api }) => {
      api.library.getAll().then((res) => {
        if (res.status === 'success' && res.data) {
          setBooks(res.data);
        }
        setLoading(false);
      }).catch(err => {
        console.error('Error fetching library:', err);
        setLoading(false);
      });
    });
  }, []);

  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Header title="University Library" />
      <div
        style={{
          minHeight: "100vh",
          backgroundImage: "url('/Pics/backlogo.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "40px",
        }}
      >


      {/* Search & Filter */}

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "50px", position: "relative" }}>

        <div style={{ position: "relative", display: "flex", gap: "12px", alignItems: "center" }}>
          
          <input
            type="text"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "14px 20px",
              width: "380px",
              borderRadius: "30px",
              border: "none",
              outline: "none",
              fontSize: "16px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              background: "rgba(255,255,255,0.9)",
            }}
          />

          {/* Filter Button */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              border: "none",
              background: isFilterOpen ? "linear-gradient(90deg,#0b3a6e,#1a5fa8)" : "white",
              color: isFilterOpen ? "white" : "#0b3a6e",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "0.3s",
              position: "relative",
            }}
            title="Filter by Category"
          >
            {/* FilterIcon from Icons.js */}
            <FilterIcon size={22} color={isFilterOpen ? "white" : "#0b3a6e"} />
            
            {/* Notification Dot if active */}
            {selectedCategory !== "All" && (
              <span style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#e4bd63",
                boxShadow: "0 0 5px rgba(228,189,99,0.8)"
              }}></span>
            )}
          </button>

          {/* Dropdown Menu */}
          {isFilterOpen && (
            <div style={{
              position: "absolute",
              top: "100%",
              right: "0",
              marginTop: "15px",
              background: "white",
              borderRadius: "15px",
              padding: "10px",
              width: "250px",
              boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}>
              <div style={{ padding: "8px 12px", fontSize: "12px", fontWeight: "bold", color: "#888", borderBottom: "1px solid #eee", marginBottom: "5px" }}>
                FILTER BY DEPARTMENT
              </div>
              {categories.map((cat) => (
                <div
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setIsFilterOpen(false);
                  }}
                  style={{
                    padding: "10px 15px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: selectedCategory === cat ? "white" : "#333",
                    background: selectedCategory === cat ? "#0b3a6e" : "transparent",
                    transition: "0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== cat) e.currentTarget.style.background = "#f0f5fa";
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== cat) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {cat}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>


      {/* Books Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#fff', fontSize: '1.2rem', marginTop: '50px' }}>Loading books...</div>
      ) : (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(240px, 1fr))",
          gap: "35px",
          justifyContent: "center",
        }}
      >

        {filteredBooks.map((book) => (

          <div
            key={book.id}
            style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(10px)",
              borderRadius: "18px",
              textAlign: "center",
              boxShadow: "0 15px 30px rgba(0,0,0,0.2)",
              transition: "transform 0.3s, box-shadow 0.3s",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,0,0,0.2)";
            }}
          >

            {/* Book Cover Full Width */}
            <div style={{ width: "100%", height: "220px", overflow: "hidden", background: "#f0f0f0" }}>
              <img
                src={book.coverimage || book.image || '/Pics/1.jpg'}
                alt={book.title}
                onError={(e) => { e.target.onerror = null; e.target.src = '/Pics/1.jpg'; }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>

            {/* Card Content with Padding */}
            <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
              <h3 style={{ color: "#0b3a6e", marginBottom: "5px", fontSize: "1.1rem", fontWeight: "bold" }}>
                {book.title}
              </h3>
              <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "auto" }}>
                {book.author}
              </p>

              <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px" }}>

                <a href={book.pdfurl || book.readUrl || '#'} target="_blank" rel="noreferrer" style={{flex: 1, textDecoration: 'none'}}>
                  <button style={{...readBtn, width: '100%'}}>
                    Read
                  </button>
                </a>

                <a href={book.pdfurl || book.downloadUrl || '#'} download target="_blank" rel="noreferrer" style={{flex: 1, textDecoration: 'none'}}>
                  <button style={{...downloadBtn, width: '100%'}}>
                    Download
                  </button>
                </a>

              </div>
            </div>

          </div>

        ))}

      </div>
      )}


      </div>
      <CircularMenu />
    </>
  );
}

const readBtn = {
  background: "#0b3a6e",
  color: "white",
  border: "none",
  padding: "9px 16px",
  borderRadius: "20px",
  cursor: "pointer",
};

const downloadBtn = {
  background: "linear-gradient(90deg,#caa13c,#e4bd63)",
  color: "white",
  border: "none",
  padding: "9px 16px",
  borderRadius: "20px",
  cursor: "pointer",
};

