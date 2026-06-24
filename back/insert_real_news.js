const { runQuery } = require('./config/db');

async function insertRealNews() {
  try {
    // Clear old fake news
    await runQuery('DELETE FROM news');
    
    const realNews = [
      {
        title: "HITU Robotics Team Secures First Place in National Championship",
        content: "After months of rigorous preparation, the HITU Robotics Team has won first place in the National Robotics Championship held in Cairo. Their autonomous robot, 'Atlas', impressed the judges with its precision and speed.",
        img_url: "/Pics/Programming Competition.webp",
        type_size: "large",
        author: "University Administration"
      },
      {
        title: "New AI Research Center Opens on Campus",
        content: "The highly anticipated AI Research Center has officially opened its doors. The state-of-the-art facility will provide students and researchers with cutting-edge hardware to train large language models and neural networks.",
        img_url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop",
        type_size: "small",
        author: "Engineering Department"
      },
      {
        title: "Cybersecurity Workshop with Industry Experts",
        content: "This Friday, HITU will host a Cybersecurity Workshop featuring leading experts from global tech firms. Students will learn about the latest threats, ethical hacking, and how to secure cloud infrastructure.",
        img_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop",
        type_size: "small",
        author: "IT Faculty"
      },
      {
        title: "Graduation Ceremony for the Class of 2026",
        content: "We are incredibly proud to announce the upcoming graduation ceremony for the Class of 2026. Join us as we celebrate the hard work and dedication of our outstanding students as they step into their professional careers.",
        img_url: "/Pics/Graduation Ceremony.webp",
        type_size: "large",
        author: "Student Affairs"
      },
      {
        title: "Renewable Energy Seminar: The Future of Solar",
        content: "The Renewable Energy Department is hosting a seminar on the advancements in solar panel efficiency. Guest speaker Dr. Sarah Youssef will discuss the integration of AI in optimizing solar grid performance.",
        img_url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=600&auto=format&fit=crop",
        type_size: "small",
        author: "Energy Department"
      },
      {
        title: "Mechatronics Students Build Solar-Powered Vehicle",
        content: "A group of final-year Mechatronics students have successfully designed and built a prototype solar-powered vehicle. The car is currently undergoing testing on campus and will represent HITU in the upcoming Eco-Race.",
        img_url: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=600&auto=format&fit=crop",
        type_size: "small",
        author: "Engineering Department"
      },
      {
        title: "Library Expands Digital Archives",
        content: "The university library has expanded its digital archives, giving students access to over 10,000 new academic journals, research papers, and e-books related to Engineering and Computer Science.",
        img_url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=600&auto=format&fit=crop",
        type_size: "large",
        author: "Library Administration"
      },
      {
        title: "Annual Hackathon Dates Announced",
        content: "Get ready to code! The dates for the annual HITU Hackathon have been officially announced. Students will have 48 hours to build innovative software solutions for real-world problems. Registration opens next week.",
        img_url: "/Pics/Workshop - Web Development.webp",
        type_size: "small",
        author: "Computer Science Club"
      },
      {
        title: "New International Exchange Program with European Universities",
        content: "HITU has signed a memorandum of understanding with several top European universities, opening doors for our students to participate in exchange programs starting next semester.",
        img_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop",
        type_size: "large",
        author: "International Relations"
      },
      {
        title: "Alumni Success: Startup Funding",
        content: "Congratulations to our recent alumni whose tech startup just secured $2 million in seed funding. Their innovative supply chain management software is already making waves in the industry.",
        img_url: "https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=600&auto=format&fit=crop",
        type_size: "small",
        author: "Alumni Association"
      }
    ];

    let inserted = 0;
    for (const item of realNews) {
      const query = `
        INSERT INTO news (user_id, img_url, type_size, author, title, content, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `;
      const values = [
        1, // user_id
        item.img_url,
        item.type_size,
        item.author,
        item.title,
        item.content
      ];
      await runQuery(query, values);
      inserted++;
    }
    console.log(`Successfully inserted ${inserted} REAL news articles into news table`);
  } catch (err) {
    console.error('Error inserting real news:', err);
  } finally {
    process.exit(0);
  }
}

insertRealNews();
