import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

// Function to fetch articles from Notion
async function fetchArticles() {
  const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NOTION_API_KEY}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json"
    }
  });

  const data = await response.json();

  return data.results.map(page => ({
   
        title: page.properties.Title?.title?.[0]?.text?.content || "No Title", // Assuming 'Title' is rich_text
        author: page.properties.Author?.rich_text?.[0]?.text?.content || "Unknown Author", // Assuming 'Author' is also rich_text
        date: page.properties.Date?.date?.start || "Unknown Date", // No change needed for Date
        description: page.properties.Description?.rich_text?.[0]?.text?.content || "", // Assuming 'Description' is rich_text
        image: page.properties.Image?.rich_text?.[0]?.text?.content || "",
        labels: page.properties.Labels?.rich_text?.[0]?.text?.content || "",
      }));
}

// Create an API route to serve articles to the frontend
app.get("/api/notion-articles", async (req, res) => {
  try {
    const articles = await fetchArticles();
    res.json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});

// Serve static files from a "public" folder (optional)
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
