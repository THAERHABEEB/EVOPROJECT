const { runQuery, getAll } = require('./config/db');
const fs = require('fs');

async function updateActivityImages() {
  try {
    const files = fs.readdirSync('C:/Users/thaer/Desktop/EVO/front/public/Pics/')
      .filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));
    
    const activities = await getAll('SELECT id FROM activity');
    
    for (let i = 0; i < activities.length; i++) {
      const imgName = files[i % files.length];
      const imgUrl = `/Pics/${imgName}`;
      await runQuery('UPDATE activity SET img_url = $1 WHERE id = $2', [imgUrl, activities[i].id]);
    }
    console.log('Successfully updated activity images');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

updateActivityImages();
