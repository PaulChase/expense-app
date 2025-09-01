import React, { useContext, useState } from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AddIncomeProps } from "../../utils/types";
import ModalSelector from "react-native-modal-selector";

interface AddIncomeModalProps {
	showModal: boolean;
	categories: string[];
	closeModal: () => void;
	addIncome: (income: AddIncomeProps) => void;
}

export default function AddIncomeModal({ showModal, closeModal, categories, addIncome }: AddIncomeModalProps) {
	const [amount, setAmount] = useState("");
	const [category, setCategory] = useState("");

	const handleAddIncome = () => {
		addIncome({ amount, category: category || undefined });
	};

	const handleCloseModal = () => {
		setAmount("");
		setCategory("");
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
					<Text className=" text-lg text-green-600 mb-6 text-center font-semibold">Record Income</Text>

					<TextInput
						value={amount}
						className="px-2 py-3 bg-gray-100 rounded-md border border-gray-200 "
						placeholder={"Amount"}
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
								<Text style={{ fontSize: 16, color: "black" }}>What category is this income from?</Text>
							</View>
						}
						overlayStyle={{ flex: 1, padding: "5%", justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.7)" }}
					>
						<TextInput
							style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 6, color: "gray" }}
							editable={false}
							placeholder="Select category (optional)..."
							value={category}
						/>
					</ModalSelector>

					<TouchableOpacity
						activeOpacity={0.6}
						onPress={handleAddIncome}
						disabled={amount.length === 0}
						className="  mt-6"
					>
						<View
							className={`  px-4 py-3 rounded-lg flex-row justify-center space-x-3  ${
								amount.length > 0 ? "bg-blue-600" : "bg-blue-200"
							}  `}
						>
							<Text className="text-center text-sm text-white font-semibold">Add Income</Text>
						</View>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
}
