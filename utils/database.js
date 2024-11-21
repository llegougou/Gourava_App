import * as SQLite from 'expo-sqlite';

let db;

export const initializeDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("GouravaDB");
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
        name TEXT,
        FOREIGN KEY (item_id) REFERENCES items(id)
      );
      CREATE TABLE IF NOT EXISTS criteria (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER,
        name TEXT,
        rating INTEGER,
        FOREIGN KEY (item_id) REFERENCES items(id)
      );
      CREATE TABLE IF NOT EXISTS templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT
      );
      CREATE TABLE IF NOT EXISTS template_tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        template_id INTEGER,
        name TEXT,
        FOREIGN KEY (template_id) REFERENCES templates(id)
      );
      CREATE TABLE IF NOT EXISTS template_criteria (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        template_id INTEGER,
        name TEXT,
        FOREIGN KEY (template_id) REFERENCES templates(id)
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
        `INSERT INTO tags (item_id, name) VALUES (?, ?)`,
        [itemId, tag.name]
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
        tags: tags.map(tag => ({
          name: tag.name
        })),
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
      await db.runAsync(`INSERT INTO tags (item_id, name) VALUES (?, ?)`, [id, tag.name]);
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

export const getTagsUsageCount = async (limit) => {
  try {
    if (!db) {
      await initializeDatabase();
    }

    let tagsUsageCount;

    if (limit > 0) {
      tagsUsageCount = await db.getAllAsync(
        `SELECT name, COUNT(*) as usage_count FROM tags GROUP BY name ORDER BY RANDOM() LIMIT ?`, [limit]
      );
    } else {
      tagsUsageCount = await db.getAllAsync(
        `SELECT name, COUNT(*) as usage_count FROM tags GROUP BY name ORDER BY usage_count DESC`
      );
    }
    return tagsUsageCount;
  } catch (error) {
    console.error("Error getting tags usage count:", error);
  }
};

export const getCriteriaUsageCount = async (limit) => {
  try {
    if (!db) {
      await initializeDatabase();
    }

    let criteriaUsageCount;

    if (limit > 0) {
      criteriaUsageCount = await db.getAllAsync(
        `SELECT name, COUNT(*) as usage_count FROM criteria GROUP BY name ORDER BY RANDOM() LIMIT ?`, [limit]
      );
    } else {
      criteriaUsageCount = await db.getAllAsync(
        `SELECT name, COUNT(*) as usage_count FROM criteria GROUP BY name ORDER BY usage_count DESC`
      );
    }
    return criteriaUsageCount;
  } catch (error) {
    console.error("Error getting criteria usage count:", error);
  }
};

export const createTemplate = async (name, tags, criteria) => {
  try {
    if (!db) {
      await initializeDatabase();
    }

    const result = await db.runAsync(`INSERT INTO templates (name) VALUES (?)`, [name]);
    const templateId = result.lastInsertRowId;

    for (let tag of tags) {
      await db.runAsync(`INSERT INTO template_tags (template_id, name) VALUES (?, ?)`, [templateId, tag]);
    }

    for (let criterion of criteria) {
      await db.runAsync(`INSERT INTO template_criteria (template_id, name) VALUES (?, ?)`, [templateId, criterion]);
    }

    return templateId;
  } catch (error) {
    console.error("Error creating template:", error);
  }
};

export const getTemplates = async () => {
  try {
    if (!db) {
      await initializeDatabase();
    }

    const templates = await db.getAllAsync(`SELECT * FROM templates`);

    if (!templates || templates.length === 0) {
      return [];
    }

    const results = [];
    for (const template of templates) {
      const tags = await db.getAllAsync(`SELECT * FROM template_tags WHERE template_id = ?`, [template.id]);
      const criteria = await db.getAllAsync(`SELECT * FROM template_criteria WHERE template_id = ?`, [template.id]);

      results.push({
        id: template.id.toString(),
        name: template.name,
        tags: tags.map(tag => tag.name), 
        criteria: criteria.map(c => c.name), 
      });
    }
    return results;
  } catch (error) {
    console.error("Error getting templates:", error);
  }
};

export const getTemplateById = async (templateId) => {
  try {
    if (!db) {
      await initializeDatabase();
    }

    const template = await db.getFirstAsync(`SELECT * FROM templates WHERE id = ?`, [templateId]);

    if (!template) {
      return null; 
    }

    const tags = await db.getAllAsync(`SELECT name FROM template_tags WHERE template_id = ?`, [templateId]);

    const criteria = await db.getAllAsync(`SELECT name FROM template_criteria WHERE template_id = ?`, [templateId]);

    return {
      id: template.id.toString(),
      name: template.name,
      tags: tags.map(tag => ({ name: tag.name })),
      criteria: criteria.map(c => ({ name: c.name }))
    };
  } catch (error) {
    console.error("Error getting template by ID:", error);
  }
};

export const updateTemplate = async (templateId, name, tags, criteria) => {
  try {
    if (!db) {
      await initializeDatabase();
    }

    await db.runAsync(`UPDATE templates SET name = ? WHERE id = ?`, [name, templateId]);

    await db.runAsync(`DELETE FROM template_tags WHERE template_id = ?`, [templateId]);
    await db.runAsync(`DELETE FROM template_criteria WHERE template_id = ?`, [templateId]);

    for (let tag of tags) {
      await db.runAsync(`INSERT INTO template_tags (template_id, name) VALUES (?, ?)`, [templateId, tag]);
    }

    for (let criterion of criteria) {
      await db.runAsync(`INSERT INTO template_criteria (template_id, name) VALUES (?, ?)`, [templateId, criterion]);
    }

  } catch (error) {
    console.error("Error updating template:", error);
  }
};

export const deleteTemplate = async (templateId) => {
  try {
    if (!db) {
      await initializeDatabase();
    }

    await db.runAsync(`DELETE FROM template_tags WHERE template_id = ?`, [templateId]);
    await db.runAsync(`DELETE FROM template_criteria WHERE template_id = ?`, [templateId]);

    await db.runAsync(`DELETE FROM templates WHERE id = ?`, [templateId]);

  } catch (error) {
    console.error("Error deleting template:", error);
  }
};
