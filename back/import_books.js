const { runQuery } = require('./config/db');
const XLSX = require('xlsx');

async function importBooks() {
  try {
    const workbook = XLSX.readFile('C:/Users/thaer/Downloads/Control system books (1).xlsx');
    const sheet_name_list = workbook.SheetNames;
    const books = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    
    let inserted = 0;
    for (const book of books) {
      const query = `
        INSERT INTO library (doctor_id, title, author, isbn, description, category, pdfurl, coverimage)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      const values = [
        book.doctor_id || 1,
        book.title,
        book.author,
        book.isbn ? book.isbn.toString() : null,
        book.description,
        book.category,
        book.pdfUrl || book.pdfurl,
        book.coverImage || book.coverimage
      ];
      await runQuery(query, values);
      inserted++;
    }
    console.log(`Successfully inserted ${inserted} books into library table`);
  } catch (err) {
    console.error('Error importing books:', err);
  } finally {
    process.exit(0);
  }
}

importBooks();
