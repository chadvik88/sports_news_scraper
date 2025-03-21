import mysql from 'mysql2/promise';

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Onein21345@@',
    database: 'sports_news',
});

export default db;
