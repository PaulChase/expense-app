import React, { useContext, useState } from "react";
import { Button, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AddExpenseProps } from "../../utils/types";
import ModalSelector from "react-native-modal-selector";

interface AddExpenseModalProps {
	showModal: boolean;
	categories: string[];
	closeModal: () => void;
	addExpense: (expense: AddExpenseProps) => void;
}

export default function AddExpenseModal({ showModal, closeModal, categories, addExpense }: AddExpenseModalProps) {
	const [amount, setAmount] = useState("");
	const [category, setCategory] = useState("");
	const [description, setDescription] = useState("");

	const handleAddExpense = () => {
		addExpense({ amount, category, description: description.trim() || undefined });
	};

	const handleCloseModal = () => {
		setAmount("");
		setCategory("");
		setDescription("");
		closeModal();
	};

	return (
		<Modal animationType="slide" transparent={true} visible={showModal} onRequestClose={handleCloseModal}>
			<View className=" flex-1 bg-black/80 justify-center items-center px-4">
				<View className="  bg-white rounded-lg w-full p-4">
					<TouchableOpacity activeOpacity={0.6} onPress={handleCloseModal}>
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

					<ModalSelector
						data={categories.sort((a, b) => a.localeCompare(b)).map((category) => ({ id: category, label: category }))}
						keyExtractor={(item) => item.id}
						style={{ marginTop: 18 }}
						onChange={(option) => {
							setCategory(option.label);
						}}
						header={
							<View style={{ padding: 16, alignItems: "center" }}>
								<Text style={{ fontSize: 16, color: "black" }}>What did you spend the money on?</Text>
							</View>
						}
						overlayStyle={{ flex: 1, padding: "5%", justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.7)" }}
					>
						<TextInput
							style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 6, color: "gray" }}
							editable={false}
							placeholder="Select category..."
							value={category}
						/>
					</ModalSelector>

					<TextInput
						value={description}
						className="px-2 py-3 bg-gray-100 rounded-md border border-gray-200 mt-4"
						placeholder="Description (optional)"
						onChangeText={setDescription}
						multiline={true}
						numberOfLines={2}
					/>

					<TouchableOpacity
						activeOpacity={0.6}
						onPress={handleAddExpense}
						disabled={amount.length === 0 || category.length === 0}
						className="  mt-6"
					>
						<View
							className={`  px-4 py-3 rounded-lg flex-row justify-center space-x-3  ${
								amount.length > 0 && category.length > 0 ? "bg-blue-600" : "bg-blue-200"
							}  `}
						>
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
