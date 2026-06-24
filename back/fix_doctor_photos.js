require('dotenv').config();
const { runQuery } = require('./config/db');

async function fixDoctorPhotos() {
  try {
    await runQuery("UPDATE doctor SET photo = '/Pics/Dr.Aber.webp' WHERE photo = '/Pics/Dr.Aber.jpeg'");
    await runQuery("UPDATE doctor SET photo = '/Pics/Unkown_man.jfif' WHERE photo = '/Pics/Unkown_man.jpeg'");
    console.log("Doctor photos fixed!");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
fixDoctorPhotos();
