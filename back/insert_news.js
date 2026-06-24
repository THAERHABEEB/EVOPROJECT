const { runQuery } = require('./config/db');

async function insertNews() {
  try {
    let inserted = 0;
    for (let i = 1; i <= 10; i++) {
      const query = `
        INSERT INTO news (user_id, img_url, type_size, author, title, content, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `;
      const values = [
        1, // user_id
        `/Pics/news_${i}.jpg`, // img_url (dummy)
        i % 2 === 0 ? 'large' : 'small', // type_size
        `Author ${i}`,
        `University News Headline ${i}`,
        `This is the content for news article ${i}. The university announced several new initiatives today to support students and faculty in their academic endeavors. We hope these changes will bring positive impact.`
      ];
      await runQuery(query, values);
      inserted++;
    }
    console.log(`Successfully inserted ${inserted} news articles into news table`);
  } catch (err) {
    console.error('Error inserting news:', err);
  } finally {
    process.exit(0);
  }
}

insertNews();
