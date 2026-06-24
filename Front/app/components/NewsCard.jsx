// app/components/NewsCard.jsx
'use client';

import { useState } from 'react';
import Image from "next/image";

export default function NewsCard({ news }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="card">

        <Image
          src={news.img_url}
          alt={news.title}
          width={400}
          height={150}
          className="cardImage"
        />

        <div className="cardBody">

          <span className="date">{news.date}</span>
          <h3>{news.title}</h3>
          <button 
            className="readBtn"
            onClick={() => setIsModalOpen(true)}
          >
            Read More
          </button>

        </div>
      </div>

      {isModalOpen && (
        <div className="modalOverlay" onClick={() => setIsModalOpen(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <Image
                src={news.img_url}
                alt={news.title}
                width={600}
                height={300}
                className="modalImage"
              />
            </div>

            <div className="modalBody">
              <span className="modalDate">{news.date}</span>
              <h2>{news.title}</h2>
              <p>{news.description}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}