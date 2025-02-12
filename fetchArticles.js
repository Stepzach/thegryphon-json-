async function fetchArticles() {
    const response = await fetch("/api/notion-articles"); // Adjust this URL based on your setup
    const articles = await response.json();
  
    // Sort articles by date (most recent first)
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));
  
    articles.forEach(article => {
      // Get the labels from the article data.
      const labels = article.labels.split(',').map(label => label.trim());
  
      // Loop through the labels and try to find a matching container.
      labels.forEach(label => {
        // Construct the CSS selector to find the correct container.
        const containerSelector = `#${label} .content-section .article-grid .article-item #articles-container`;
  
        // Try to find the container element using the selector.
        const container = document.querySelector(containerSelector);
  
        // If a matching container is found, update its content.
        if (container) {
          const articleHTML = `
              <div class="article-item">
                <div class="image-wrapper">
                  <img src="${article.image}" alt="Article Image" class="article-image">
                  <div class="article-labels">
                    ${labels.map(label => `<span class="article-label">${label}</span>`).join("")}
                  </div>
                </div>
                <div class="article-content">
                  <h2 class="article-title">${article.title}</h2>
                  <p class="article-author-date">By ${article.author} | ${article.date}</p>
                  <p class="article-description">${article.description}</p>
                  <a href="${article.url}" class="read-more">Read Full Article →</a>
                </div>
              </div>
          `;
  
          // Append the new article HTML to the container.
          container.innerHTML += articleHTML;
        } else {
          console.warn(`No container found for label: ${label}. Ensure you have the correct HTML structure: <div id="${label}" class="content-section"> <div class="article-grid"> <div class="article-item"><div id="articles-container"></div></div></div></div>`);
        }
      });
    });
  }
  
  // Call the function when the page loads
  window.onload = fetchArticles;