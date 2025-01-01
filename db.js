import * as SQLite from 'expo-sqlite';

let db;

// Initialize the database
export const initDatabase = async () => {
    if (!db) {
        db = await SQLite.openDatabaseAsync('malaTracker.db');
    }

    // Initialize the table
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS malas (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      malaCount INTEGER NOT NULL,
      date TEXT NOT NULL
    );
  `);
};

// Insert a new mala entry
export const insertMala = async (malaCount, date) => {
    try {

        const result = await db.runAsync(
            'INSERT INTO malas (malaCount, date) VALUES (?, ?);',
            [parseInt(malaCount, 10), date]
        );
        return { success: true, lastInsertRowId: result.lastInsertRowId };
    } catch (error) {
        console.error('Error inserting mala:', error);
        return { success: false, error };
    }
};

// Fetch all mala entries
export const fetchAllMalas = async () => {
    try {
        const rows = await db.getAllAsync('SELECT * FROM malas;');
        return { success: true, data: rows };
    } catch (error) {
        console.error('Error fetching malas:', error);
        return { success: false, data: [] };
    }
};


export const fetchAllMalaForAnalytics = async () => {
    try {
        const rows = await db.getAllAsync('SELECT * FROM malas ORDER BY date DESC LIMIT 7');
        return { success: true, data: rows };
    } catch (error) {
        console.error('Error fetching malas:', error);
        return { success: false, data: [] };
    }
};

// Update a mala entry by ID
export const updateMala = async (id, malaCount, date) => {
    try {
        await db.runAsync(
            'UPDATE malas SET malaCount = ?, date = ? WHERE id = ?;',
            [parseInt(malaCount, 10), date, parseInt(id, 10)]
        );
        return { success: true };
    } catch (error) {
        console.error('Error updating mala:', error);
        return { success: false, error };
    }
};

// Delete a mala entry by ID
export const deleteMala = async (id) => {
    try {
        await db.runAsync('DELETE FROM malas WHERE id = ?;', [parseInt(id, 10)]);
        return { success: true };
    } catch (error) {
        console.error('Error deleting mala:', error);
        return { success: false, error };
    }
};
