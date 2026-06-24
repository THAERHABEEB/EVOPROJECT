const { runQuery, getAll } = require('./config/db');

async function updateActivityImages() {
  try {
    const activities = await getAll('SELECT id, title FROM activity');
    for (const activity of activities) {
      let imgName = '';
      if (activity.title === 'Programming Competition') imgName = 'Programming Competition.webp';
      else if (activity.title === 'Guest Lecture - AI in Medicine') imgName = 'Guest Lecture - AI in Medicine.webp';
      else if (activity.title === 'Workshop - Web Development') imgName = 'Workshop - Web Development.webp';
      else if (activity.title === 'Graduation Ceremony') imgName = 'Graduation Ceremony.webp';

      if (imgName) {
        await runQuery('UPDATE activity SET img_url = $1 WHERE id = $2', [`/Pics/${imgName}`, activity.id]);
      }
    }
    console.log('Successfully updated activity images with webp files');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

updateActivityImages();
