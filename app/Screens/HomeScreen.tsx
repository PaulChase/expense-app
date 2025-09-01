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

const DEFAULT_INCOME_CATEGORIES = [
	"Salary",
	"Freelance",
	"Business",
	"Investments",
	"Rental Income",
	"Bonus",
	"Gifts",
	"Side Hustle",
	"Refunds",
	"Other Income",
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
				date DATETIME NOT NULL
			)
		`);
	}
	return db;
};

export default function HomeScreen() {
	const [transactions, setTransactions] = useState<EachTransactionItem[]>([]);
	const [balance, setBalance] = useState<number>(0);
	const [showAddExpenseModal, setShowAddExpenseModal] = useState<boolean>(false);
	const [showAddIncomeModal, setShowAddIncomeModal] = useState<boolean>(false);
	const [categories, setCategories] = useState<string[]>([]);
	const [incomeCategories, setIncomeCategories] = useState<string[]>([]);
	const [currentMonth, setCurrentMonth] = useState<CurrentMonthState>({ income: 0, expense: 0 });
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [runway, setRunway] = useState(0);

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

	const getIncomeCategoriesFromStorage = async () => {
		try {
			const value = await AsyncStorage.getItem("incomeCategories");
			if (value !== null) {
				setIncomeCategories(JSON.parse(value));
			} else if (value === null) {
				// this will run for the 1st time
				setIncomeCategories(DEFAULT_INCOME_CATEGORIES);
			}
		} catch (e) {
			alert("couldn't get income categories");
		}
	};

	// get income categories from storage
	useEffect(() => {
		getIncomeCategoriesFromStorage();
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

	// set the income categories in storage after its value changes
	useEffect(() => {
		const updateIncomeCategoriesInStorage = async () => {
			try {
				await AsyncStorage.setItem("incomeCategories", JSON.stringify(incomeCategories));
			} catch (error) {
				alert(error);
			}
		};

		updateIncomeCategoriesInStorage();
	}, [incomeCategories]);

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
				"INSERT INTO transactions (amount, type, category, date) VALUES (?, ?, ?, ?)",
				[parseInt(expense.amount), "expense", expense.category, new Date().toISOString().split("T")[0]]
			);

			// Update transactions state
			setTransactions((prev) => [
				{
					id: result.lastInsertRowId,
					amount: parseInt(expense.amount),
					type: "expense",
					category: expense.category,
					date: new Date().toISOString().split("T")[0],
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
				"INSERT INTO transactions (amount, type, category, date) VALUES (?, ?, ?, ?)",
				[parseInt(income.amount), "income", income.category || null, new Date().toISOString().split("T")[0]]
			);

			// Update transactions state
			setTransactions((prev) => [
				{
					id: result.lastInsertRowId,
					amount: parseInt(income.amount),
					type: "income",
					category: income.category,
					date: new Date().toISOString().split("T")[0],
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

	const handleOnRefresh = async () => {
		setIsRefreshing(true);
		await getCategoriesFromStorage();
		await getIncomeCategoriesFromStorage();
		await getThisMonthExpenses();
		await getThisMonthIncome();
		setIsRefreshing(false);
	};

	return (
		<SafeAreaView>
			<View className="relative">
				<ScrollView
					className=" p-4 min-h-screen"
					refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleOnRefresh} />}
				>
					<View className=" p-3 bg-white border-l-4 border-blue-700 rounded-md">
						<Text className=" text-lg font-semibold">Balance</Text>
						<Text className=" text-3xl text-blue-700 font-extrabold mt-2">₦ {formatNumberInThousand(balance)}</Text>
					</View>

					<View className="flex flex-row justify-between  items-center mt-6">
						<Text className=" font-semibold  text-lg">This Month</Text>
					</View>

					<View className=" flex flex-row items-center mt-2">
						<View className=" p-3 bg-white border-l-4 border-blue-700 rounded-md flex-1 mr-2">
							<Text className=" text-lg font-semibold text-gray-500">Income</Text>
							<Text className=" text-3xl text-green-600 font-extrabold mt-2">
								₦ {formatNumberInThousand(currentMonth?.income)}
							</Text>
						</View>
						<View className=" p-3 bg-white border-l-4 border-blue-700 rounded-md flex-1 ml-2">
							<Text className=" text-lg font-semibold text-gray-500">Expense</Text>
							<Text className=" text-3xl text-red-700 font-extrabold mt-2">
								₦ {formatNumberInThousand(currentMonth?.expense)}
							</Text>
						</View>
					</View>

					<View className=" p-3 bg-white border-l-4 border-blue-700 rounded-md mt-6">
						<Text className=" text-lg font-semibold">Runway</Text>
						<Text className=" text-gray-500 mt-1 mb-2">
							This is your daily spending limit to ensure you have enough to cover your needs until the end of the
							month.
						</Text>
						<Text className=" text-3xl text-blue-700 font-extrabold mt-2">₦ {formatNumberInThousand(runway)}</Text>
					</View>

					<View className="flex flex-row justify-between  items-center mt-6">
						<Text className=" font-semibold  text-lg">Recent Transactions</Text>
						{/* <Pressable onPress={test}>
							<Ionicons name="reload" size={20} color="gray" />
						</Pressable> */}
					</View>

					<View className=" pb-80">
						{transactions.map((transaction) => (
							<TransactionItem transaction={transaction} key={transaction.id} />
						))}
					</View>
				</ScrollView>

				{/* floting buttons */}
				<View
					style={{ elevation: 10 }}
					className=" flex flex-row items-center justify-evenly absolute left-0 bottom-5 w-full z-50 pb-32"
				>
					<TouchableOpacity
						activeOpacity={0.7}
						onPress={toggleAddIncomeModal}
						className=" bg-green-700 h-16 w-16 flex items-center justify-center rounded-full"
					>
						<FontAwesome5 name="plus" size={20} color="white" />
					</TouchableOpacity>

					<TouchableOpacity
						activeOpacity={0.7}
						onPress={toggleAddExpenseModal}
						className=" bg-red-700 h-16 w-16 flex items-center justify-center rounded-full"
					>
						<FontAwesome5 name="minus" size={20} color="white" />
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
					categories={incomeCategories} 
				/>
			)}
		</SafeAreaView>
	);
}
