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

interface CurrentMonthState {
	income: number;
	expense: number;
}

const db = SQLite.openDatabase("data.db");

db.transaction((tx) => {
	db.exec(
		[
			{
				sql: "CREATE TABLE IF NOT EXISTS transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, amount FLOAT NOT NULL, type VARCHAR(255) NOT NULL, category VARCHAR(255), date DATETIME NOT NULL)",
				args: [],
			},
		],
		false,
		(error, results) => console.log("done")
	);
});

export default function HomeScreen() {
	const [transactions, setTransactions] = useState<EachTransactionItem[]>([]);
	const [balance, setBalance] = useState<number>(0);
	const [showAddExpenseModal, setShowAddExpenseModal] = useState<boolean>(false);
	const [showAddIncomeModal, setShowAddIncomeModal] = useState<boolean>(false);
	const [categories, setCategories] = useState<string[]>([]);
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
		db.transaction((tx) => {
			db.exec(
				[
					{
						sql: "SELECT * FROM transactions ORDER BY id DESC LIMIT 5",
						args: [],
					},
				],
				false,
				(error, results) => setTransactions(results[0].rows)
			);
		});
	}, []);

	// get this month expense
	const getThisMonthExpenses = () => {
		db.transaction((tx) => {
			db.exec(
				[
					{
						sql: "SELECT SUM(amount) AS total_expenses FROM transactions WHERE  type = 'expense' AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now')",
						args: [],
					},
				],
				false,
				(error, results) => setCurrentMonth((prev) => ({ ...prev, expense: results[0].rows[0].total_expenses }))
			);
		});
	};

	// get this month Income
	const getThisMonthIncome = () => {
		// get this month income
		db.transaction((tx) => {
			db.exec(
				[
					{
						sql: "SELECT SUM(amount) AS total_income FROM transactions WHERE  type = 'income' AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now')",
						args: [],
					},
				],
				false,
				(error, results) => setCurrentMonth((prev) => ({ ...prev, income: results[0].rows[0].total_income }))
			);
		});
	};

	useEffect(() => {
		getThisMonthExpenses();
		getThisMonthIncome();
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
		console.log("clicked");
		Toast.show({
			type: "success",
			text1: "Hello",
			text2: "This is some something 👋",
		});
	};

	const toggleAddExpenseModal = () => setShowAddExpenseModal((prev) => !prev);

	const toggleAddIncomeModal = () => setShowAddIncomeModal((prev) => !prev);

	const handleAddExpense = (expense: AddExpenseProps) => {
		db.transaction(
			(tx) => {
				db.exec(
					[
						{
							sql: "INSERT INTO transactions (amount, type, category, date) VALUES (?, ?, ?, ?)",
							args: [parseInt(expense.amount), "expense", expense.category, new Date().toISOString().split("T")[0]],
						},
					],
					false,
					(error, results) => {
						setTransactions((prev) => [
							{
								id: results[0].insertId,
								amount: parseInt(expense.amount),
								type: "expense",
								category: expense.category,
								date: new Date().toISOString().split("T")[0],
							},
							...prev,
						]);
					}
				);
			},
			(error) => alert(error),
			() => {
				setBalance((prev) => parseInt(prev) - parseInt(expense.amount));
				toggleAddExpenseModal();
				Toast.show({
					type: "success",
					text1: "Great Job 👍",
					text2: "Expense recorded successfully",
				});
			}
		);
	};

	const handleAddIncome = (income: AddIncomeProps) => {
		db.transaction(
			(tx) => {
				db.exec(
					[
						{
							sql: "INSERT INTO transactions (amount, type, date) VALUES (?, ?, ?)",
							args: [parseInt(income.amount), "income", new Date().toISOString().split("T")[0]],
						},
					],
					false,
					(error, results) => {
						setTransactions((prev) => [
							{
								id: results[0].insertId,
								amount: parseInt(income.amount),
								type: "income",
								date: new Date().toISOString().split("T")[0],
							},
							...prev,
						]);
					}
				);
			},
			(error) => alert(error),
			() => {
				setBalance((prev) => parseInt(prev) + parseInt(income.amount));
				toggleAddIncomeModal();
				Toast.show({
					type: "success",
					text1: "Great Job 👍",
					text2: "Income recorded successfully",
				});
			}
		);
	};

	const handleOnRefresh = () => {
		setIsRefreshing(true);
		getCategoriesFromStorage();
		getThisMonthExpenses();
		getThisMonthIncome();
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
				<AddIncomeModal showModal={showAddIncomeModal} closeModal={toggleAddIncomeModal} addIncome={handleAddIncome} />
			)}
		</SafeAreaView>
	);
}
