import React, { useEffect, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import TabButton from "../Components/TabButton";
import TransactionItem from "../Components/TransactionItem";
import { formatNumberInThousand } from "../utils/helpers";
import * as SQLite from "expo-sqlite";
import { Feather, Ionicons, FontAwesome5, Entypo, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import AddExpenseModal from "../Components/Modals/AddExpenseModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AddIncomeModal from "../Components/Modals/AddIncomeModal";
import { AddExpenseProps, AddIncomeProps, TransactionItem as TransactionItemType } from "../utils/types";

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
	const [activeTab, setActiveTab] = useState<string>("all");
	const [transactions, setTransactions] = useState<TransactionItemType[]>([]);
	const [balance, setBalance] = useState<number>(0);
	const [showAddExpenseModal, setShowAddExpenseModal] = useState<boolean>(false);
	const [showAddIncomeModal, setShowAddIncomeModal] = useState<boolean>(false);
	const [categories, setCategories] = useState<string[]>([]);

	const handleChangeTab = (tab: string) => {
		setActiveTab(tab);
	};

	// get categories count from storage
	useEffect(() => {
		let isMounted = true;

		const getCategoriesFromStorage = async () => {
			try {
				const value = await AsyncStorage.getItem("categories");
				if (value !== null && isMounted) {
					setCategories(JSON.parse(value));
				} else if (value === null && isMounted) {
					// this will run for the 1st time
					setCategories([
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
					]);
				}
			} catch (e) {
				alert("couldnt get categories ");
			}
		};

		getCategoriesFromStorage();

		return () => {
			isMounted = false;
		};
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

	useEffect(() => {
		db.transaction((tx) => {
			db.exec(
				[
					{
						sql: "SELECT * FROM transactions ORDER BY id DESC",
						args: [],
					},
				],
				false,
				(error, results) => setTransactions(results[0].rows)
			);
		});
	}, []);

	const test = async () => {
		// db.transaction((tx) => {
		// 	db.exec(
		// 		[
		// 			{
		// 				sql: "DROP TABLE IF EXISTS transactions",
		// 				args: [],
		// 			},
		// 		],
		// 		false,
		// 		(error, results) => console.log("table dropeed")
		// 	);
		// });

		console.log("done");
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
			}
		);
	};

	return (
		<SafeAreaView>
			<View className=" relative">
				<ScrollView className=" p-4 pb-40 min-h-screen">
					<View className=" p-3 bg-white border-l-4 border-blue-700 rounded-md">
						<Text>Balance</Text>
						<Text className=" text-3xl text-blue-700 font-extrabold mt-2">₦ {formatNumberInThousand(balance)}</Text>
					</View>

					<View className="flex flex-row justify-between  items-center mt-6">
						<Text className=" font-semibold  text-lg">Recent Transactions</Text>
						<Pressable onPress={test}>
							<Ionicons name="reload" size={20} color="gray" />
						</Pressable>
					</View>

					<View className=" pb-20">
						{transactions.map((transaction, index) => (
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
