const { getAll } = require('./config/db.js');

async function checkTables() {
    try {
        const tables = await getAll(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tables in database:');
        tables.forEach(t => console.log(`- ${t.table_name}`));
        process.exit(0);
    } catch (error) {
        console.error('Error fetching tables:', error);
        process.exit(1);
    }
}

checkTables();
