import { StyleSheet, Text, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import {
	Feather,
	Ionicons,
	FontAwesome5,
	Entypo,
	MaterialIcons,
	MaterialCommunityIcons,
	AntDesign,
} from "@expo/vector-icons";
import HomeScreen from "./app/Screens/HomeScreen";
import CategoriesScreen from "./app/Screens/CategoriesScreen";
import CalendarScreen from "./app/Screens/CalendarScreen";
import Toast from "react-native-toast-message";
import { useEffect, useState } from "react";
import OnboardingScreen from "./app/Screens/OnboardingScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Tab = createBottomTabNavigator();

export default function App() {
	const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

	useEffect(() => {
		async function checkOnboarding() {
			try {
				const onboardingShown = await AsyncStorage.getItem("onboardingShown");
				if (!onboardingShown) {
					setShowOnboarding(true);
				} else {
					setShowOnboarding(false);
				}
			} catch (error) {
				alert("Error checking onboarding:");
			}
		}

		checkOnboarding();
	}, []);

	const toggleOnboardingScreen = () => setShowOnboarding(false);

	if (showOnboarding == null) {
		return null;
	}

	if (showOnboarding) {
		return <OnboardingScreen toggleOnboardingScreen={toggleOnboardingScreen} />;
	}

	return (
		<>
			<NavigationContainer>
				<Tab.Navigator
					screenOptions={({ route }) => ({
						tabBarIcon: ({ focused, color, size }) => {
							switch (route.name) {
								case "Home":
									return <Ionicons name="home" size={24} color={color} />;
								case "Bills":
									return <AntDesign name="tags" size={24} color={color} />;
								case "Calendar":
									return <Entypo name="calendar" size={24} color={color} />;
							}
						},
						tabBarActiveTintColor: "blue",
						tabBarLabelStyle: {
							fontSize: 14,
							paddingBottom: 5,
						},
						tabBarStyle: {
							height: 50,
							borderTopWidth: 1,
							borderTopColor: "gray",
							borderTopLeftRadius: 20,
							borderTopRightRadius: 20,
						},
						headerShown: true,
						tabBarShowLabel: false,

						headerTintColor: "blue",
					})}
				>
					<Tab.Screen name="Home" component={HomeScreen} />
					<Tab.Screen name="Bills" component={CategoriesScreen} />
					<Tab.Screen name="Calendar" component={CalendarScreen} />
				</Tab.Navigator>
			</NavigationContainer>
			<Toast />
		</>
	);
}
