import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, ScrollView, Text, View } from "react-native";
import { Calendar, DateData, LocaleConfig } from "react-native-calendars";
import * as SQLite from "expo-sqlite";
import { EachTransactionItem } from "../utils/types";
import moment from "moment";
import TransactionItem from "../Components/TransactionItem";

const db = SQLite.openDatabase("data.db");

export default function CalendarScreen() {
	const [isLoading, setIsLoading] = useState(true);
	const [markedDates, setMarkedDates] = useState({});
	const [transactions, setTransactions] = useState<EachTransactionItem[]>([]);
	const [selectedDate, setselectedDate] = useState("");
	const [filteredTransactions, setFilteredTransactions] = useState<EachTransactionItem[]>([]);

	useEffect(() => {
		db.transaction(
			(tx) => {
				db.exec(
					[
						{
							sql: "SELECT * FROM transactions",
							args: [],
						},
					],
					false,
					(error, results) => {
						const transactions: EachTransactionItem[] = results[0].rows;

						setTransactions(transactions);

						const markedDates = {};
						transactions.forEach((transaction) => {
							markedDates[transaction.date] = { marked: true };
						});

						// Get the current date in YYYY-MM-DD format
						const currentDate = moment().format("YYYY-MM-DD");

						// Add a special marking for the current date
						markedDates[currentDate] = { dotColor: "white", selected: true };

						setMarkedDates(markedDates);
						setIsLoading(false);
					}
				);
			},
			(error) => alert(error.message)
		);
	}, []);

	const handleSelectedDay = (day: DateData) => {
		setselectedDate(day.dateString);
	};

	useEffect(() => {
		if (selectedDate.length > 0) {
			const setselectedDateTransactions = transactions.filter((transaction) =>
				moment(transaction.date).isSame(selectedDate)
			);
			setFilteredTransactions(setselectedDateTransactions);
		}
	}, [selectedDate]);

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
			<ScrollView className=" p-4 min-h-screen">
				<Calendar
					onDayPress={handleSelectedDay}
					markedDates={markedDates}
					markingType={"dot"}
					onMonthChange={(date) => console.log(date)}
				/>

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