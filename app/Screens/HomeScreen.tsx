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
	maxDate: 1556277910456, // timestamp (in milliseconds since UNIX epoch)
	// bodyRegex: "(.*)How are you(.*)",

	/** the next 5 filters should NOT be used together, they are OR-ed so pick one **/
	read: 0, // 0 for unread SMS, 1 for SMS already read
	_id: 1234, // specify the msg id
	thread_id: 12, // specify the conversation thread_id
	address: "+1888------", // sender's phone number
	body: "How are you", // content to match
	/** the next 2 filters can be used for pagination **/
	indexFrom: 0, // start from index 0
	maxCount: 10, // count of SMS to return each time
};

export default function HomeScreen() {
	const [activeTab, setActiveTab] = useState<string>("all");
	const [messages, setMessages] = useState([]);

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
				console.log("List: ", smsList);
				var arr = JSON.parse(smsList);

				arr.forEach(function (object) {
					console.log("Object: " + object);
					console.log("-->" + object.date);
					console.log("-->" + object.body);
				});
			}
		);
	}, []);

	return (
		<SafeAreaView>
			<ScrollView className=" p-4 pb-20">
				<View className=" p-3 bg-white border-l-4 border-blue-700 rounded-md">
					<Text>Balance</Text>
					<Text className=" text-3xl text-blue-700 font-bold mt-2">₦ {formatNumberInThousand(45899889)}</Text>
				</View>

				<Text className=" font-semibold mt-6 text-lg">Transactions</Text>

				<View className=" flex flex-row items-center space-x-4 mt-2 mb-3">
					<TabButton activeTab={activeTab} tab={"all"} handleChangeTab={handleChangeTab} text={"All"} />
					<TabButton activeTab={activeTab} tab={"income"} handleChangeTab={handleChangeTab} text={"Income"} />
				</View>

				{activeTab === "all" && (
					<View className=" pb-20">
						{new Array(10).fill(0).map((item, index) => (
							<TransactionItem key={index} />
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
