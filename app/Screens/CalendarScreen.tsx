import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, ScrollView, Text, View, RefreshControl } from "react-native";
import { Calendar, DateData, LocaleConfig } from "react-native-calendars";
import * as SQLite from "expo-sqlite";
import { EachTransactionItem } from "../utils/types";
import moment from "moment";
import TransactionItem from "../Components/TransactionItem";

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

export default function CalendarScreen() {
	const [isLoading, setIsLoading] = useState(true);
	const [markedDates, setMarkedDates] = useState({});
	const [transactions, setTransactions] = useState<EachTransactionItem[]>([]);
	const [selectedDate, setSelectedDate] = useState("");
	const [filteredTransactions, setFilteredTransactions] = useState<EachTransactionItem[]>([]);
	const [isRefreshing, setIsRefreshing] = useState(false);

	useEffect(() => {
		const loadTransactions = async () => {
			try {
				const database = await initDatabase();
				const result = await database.getAllAsync("SELECT * FROM transactions");
				const transactions = result as EachTransactionItem[];

				setTransactions(transactions);

				const markedDates: { [key: string]: any } = {};
				transactions.forEach((transaction) => {
					markedDates[transaction.date] = { marked: true };
				});

				// Get the current date in YYYY-MM-DD format
				const currentDate = moment().format("YYYY-MM-DD");

				// Add a special marking for the current date
				markedDates[currentDate] = { dotColor: "white", selected: true };

				const selectedDateTransactions = transactions.filter((transaction) =>
					moment(transaction.date).isSame(currentDate)
				);

				setFilteredTransactions(selectedDateTransactions);
				setSelectedDate(currentDate);
				setMarkedDates(markedDates);
				setIsLoading(false);
			} catch (error) {
				console.error("Error loading transactions:", error);
				alert("Failed to load transactions");
				setIsLoading(false);
			}
		};

		loadTransactions();
	}, []);

	const handleSelectedDay = (day: DateData) => {
		setSelectedDate(day.dateString);
	};

	const getDateTransactions = () => {
		const selectedDateTransactions = transactions.filter((transaction) =>
			moment(transaction.date).isSame(selectedDate)
		);

		setFilteredTransactions(selectedDateTransactions);
	};

	useEffect(() => {
		if (selectedDate.length > 0) {
			getDateTransactions();
		}
	}, [selectedDate]);

	const handleOnRefresh = () => {
		setIsRefreshing(true);
		getDateTransactions();
		setIsRefreshing(false);
	};

	if (isLoading) {
		return (
			<View className=" min-h-screen flex items-center justify-center">
				<ActivityIndicator size={40} color={"blue"} />
				<Text className=" text-xl font-medium to-gray-600 mt-2">Preparing Calendar...</Text>
			</View>
		);
	}
	return (
		<SafeAreaView>
			<ScrollView
				className=" p-4 min-h-screen"
				refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleOnRefresh} />}
			>
				<Text className=" font-semibold  text-xl mb-4 p-3 bg-white rounded-md">Daily recorded transactions</Text>

				<Calendar onDayPress={handleSelectedDay} markedDates={markedDates} markingType={"dot"} />

				{selectedDate && (
					<View className=" mt-6">
						<Text className=" font-semibold  text-lg">{new Date(selectedDate).toDateString()} transactions</Text>

						{filteredTransactions.length > 0 && (
							<View className=" pb-60">
								{filteredTransactions.map((transaction) => (
									<TransactionItem transaction={transaction} key={transaction.id} showDate={false} />
								))}
							</View>
						)}
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}
