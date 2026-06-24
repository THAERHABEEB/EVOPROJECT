require('dotenv').config();
const { getAll } = require('./config/db');

async function checkPhoto() {
  try {
    const doctors = await getAll("SELECT id, name, photo FROM doctor");
    console.log(doctors);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
checkPhoto();
