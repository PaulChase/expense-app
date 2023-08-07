import React, { useEffect, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import TabButton from "../Components/TabButton";
import TransactionItem from "../Components/TransactionItem";
import { formatNumberInThousand } from "../utils/helpers";
import * as SQLite from "expo-sqlite";
import { Feather, Ionicons, FontAwesome5, Entypo, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import AddExpenseModal from "../Components/Modals/AddExpenseModal";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* List SMS messages matching the filter */
const filter = {
	box: "inbox", // 'inbox' (default), 'sent', 'draft', 'outbox', 'failed', 'queued', and '' for all

	minDate: 1554636310165, // timestamp (in milliseconds since UNIX epoch)

	indexFrom: 0, // start from index 0
	maxCount: 50, // count of SMS to return each time
	address: "UBA",
};

const getAmount = (msg: string) => {
	// Regular expression to match the amount
	const amountRegex = /Amt:NGN\s*([\d,\.]+)/;

	// Extract the amount using the regular expression
	const match = msg.match(amountRegex);

	if (match && match[1]) {
		const amount = match[1].replace(/,/g, ""); // Remove commas from the amount
		return amount;
	} else {
		return null;
	}
};

const formateDate = (theDate: number) => {
	// Create a new Date object using the timestamp
	const date = new Date(theDate);

	// Extract the various components of the date
	const year = date.getFullYear();
	const month = date.getMonth() + 1; // Month is 0-indexed, so add 1
	const day = date.getDate();
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const seconds = date.getSeconds();

	// Create a formatted date string
	const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

	return formattedDate;
};

const getBalance = (message: string) => {
	// Regular expression to match the balance
	const balanceRegex = /Bal:NGN\s*([\d,\.]+)/;

	// Extract the balance using the regular expression
	const match = message.match(balanceRegex);

	if (match && match[1]) {
		const balance = match[1].replace(/,/g, ""); // Remove commas from the balance
		return balance; // Output: Balance: 27248.39
	} else {
		return null;
	}
};

interface TransactionMessage {
	id: number;
	amount: number;
	type: string;
	date: string;
	category: string;
}

export interface AddExpenseProps {
	amount: string;
	category: string;
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
	const [activeTab, setActiveTab] = useState<string>("all");
	const [transactions, setTransactions] = useState<TransactionMessage[]>([]);
	const [balance, setBalance] = useState<number | null>(13500);
	const [showAddExpenseModal, setShowAddExpenseModal] = useState<boolean>(false);
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

	useEffect(() => {
		db.transaction((tx) => {
			db.exec(
				[
					{
						sql: "SELECT * FROM transactions",
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
		// const value = await AsyncStorage.getItem("categories");
		// console.log(JSON.parse(value));
		// console.log();
	};

	const toggleAddExpenseModal = () => setShowAddExpenseModal((prev) => !prev);

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

	return (
		<SafeAreaView>
			<View className=" relative">
				<ScrollView className=" p-4 pb-20 min-h-screen">
					<View className=" p-3 bg-white border-l-4 border-blue-700 rounded-md">
						<Text>Balance</Text>
						<Text className=" text-3xl text-blue-700 font-extrabold mt-2">₦ {formatNumberInThousand(balance)}</Text>
					</View>

					<View className="flex flex-row justify-between  items-center mt-6">
						<Text className=" font-semibold  text-lg">Transactions</Text>
						<Pressable onPress={test}>
							<Ionicons name="reload" size={20} color="gray" />
						</Pressable>
					</View>

					<View className=" flex flex-row items-center space-x-4 mt-2 mb-3">
						<TabButton activeTab={activeTab} tab={"all"} handleChangeTab={handleChangeTab} text={"All"} />
						<TabButton activeTab={activeTab} tab={"income"} handleChangeTab={handleChangeTab} text={"Income"} />
					</View>

					{activeTab === "all" && (
						<View className=" pb-20">
							{transactions.map((transaction, index) => (
								<TransactionItem transaction={transaction} key={transaction.id} />
							))}
						</View>
					)}
					{activeTab === "income" && (
						<View>
							<Text>All Income</Text>
						</View>
					)}
				</ScrollView>

				{/* floting buttons */}
				<View
					style={{ elevation: 10 }}
					className=" flex flex-row items-center justify-evenly absolute left-0 bottom-5 w-full z-50 pb-32"
				>
					<TouchableOpacity
						activeOpacity={0.7}
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
		</SafeAreaView>
	);
}
