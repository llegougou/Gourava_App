import * as SQLite from 'expo-sqlite';

let db;

export const initializeDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("itemsDB");
  }

  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT
      );
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER,
        tag TEXT,
        FOREIGN KEY (item_id) REFERENCES items(id)
      );
      CREATE TABLE IF NOT EXISTS criteria (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER,
        name TEXT,
        rating INTEGER,
        FOREIGN KEY (item_id) REFERENCES items(id)
      );
    `);
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

export const addItem = async (title, tags, criteriaRatings) => {
  try {
    if (!db) {
      await initializeDatabase();
    }

    const result = await db.runAsync(
      `INSERT INTO items (title) VALUES (?)`,
      [title]
    );

    const itemId = result.lastInsertRowId; 

    for (let tag of tags) {
      await db.runAsync(
        `INSERT INTO tags (item_id, tag) VALUES (?, ?)`,
        [itemId, tag]
      );
    }

    for (let criteria of criteriaRatings) {
      await db.runAsync(
        `INSERT INTO criteria (item_id, name, rating) VALUES (?, ?, ?)`,
        [itemId, criteria.name, criteria.rating]
      );
    }
  } catch (error) {
    console.error("Error adding item:", error);
  }
};

export const getItems = async (limit) => {
    try {
      if (!db) {
        await initializeDatabase();
      }
  
      let items;
      
      if (limit > 0) {
        items = await db.getAllAsync(`SELECT * FROM items ORDER BY RANDOM() LIMIT ?`, [limit]);
      } else {
        items = await db.getAllAsync(`SELECT * FROM items`);
      }
  
      if (!items || items.length === 0) {
        return [];
      }
  
      const results = [];
      for (const item of items) {
        const tags = await db.getAllAsync(`SELECT * FROM tags WHERE item_id = ?`, [item.id]);
        const criteria = await db.getAllAsync(`SELECT * FROM criteria WHERE item_id = ?`, [item.id]);
  
        results.push({
          id: item.id.toString(),
          title: item.title,
          tags: tags.map(tag => tag.tag),
          criteriaRatings: criteria.map(c => ({
            name: c.name,
            rating: c.rating
          }))
        });
      }
  
      return results;
    } catch (error) {
      console.error("Error getting items:", error);
    }
  };
  

export const getTagsUsageCount = async () => {
  try {
    if (!db) {
      await initializeDatabase();
    }

    const tagsUsageCount = await db.getAllAsync(
      `SELECT tag, COUNT(*) as usage_count FROM tags GROUP BY tag ORDER BY usage_count DESC`
    );
    return tagsUsageCount;
  } catch (error) {
    console.error("Error getting tags usage count:", error);
  }
};

export const getCriteriaUsageCount = async () => {
  try {
    if (!db) {
      await initializeDatabase();
    }

    const criteriaUsageCount = await db.getAllAsync(
      `SELECT name, COUNT(*) as usage_count FROM criteria GROUP BY name ORDER BY usage_count DESC`
    );
    return criteriaUsageCount;
  } catch (error) {
    console.error("Error getting criteria usage count:", error);
  }
};

export const deleteItem = async (id) => {
  try {
    if (!db) {
      await initializeDatabase();
    }

    await db.runAsync(`DELETE FROM tags WHERE item_id = ?`, [id]);
    await db.runAsync(`DELETE FROM criteria WHERE item_id = ?`, [id]);

    await db.runAsync(`DELETE FROM items WHERE id = ?`, [id]);
  } catch (error) {
    console.error("Error deleting item:", error);
  }
};

export const updateItem = async (id, title, tags, criteriaRatings) => {
  try {
    if (!db) {
      await initializeDatabase();
    }

    await db.runAsync(`UPDATE items SET title = ? WHERE id = ?`, [title, id]);

    await db.runAsync(`DELETE FROM tags WHERE item_id = ?`, [id]);
    await db.runAsync(`DELETE FROM criteria WHERE item_id = ?`, [id]);

    for (let tag of tags) {
      await db.runAsync(`INSERT INTO tags (item_id, tag) VALUES (?, ?)`, [id, tag]);
    }

    for (let criteria of criteriaRatings) {
      await db.runAsync(
        `INSERT INTO criteria (item_id, name, rating) VALUES (?, ?, ?)`,

        [id, criteria.name, criteria.rating]
      );
    }
  } catch (error) {
    console.error("Error updating item:", error);
  }
};