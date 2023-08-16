import { Image, ImageBackground, Text, TextInput, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import Onboarding from "react-native-onboarding-swiper";
import { Entypo } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface CustomImageProps {
	imgSrc: (source: string) => any;
}

interface OnboardingScreenProps {
	toggleOnboardingScreen: () => void;
}

const CustomImage = (props: CustomImageProps) => {
	return (
		<View>
			<ImageBackground source={props.imgSrc} resizeMode="contain">
				<View className=" h-96 w-96"></View>
			</ImageBackground>
		</View>
	);
};

const NextBtn = ({ ...props }) => (
	<TouchableOpacity {...props} className=" pr-4">
		<Entypo name="chevron-with-circle-right" size={30} color="black" />
	</TouchableOpacity>
);

const OnboardingScreen = ({ toggleOnboardingScreen }: OnboardingScreenProps) => {
	const AddBalance = () => {
		const [balance, setBalance] = useState("");

		const handleAddBalance = async () => {
			await AsyncStorage.setItem("balance", balance);
			await AsyncStorage.setItem("onboardingShown", "true");
			toggleOnboardingScreen();
		};

		return (
			<View className="">
				<TextInput
					value={balance}
					className="px-2 py-3 bg-gray-100 rounded-md border border-gray-200  w-72"
					placeholder={"enter balance..."}
					onChangeText={setBalance}
					keyboardType="phone-pad"
				/>

				<TouchableOpacity
					activeOpacity={0.6}
					onPress={handleAddBalance}
					disabled={balance.length === 0}
					className="  mt-6"
				>
					<View
						className={`  px-4 py-3 rounded-lg flex-row justify-center space-x-3  ${
							balance.length > 0 ? "bg-blue-600" : "bg-blue-200"
						}  `}
					>
						<Text className="text-center  text-white font-semibold">Add Balance</Text>
					</View>
				</TouchableOpacity>
			</View>
		);
	};
	return (
		<Onboarding
			showSkip={false}
			showDone={false}
			NextButtonComponent={NextBtn}
			pages={[
				{
					backgroundColor: "rgba(230, 255, 242, 0.2)",
					image: <CustomImage imgSrc={require("../../assets/analysis.png")} />,
					title: "Manage your Finance",
				},
				{
					backgroundColor: "#e6f9ff",
					image: <CustomImage imgSrc={require("../../assets/daily.png")} />,
					title: "Record your daily expenses",
				},
				{
					backgroundColor: "rgba(230, 255, 242, 0.2)",
					image: <CustomImage imgSrc={require("../../assets/Categorize.png")} />,
					title: "Track where your money goes to optimize your budget effectively",
				},
				{
					backgroundColor: "white",
					image: <AddBalance />,
					title: "How much do you currently have?",
				},
			]}
		/>
	);
};

export default OnboardingScreen;
