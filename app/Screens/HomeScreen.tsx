import React, { useEffect, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, TouchableOpacity, View, RefreshControl } from "react-native";
import TabButton from "../Components/TabButton";
import TransactionItem from "../Components/TransactionItem";
import { formatNumberInThousand } from "../utils/helpers";
import * as SQLite from "expo-sqlite";
import { Feather, Ionicons, FontAwesome5, Entypo, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import AddExpenseModal from "../Components/Modals/AddExpenseModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AddIncomeModal from "../Components/Modals/AddIncomeModal";
import DeleteConfirmationModal from "../Components/Modals/DeleteConfirmationModal";
import { AddExpenseProps, AddIncomeProps, EachTransactionItem } from "../utils/types";
import moment from "moment";
import Toast from "react-native-toast-message";

const DEFAULT_CATEGORIES = [
	"Food",
	"Health",
	"Transport",
	"Entertainment",
	"Fashion",
	"Education",
	"Utility",
	"Shopping",
	"Personal Care",
	"Bills",
	"Investments",
];

interface CurrentMonthState {
	income: number;
	expense: number;
}

// Initialize database asynchronously
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
				date DATETIME NOT NULL,
				description TEXT
			)
		`);

		// Add description column if it doesn't exist (for existing databases)
		try {
			await db.execAsync(`ALTER TABLE transactions ADD COLUMN description TEXT`);
		} catch (error) {
			// Column might already exist, ignore error
			console.log("Description column might already exist:", error);
		}
	}
	return db;
};

export default function HomeScreen() {
	const [transactions, setTransactions] = useState<EachTransactionItem[]>([]);
	const [balance, setBalance] = useState<number>(0);
	const [showAddExpenseModal, setShowAddExpenseModal] = useState<boolean>(false);
	const [showAddIncomeModal, setShowAddIncomeModal] = useState<boolean>(false);
	const [categories, setCategories] = useState<string[]>([]);
	const [currentMonth, setCurrentMonth] = useState<CurrentMonthState>({ income: 0, expense: 0 });
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [runway, setRunway] = useState(0);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [transactionToDelete, setTransactionToDelete] = useState<EachTransactionItem | null>(null);

	const getCategoriesFromStorage = async () => {
		try {
			const value = await AsyncStorage.getItem("categories");
			if (value !== null) {
				setCategories(JSON.parse(value));
			} else if (value === null) {
				// this will run for the 1st time
				setCategories(DEFAULT_CATEGORIES);
			}
		} catch (e) {
			alert("couldnt get categories");
		}
	};

	// get categories count from storage
	useEffect(() => {
		getCategoriesFromStorage();
	}, []);

	// set the categories  in storage after its value changes
	useEffect(() => {
		const updateCategoriesInStorage = async () => {
			try {
				await AsyncStorage.setItem("categories", JSON.stringify(categories));
			} catch (error) {
				alert(error);
			}
		};

		updateCategoriesInStorage();
	}, [categories]);

	// get balance count from storage
	useEffect(() => {
		let isMounted = true;

		const getBalanceFromStorage = async () => {
			try {
				const value = await AsyncStorage.getItem("balance");
				if (value !== null && isMounted) {
					setBalance(parseInt(value));
				} else if (value === null && isMounted) {
					// this will run for the 1st time
					setBalance(0);
				}
			} catch (e) {
				alert("couldnt get balance ");
			}
		};

		getBalanceFromStorage();

		return () => {
			isMounted = false;
		};
	}, []);

	// set the balance  in storage after its value changes
	useEffect(() => {
		const updateBalanceInStorage = async () => {
			try {
				await AsyncStorage.setItem("balance", balance.toString());
			} catch (error) {
				alert(error);
			}
		};

		updateBalanceInStorage();
	}, [balance]);

	// get recent transactions
	useEffect(() => {
		const getRecentTransactions = async () => {
			try {
				const database = await initDatabase();
				const result = await database.getAllAsync("SELECT * FROM transactions ORDER BY id DESC LIMIT 5");
				setTransactions(result as EachTransactionItem[]);
			} catch (error) {
				console.error("Error fetching transactions:", error);
			}
		};

		getRecentTransactions();
	}, []);

	// get this month expense
	const getThisMonthExpenses = async () => {
		try {
			const database = await initDatabase();
			const result = (await database.getFirstAsync(
				"SELECT SUM(amount) AS total_expenses FROM transactions WHERE type = 'expense' AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now')"
			)) as { total_expenses: number | null };

			setCurrentMonth((prev) => ({
				...prev,
				expense: result?.total_expenses || 0,
			}));
		} catch (error) {
			console.error("Error getting month expenses:", error);
		}
	};

	// get this month Income
	const getThisMonthIncome = async () => {
		try {
			const database = await initDatabase();
			const result = (await database.getFirstAsync(
				"SELECT SUM(amount) AS total_income FROM transactions WHERE type = 'income' AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now')"
			)) as { total_income: number | null };

			setCurrentMonth((prev) => ({
				...prev,
				income: result?.total_income || 0,
			}));
		} catch (error) {
			console.error("Error getting month income:", error);
		}
	};

	useEffect(() => {
		const loadMonthlyData = async () => {
			await getThisMonthExpenses();
			await getThisMonthIncome();
		};

		loadMonthlyData();
	}, [balance]);

	const calculateRunway = () => {
		// Get the current date
		const currentDate = moment();

		// Get the last day of the current month
		const lastDayOfMonth = currentDate.clone().endOf("month");

		// Calculate the difference in days
		const daysLeft = lastDayOfMonth.diff(currentDate, "days");

		const userRunway = balance / daysLeft;

		setRunway(Math.floor(userRunway));
	};

	useEffect(() => {
		if (balance) {
			calculateRunway();
		}
	}, [balance]);

	const test = async () => {
		// db.transaction((tx) => {
		// 	db.exec(
		// 		[
		// 			{
		// 				sql: "SELECT SUM(amount) AS total_expenses FROM transactions WHERE  type = 'expense' AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now')",
		// 				args: [],
		// 			},
		// 		],
		// 		false,
		// 		(error, results) => console.log(results)
		// 	);
		// });
	};

	const toggleAddExpenseModal = () => setShowAddExpenseModal((prev) => !prev);

	const toggleAddIncomeModal = () => setShowAddIncomeModal((prev) => !prev);

	const handleAddExpense = async (expense: AddExpenseProps) => {
		const newBalance = balance - parseInt(expense.amount);

		if (newBalance < 0) {
			return alert("How did you spend more than what than your current balance? \n 🙄🙄");
		}

		try {
			const database = await initDatabase();
			const result = await database.runAsync(
				"INSERT INTO transactions (amount, type, category, date, description) VALUES (?, ?, ?, ?, ?)",
				[
					parseInt(expense.amount),
					"expense",
					expense.category,
					new Date().toISOString().split("T")[0],
					expense.description || null,
				]
			);

			// Update transactions state
			setTransactions((prev) => [
				{
					id: result.lastInsertRowId,
					amount: parseInt(expense.amount),
					type: "expense",
					category: expense.category,
					date: new Date().toISOString().split("T")[0],
					description: expense.description,
				},
				...prev,
			]);

			// Update balance and close modal
			setBalance(newBalance);
			toggleAddExpenseModal();
			Toast.show({
				type: "success",
				text1: "Great Job 👍",
				text2: "Expense recorded successfully",
			});
		} catch (error) {
			console.error("Error adding expense:", error);
			alert("Failed to add expense. Please try again.");
		}
	};

	const handleAddIncome = async (income: AddIncomeProps) => {
		try {
			const database = await initDatabase();
			const result = await database.runAsync(
				"INSERT INTO transactions (amount, type, category, date, description) VALUES (?, ?, ?, ?, ?)",
				[
					parseInt(income.amount),
					"income",
					income.category || null,
					new Date().toISOString().split("T")[0],
					income.description || null,
				]
			);

			// Update transactions state
			setTransactions((prev) => [
				{
					id: result.lastInsertRowId,
					amount: parseInt(income.amount),
					type: "income",
					category: income.category,
					date: new Date().toISOString().split("T")[0],
					description: income.description,
				},
				...prev,
			]);

			// Update balance and close modal
			setBalance((prev) => prev + parseInt(income.amount));
			toggleAddIncomeModal();
			Toast.show({
				type: "success",
				text1: "Great Job 👍",
				text2: "Income recorded successfully",
			});
		} catch (error) {
			console.error("Error adding income:", error);
			alert("Failed to add income. Please try again.");
		}
	};

	// Handle delete transaction
	const handleDeleteTransaction = (transaction: EachTransactionItem) => {
		setTransactionToDelete(transaction);
		setShowDeleteModal(true);
	};

	// Confirm delete transaction
	const confirmDeleteTransaction = async () => {
		if (!transactionToDelete) return;

		try {
			const database = await initDatabase();

			// Delete the transaction from database
			await database.runAsync("DELETE FROM transactions WHERE id = ?", [transactionToDelete.id]);

			// Update local state by removing the transaction
			setTransactions((prev) => prev.filter((t) => t.id !== transactionToDelete.id));

			// Update balance based on transaction type
			if (transactionToDelete.type === "expense") {
				// Add back the expense amount to balance
				setBalance((prev) => prev + transactionToDelete.amount);
			} else {
				// Subtract the income amount from balance
				setBalance((prev) => prev - transactionToDelete.amount);
			}

			// Close modal and reset state
			setShowDeleteModal(false);
			setTransactionToDelete(null);

			// Refresh monthly data
			await getThisMonthExpenses();
			await getThisMonthIncome();

			Toast.show({
				type: "success",
				text1: "Transaction deleted",
				text2: "Transaction has been removed successfully",
			});
		} catch (error) {
			console.error("Error deleting transaction:", error);
			Toast.show({
				type: "error",
				text1: "Delete failed",
				text2: "An error occurred while deleting the transaction",
			});
		}
	};

	// Close delete modal
	const closeDeleteModal = () => {
		setShowDeleteModal(false);
		setTransactionToDelete(null);
	};

	const handleOnRefresh = async () => {
		setIsRefreshing(true);
		await getCategoriesFromStorage();
		await getThisMonthExpenses();
		await getThisMonthIncome();
		setIsRefreshing(false);
	};

	return (
		<SafeAreaView>
			<View className="relative">
				<ScrollView
					className=" p-4 min-h-screen bg-gray-50"
					refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleOnRefresh} />}
				>
					<View className="bg-white p-5 rounded-2xl flex-1 shadow-sm border border-gray-100">
						<View className="flex flex-row items-center mb-3 space-x-2">
							<View className="bg-orange-100 p-3 rounded-full">
								<MaterialCommunityIcons name="wallet" size={26} color="#D33200" />
							</View>
							<Text className="text-gray-500 text-base font-medium">Total Balance</Text>
						</View>
						<Text className="text-orange-700 text-2xl font-bold">₦ {formatNumberInThousand(balance)}</Text>
					</View>

					<View className="flex flex-row justify-between items-center mt-8 mb-4">
						<Text className="font-bold text-xl text-gray-800">This Month</Text>
					</View>

					{/* Income & Expense Cards */}
					<View className="flex flex-row items-center gap-3">
						<View className="bg-white p-5 rounded-2xl flex-1 shadow-sm border border-gray-100">
							<View className="flex flex-row items-center justify-between mb-3">
								<View className="bg-green-100 p-2 rounded-full">
									<MaterialCommunityIcons name="trending-up" size={20} color="#059669" />
								</View>
								<Text className="text-gray-500 text-sm font-medium">Income</Text>
							</View>
							<Text className="text-green-600 text-2xl font-bold">
								₦ {formatNumberInThousand(currentMonth?.income)}
							</Text>
						</View>

						<View className="bg-white p-5 rounded-2xl flex-1 shadow-sm border border-gray-100">
							<View className="flex flex-row items-center justify-between mb-3">
								<View className="bg-red-100 p-2 rounded-full">
									<MaterialCommunityIcons name="trending-down" size={20} color="#DC2626" />
								</View>
								<Text className="text-gray-500 text-sm font-medium">Expense</Text>
							</View>
							<Text className="text-red-600 text-2xl font-bold">₦ {formatNumberInThousand(currentMonth?.expense)}</Text>
						</View>
					</View>

					{/* Runway Card */}
					<View className="bg-white p-6 rounded-2xl mt-6 shadow-sm border border-gray-100">
						<View className="flex flex-row items-center justify-between mb-3">
							<Text className="text-gray-800 text-lg font-semibold">Daily Budget</Text>
							<View className="bg-blue-100 p-2 rounded-full">
								<MaterialCommunityIcons name="calendar-clock" size={20} color="#2563EB" />
							</View>
						</View>
						<Text className="text-gray-600 text-sm leading-5 mb-4">
							Your recommended daily spending limit to last until month-end
						</Text>
						<Text className="text-blue-600 text-3xl font-bold">₦ {formatNumberInThousand(runway)}</Text>
					</View>

					<View className="flex flex-row justify-between items-center mt-8 ">
						<Text className="font-bold text-xl text-gray-800">Recent Transactions</Text>
					</View>

					<View className="pb-80">
						{transactions.length > 0 ? (
							transactions.map((transaction) => (
								<TransactionItem
									transaction={transaction}
									key={transaction.id}
									onDelete={handleDeleteTransaction}
									showDate={false}
								/>
							))
						) : (
							<View className="bg-white p-6 rounded-2xl items-center shadow-sm border border-gray-100">
								<MaterialCommunityIcons name="history" size={48} color="#9CA3AF" />
								<Text className="text-gray-500 text-center mt-3 text-base">No transactions yet</Text>
								<Text className="text-gray-400 text-center text-sm">Start by adding your first income or expense</Text>
							</View>
						)}
					</View>
				</ScrollView>

				{/* Modern Floating Action Buttons */}
				{/* floting buttons */}
				<View
					style={{ elevation: 10 }}
					className=" flex flex-row items-center justify-evenly absolute left-0 bottom-5 w-full z-50 pb-32"
				>
					<TouchableOpacity
						activeOpacity={0.8}
						onPress={toggleAddIncomeModal}
						className="bg-green-600 h-16 w-16 flex items-center justify-center rounded-full shadow-lg"
						style={{ elevation: 8 }}
					>
						<MaterialCommunityIcons name="plus" size={24} color="white" />
					</TouchableOpacity>

					<TouchableOpacity
						activeOpacity={0.8}
						onPress={toggleAddExpenseModal}
						className="bg-red-600 h-16 w-16 flex items-center justify-center rounded-full shadow-lg"
						style={{ elevation: 8 }}
					>
						<MaterialCommunityIcons name="minus" size={24} color="white" />
					</TouchableOpacity>
				</View>
			</View>

			{showAddExpenseModal && (
				<AddExpenseModal
					showModal={showAddExpenseModal}
					closeModal={toggleAddExpenseModal}
					categories={categories}
					addExpense={handleAddExpense}
				/>
			)}

			{showAddIncomeModal && (
				<AddIncomeModal
					showModal={showAddIncomeModal}
					closeModal={toggleAddIncomeModal}
					addIncome={handleAddIncome}
					categories={categories}
				/>
			)}

			{/* Delete Confirmation Modal */}
			{transactionToDelete && (
				<DeleteConfirmationModal
					showModal={showDeleteModal}
					closeModal={closeDeleteModal}
					onConfirmDelete={confirmDeleteTransaction}
					transactionType={transactionToDelete.type}
					transactionAmount={transactionToDelete.amount}
					transactionCategory={transactionToDelete.category}
				/>
			)}
		</SafeAreaView>
	);
}
