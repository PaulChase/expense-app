import React, { useContext, useState } from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RNPickerSelect from "react-native-picker-select";
import { AddExpenseProps } from "../../utils/types";

interface AddExpenseModalProps {
	showModal: boolean;
	categories: string[];
	closeModal: () => void;
	addExpense: (expense: AddExpenseProps) => void;
}

export default function AddExpenseModal({ showModal, closeModal, categories, addExpense }: AddExpenseModalProps) {
	const [amount, setAmount] = useState("");
	const [category, setCategory] = useState("");

	const handleAddExpense = () => {
		addExpense({ amount, category });
	};

	return (
		<Modal animationType="slide" transparent={true} visible={showModal} onRequestClose={closeModal}>
			<View className=" flex-1 bg-black/80 justify-center items-center px-4">
				<View className="  bg-white rounded-lg w-full p-4">
					<TouchableOpacity activeOpacity={0.6} onPress={closeModal}>
						<View className=" flex-row justify-end mb-3">
							<Ionicons name="close-circle-outline" size={28} color="gray" />
						</View>
					</TouchableOpacity>
					<Text className=" text-lg text-red-600 mb-6 text-center font-semibold">Record Expense</Text>

					<TextInput
						value={amount}
						className="px-2 py-3 bg-gray-100 rounded-md border border-gray-200 "
						placeholder={"amount"}
						onChangeText={setAmount}
						keyboardType="phone-pad"
					/>

					<RNPickerSelect
						onValueChange={(value) => setCategory(value)}
						items={categories
							.sort((a, b) => a.localeCompare(b))
							.map((category) => ({ label: category, value: category }))}
						useNativeAndroidPickerStyle={false}
						style={pickerSelectStyles}
						placeholder={{ label: "Select Category", value: null }}
					/>

					<TouchableOpacity activeOpacity={0.6} onPress={handleAddExpense}>
						<View className=" bg-blue-600 px-4 py-3 rounded-lg flex-row justify-center space-x-3 mt-6">
							<Text className="text-center text-sm text-white font-semibold">Add Expense</Text>
						</View>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
}

const pickerSelectStyles = StyleSheet.create({
	inputIOS: {
		fontSize: 16,
		paddingVertical: 12,
		paddingHorizontal: 10,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 4,
		color: "black",
		paddingRight: 30, // to ensure the text is never behind the icon
		marginTop: 16,
	},
	inputAndroid: {
		fontSize: 16,
		paddingHorizontal: 10,
		paddingVertical: 8,
		borderWidth: 0.5,
		borderColor: "#ccc",
		borderRadius: 8,
		color: "black",
		paddingRight: 30, // to ensure the text is never behind the icon
		marginTop: 16,
	},
});
