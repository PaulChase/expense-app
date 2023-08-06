import React, { useEffect, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import TabButton from "../Components/TabButton";
import TransactionItem from "../Components/TransactionItem";
import { formatNumberInThousand } from "../utils/helpers";
import SmsAndroid from "react-native-get-sms-android";

/* List SMS messages matching the filter */
const filter = {
	box: "inbox", // 'inbox' (default), 'sent', 'draft', 'outbox', 'failed', 'queued', and '' for all

	/**
	 *  the next 3 filters can work together, they are AND-ed
	 *
	 *  minDate, maxDate filters work like this:
	 *    - If and only if you set a maxDate, it's like executing this SQL query:
	 *    "SELECT * from messages WHERE (other filters) AND date <= maxDate"
	 *    - Same for minDate but with "date >= minDate"
	 */
	minDate: 1554636310165, // timestamp (in milliseconds since UNIX epoch)
	// maxDate: 1556277910456,
	// bodyRegex: "(.*)How are you(.*)",

	/** the next 5 filters should NOT be used together, they are OR-ed so pick one **/
	// read: 1, // 0 for unread SMS, 1 for SMS already read
	// _id: 1234, // specify the msg id
	// thread_id: 12, // specify the conversation thread_id
	// address: "+1888------",
	// body: "How are you",
	/** the next 2 filters can be used for pagination **/
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

export default function HomeScreen() {
	const [activeTab, setActiveTab] = useState<string>("all");
	const [messages, setMessages] = useState([]);
	const [balance, setBalance] = useState<string | null>("0");

	const handleChangeTab = (tab: string) => {
		setActiveTab(tab);
	};

	useEffect(() => {
		SmsAndroid.list(
			JSON.stringify(filter),
			(fail) => {
				console.log("Failed with this error: " + fail);
			},
			(count, smsList) => {
				console.log("Count: ", count);
				// console.log("List: ", smsList);
				const messages = JSON.parse(smsList);

				const recentBalance = getBalance(messages[0].body);

				const mainData = messages
					.filter((msg: any) => msg.body.startsWith("Txn:"))
					.map((msg: any) => {
						const type = msg.body.startsWith("Txn: Credit") ? "Credit" : "Debit";
						const amount = getAmount(msg.body);
						const date = formateDate(msg.date);

						return { type, amount, date };
					});
				setBalance(recentBalance);
				setMessages(mainData);

				// arr.forEach(function (object) {
				// 	// console.log("Object: " + object);
				// 	console.log("-->" + object._id);
				// 	console.log("-->" + object.date);
				// 	console.log("-->" + object.address);
				// 	console.log("-->" + object.body);
				// });
			}
		);
	}, []);

	return (
		<SafeAreaView>
			<ScrollView className=" p-4 pb-20">
				<View className=" p-3 bg-white border-l-4 border-blue-700 rounded-md">
					<Text>Balance</Text>
					<Text className=" text-3xl text-blue-700 font-bold mt-2">₦ {formatNumberInThousand(balance)}</Text>
				</View>

				<Text className=" font-semibold mt-6 text-lg">Transactions</Text>

				<View className=" flex flex-row items-center space-x-4 mt-2 mb-3">
					<TabButton activeTab={activeTab} tab={"all"} handleChangeTab={handleChangeTab} text={"All"} />
					<TabButton activeTab={activeTab} tab={"income"} handleChangeTab={handleChangeTab} text={"Income"} />
				</View>

				{activeTab === "all" && (
					<View className=" pb-20">
						{messages.map((msg, index) => (
							<TransactionItem message={msg} key={index} />
						))}
					</View>
				)}
				{activeTab === "income" && (
					<View>
						<Text>All Income</Text>
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}
