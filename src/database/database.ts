import sqlite3 from "sqlite3";
import { open, Database, ISqlite } from "sqlite";
import { Category } from "../interfaces/category";
import { NewsItem } from "../interfaces/news-item";

async function initDatabase() {
    if (!db) {
        db = await open({
            filename: "mydb.sqlite",
            driver: sqlite3.Database
        });
    }

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


class SqlDatabase {
    db: Database | null = null;
    categories: Categories;
    news: 
    async init(dbFilePath: string): Promise<void> {
        this.db = await open({
            filename: dbFilePath,
            driver: sqlite3.Database
        });
    }

}

class Categories extends SqlDatabase {
    async addCategory(category: Category): Promise<boolean> {
        if (!this.db) {
            console.error("Database not initialized");
            return false;
        }

        const query = "INSERT INTO categories (name) VALUES (?)";
        try {
            const result = await this.db.run(query, category.name);
            return result.changes! > 0;
        } catch (error) {
            console.error("Error while inserting the category:", category.name, error);
            return false;
        }
    }

    async deleteCategory(id: number): Promise<boolean> {
        if (!this.db) {
            console.error("Database not initialized");
            return false;
        }

        const query = "DELETE FROM categories WHERE id = ?";
        try {
            const result = await this.db.run(query, id);
            return result.changes! > 0;
        } catch (error) {
            console.error("Error while deleting the category with ID", id, error);
            return false;
        }
    }

}


class News extends SqlDatabase {
    async addNews(news: NewsItem): Promise<boolean> {
        if (!this.db) {
            console.error("Database not initialized");
            return false;
        }
        return false;
    }

    async deleteCategory(id: number): Promise<boolean> {
        if (!this.db) {
            console.error("Database not initialized");
            return false;
        }

        return false;
    }

}


initDatabase();
