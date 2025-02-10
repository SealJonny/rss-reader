import sqlite3 from "sqlite3";
import { open } from "sqlite";

async function setupDatabase() {
    const db = await open({
        filename: "mydb.sqlite",
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        );
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS news (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT
        );
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS news_categories (
            category_id INTEGER,
            news_id INTEGER,
            PRIMARY KEY (category_id, news_id),
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
            FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE
        );
    `);


    // Daten einfügen
    await db.run("INSERT INTO categories (name) VALUES (?)", ["Charlie"]);

    // Daten abrufen
    // const users = await db.all("SELECT * FROM users");
    // console.log(users);

    // Verbindung schließen
    await db.close();
}

setupDatabase();
