import React from "react";
import { Pressable, Text } from "react-native";

interface TabButtonInterface {
	text: string;
	activeTab: string;
	tab: string;
	handleChangeTab: (tab: string) => void;
}

export default function TabButton({ text, activeTab, tab, handleChangeTab }: TabButtonInterface) {
	return (
		<Pressable
			className={`  ${activeTab === tab && "border-b-2 border-blue-600 p-2"}`}
			onPress={() => handleChangeTab(tab)}
		>
			<Text className={` text-gray-500 font-semibold ${activeTab === tab && "text-blue-700 "}`}>{text}</Text>
		</Pressable>
	);
}
