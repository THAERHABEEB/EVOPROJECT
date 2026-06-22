const { getAll } = require('./config/db.js');

async function checkColumns() {
    try {
        const fs = require('fs');
        const tables = ['upload_grades', 'course', 'control', 'specialization', 'grade'];
        let output = '';
        for (const table of tables) {
            const columns = await getAll(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [table]);
            output += `\n--- Columns in "${table}" ---\n`;
            if (columns.length === 0) {
                output += 'No columns found or table does not exist.\n';
            } else {
                columns.forEach(c => output += `${c.column_name}\n`);
            }
        }
        fs.writeFileSync('columns.txt', output);
        console.log('Columns written to columns.txt');
        process.exit(0);
    } catch (error) {
        console.error('Error fetching columns:', error);
        process.exit(1);
    }
}

checkColumns();
