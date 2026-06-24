const { runQuery } = require('./config/db');

async function addColumn() {
  try {
    await runQuery('ALTER TABLE "students" ADD COLUMN class_ranking VARCHAR(50) DEFAULT \'N/A\';');
    console.log('Column added successfully!');
  } catch (err) {
    if (err.code === '42701') {
      console.log('Column already exists.');
    } else {
      console.error(err);
    }
  } finally {
    process.exit(0);
  }
}

addColumn();
