import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

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
    
    // Debugging: Log the full response
    console.log("Full Notion API Response:", JSON.stringify(data, null, 2));
  
    // Check if results exist
    if (!data.results) {
      throw new Error("No results found. Check Notion API key and database ID.");
    }
  
    return data.results.map(page => ({
      title: page.properties.Title?.title?.[0]?.text?.content || "No Title",
      author: page.properties.Author?.rich_text?.[0]?.text?.content || "Unknown Author",
      date: page.properties.Date?.date?.start || "Unknown Date",
      description: page.properties.Description?.rich_text?.[0]?.text?.content || "",
      image: page.properties["Image URL"]?.url || "",
      url: page.properties["Article URL"]?.url || "#",
      labels: page.properties.Labels?.multi_select?.map(label => label.name) || []
    }));
  }
  

async function generateHTML() {
  const articles = await fetchArticles();
  let htmlContent = "";

  articles.forEach(article => {
    htmlContent += `
      <div class="article-item">
        <div class="image-wrapper">
          <img src="${article.image}" alt="Article Image" class="article-image">
          <div class="article-labels">
            ${article.labels.map(label => `<span class="article-label">${label}</span>`).join("")}
          </div>
        </div>
        <div class="article-content">
          <h2 class="article-title">${article.title}</h2>
          <p class="article-author-date">By ${article.author} | ${article.date}</p>
          <p class="article-description">${article.description}</p>
         
        </div>
      </div>
    `;
  });

  return htmlContent;
}

// Run the function and print HTML output
generateHTML().then(html => console.log(html));
