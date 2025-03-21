import mysql from 'mysql2/promise';
import axios from 'axios';
import Parser from 'rss-parser';
import xml2js from 'xml2js';

const parser = new Parser();
const xmlParser = new xml2js.Parser({ explicitArray: false });

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Onein21345@@', // Ensure this is safe in production
    database: 'sports_news',
});

// List of RSS feeds
const rssFeeds = [
    { name: "ESPN", url: "https://www.espn.com/espn/rss/news" },
    { name: "Yahoo Sports", url: "https://sports.yahoo.com/nba/rss.xml" },
    { name: "Bleacher Report", url: "https://bleacherreport.com/articles/feed" },
];

// News API Key (Replace with your key)
const NEWS_API_KEY = "73a84b727568412d8ca2a46b19fb4862";

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        let allArticles = [];

        // Fetch news from RSS feeds
        for (const feed of rssFeeds) {
            try {
                const feedData = await parser.parseURL(feed.url);
                const articles = feedData.items.map(item => ({
                    title: item.title || "No title",
                    link: item.link || "#",
                    pubDate: item.pubDate || "No date",
                    source: feed.name
                }));
                allArticles.push(...articles);
            } catch (rssError) {
                console.warn(`⚠️ Failed to parse ${feed.name} with rss-parser, trying xml2js.`);

                try {
                    const response = await axios.get(feed.url, { headers: { "User-Agent": "Mozilla/5.0" } });
                    const json = await xmlParser.parseStringPromise(response.data);
                    const items = json.rss.channel.item || [];

                    const articles = Array.isArray(items)
                        ? items.map(item => ({
                            title: item.title || "No title",
                            link: item.link || "#",
                            pubDate: item.pubDate || "No date",
                            source: feed.name
                        }))
                        : [];

                    allArticles.push(...articles);
                } catch (xmlError) {
                    console.error(`🚨 XML Parsing failed for ${feed.name}:`, xmlError.message);
                }
            }
        }

        // Fetch news from Sports News API
        try {
            const newsResponse = await axios.get(
                `https://newsapi.org/v2/top-headlines?category=sports&apiKey=${NEWS_API_KEY}`
            );
            const sportsAPIArticles = newsResponse.data.articles.map(article => ({
                title: article.title || "No title",
                link: article.url || "#",
                pubDate: article.publishedAt || "No date",
                source: article.source.name || "Unknown"
            }));
            allArticles.push(...sportsAPIArticles);
        } catch (apiError) {
            console.error("🚨 Failed to fetch from News API:", apiError.message);
        }

        // Store articles in the database
        for (const article of allArticles) {
            try {
                await db.query(
                    "INSERT INTO articles (title, link, pubDate, source) VALUES (?, ?, ?, ?)",
                    [article.title, article.link, article.pubDate, article.source]
                );
            } catch (dbError) {
                console.error("⚠️ Database Insert Error:", dbError.message);
            }
        }

        res.status(200).json({ message: "Sports news fetched & stored!", articles: allArticles });
    } catch (error) {
        console.error("🔥 Error in handler:", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}
