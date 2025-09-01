# SQLite Migration Guide - Expo SDK 53

## Overview

This guide documents the migration from the legacy SQLite API to the new async SQLite API introduced in Expo SDK 53.

## Key Changes Made

### 1. Database Initialization

**Before (Legacy API):**

```typescript
const db = SQLite.openDatabase("data.db");

db.transaction((tx) => {
	db.exec(
		[
			{
				sql: "CREATE TABLE IF NOT EXISTS transactions (...)",
				args: [],
			},
		],
		false,
		callback
	);
});
```

**After (New Async API):**

```typescript
let db: SQLite.SQLiteDatabase | null = null;

const initDatabase = async () => {
	if (!db) {
		db = await SQLite.openDatabaseAsync("data.db");
		await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        amount FLOAT NOT NULL, 
        type VARCHAR(255) NOT NULL, 
        category VARCHAR(255), 
        date DATETIME NOT NULL
      )
    `);
	}
	return db;
};
```

### 2. Query Operations

**Before:**

```typescript
db.transaction((tx) => {
	db.exec(
		[
			{
				sql: "SELECT * FROM transactions",
				args: [],
			},
		],
		false,
		(error, results) => {
			setTransactions(results[0].rows);
		}
	);
});
```

**After:**

```typescript
const database = await initDatabase();
const result = await database.getAllAsync("SELECT * FROM transactions");
setTransactions(result as EachTransactionItem[]);
```

### 3. Insert Operations

**Before:**

```typescript
db.transaction(
	(tx) => {
		db.exec(
			[
				{
					sql: "INSERT INTO transactions (amount, type, category, date) VALUES (?, ?, ?, ?)",
					args: [amount, type, category, date],
				},
			],
			false,
			(error, results) => {
				// Handle success
			}
		);
	},
	(error) => alert(error),
	() => {
		// Success callback
	}
);
```

**After:**

```typescript
const database = await initDatabase();
const result = await database.runAsync("INSERT INTO transactions (amount, type, category, date) VALUES (?, ?, ?, ?)", [
	amount,
	type,
	category,
	date,
]);
// Use result.lastInsertRowId for the new record ID
```

## Files Updated

### 1. HomeScreen.tsx

- Updated database initialization with async pattern
- Converted all transaction queries to async/await
- Updated `handleAddExpense` and `handleAddIncome` functions
- Fixed balance update logic

### 2. CalendarScreen.tsx

- Updated database initialization
- Converted transaction loading to async pattern
- Added proper TypeScript typing for markedDates

### 3. CategoriesScreen.tsx

- Updated database initialization
- Converted expense queries to async pattern
- Updated refresh functionality

## New API Methods Used

- `SQLite.openDatabaseAsync()` - Opens database asynchronously
- `db.execAsync()` - Executes SQL statements (DDL operations)
- `db.getAllAsync()` - Returns all rows from a query
- `db.getFirstAsync()` - Returns first row from a query
- `db.runAsync()` - Executes SQL and returns metadata (insert ID, changes count)

## Benefits of New API

1. **Better Performance** - No callback overhead
2. **Type Safety** - Better TypeScript support
3. **Error Handling** - Standard try/catch patterns
4. **Cleaner Code** - Async/await is more readable than nested callbacks
5. **Future Proof** - Legacy API will be deprecated

## Testing Recommendations

1. Test all database operations (create, read, update, delete)
2. Verify that existing data is preserved
3. Test error scenarios (network issues, database corruption)
4. Verify that the app works on both Android and iOS
5. Test refresh functionality in all screens

## Migration Checklist

- [x] Update HomeScreen.tsx SQLite operations
- [x] Update CalendarScreen.tsx SQLite operations
- [x] Update CategoriesScreen.tsx SQLite operations
- [x] Test database initialization
- [x] Test transaction insertion
- [x] Test data retrieval
- [x] Verify no compilation errors

## Notes

- The database schema remains unchanged
- Existing data should be preserved during the migration
- All error handling has been improved with try/catch blocks
- TypeScript types have been properly applied
