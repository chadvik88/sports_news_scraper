# Sports News Scraper

## Overview
This project fetches sports news articles from multiple RSS feeds (ESPN, Yahoo Sports, Bleacher Report) and stores them in a MySQL database. The data is then accessible via a Next.js API route.

## Setup Instructions
### Prerequisites
- Node.js installed (latest LTS version recommended)
- MySQL database setup and running
- Required NPM packages installed: `axios`, `xml2js`, `rss-parser`, `mysql2`

### Installation Steps
1. Clone the repository:
   ```sh
   git clone https://github.com/chadvik88/sports_news_scraper.git
   cd sports-news-scraper
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Configure your MySQL database connection in `lib/db.js`:
   ```js
   import mysql from 'mysql2/promise';

   const db = await mysql.createPool({
       host: 'localhost',
       user: 'your_username',
       password: 'your_password',
       database: 'your_database_name'
   });

   export default db;
   ```
4. Ensure the `articles` table exists in your MySQL database:
   ```sql
   CREATE TABLE articles (
       id INT AUTO_INCREMENT PRIMARY KEY,
       title VARCHAR(255) NOT NULL,
       link TEXT NOT NULL,
       pubDate DATETIME NOT NULL,
       source VARCHAR(255) NOT NULL
   );
   ```

## Running the API
1. Start your Next.js server:
   ```sh
   npm run dev
   ```
2. Access the API at:
   ```sh
   http://localhost:3000/api/fetchRss
   ```
   This will fetch the latest sports news and store it in the database.

## Checking Stored Data
### Using MySQL CLI:
```sql
SELECT * FROM articles;
```

### Using MySQL GUI (e.g., MySQL Workbench, phpMyAdmin):
- Connect to your database.
- Open the `articles` table to view stored news.

## Deploying to GitHub
1. Initialize a Git repository:
   ```sh
   git init
   git add .
   git commit -m "Initial commit"
   ```
2. Connect to your GitHub repository:
   ```sh
   git remote add origin https://github.com/chadvik88/sports_news_scraper.git
   ```
3. Push your code:
   ```sh
   git push -u origin main
   ```
