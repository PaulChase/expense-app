import { StyleSheet, Text, View } from "react-native";
import Home from "./app/HomeScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { Feather, Ionicons, FontAwesome5, Entypo, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

import HomeScreen from "./app/HomeScreen";
import CategoriesScreen from "./app/CategoriesScreen";

const Tab = createBottomTabNavigator();

export default function App() {
	return (
		<NavigationContainer>
			<Tab.Navigator
				screenOptions={({ route }) => ({
					tabBarIcon: ({ focused, color, size }) => {
						switch (route.name) {
							case "Home":
								return <Ionicons name="home" size={24} color={color} />;
							case "Bills":
								return <FontAwesome5 name="money-check-alt" size={24} color={color} />;
						}
					},
					tabBarActiveTintColor: "blue",
					// tabBarInactiveTintColor: "blue",
					tabBarLabelStyle: {
						fontSize: 14,
						paddingBottom: 5,
					},
					tabBarStyle: {
						paddingVertical: 10,
						height: 62,
						// backgroundColor: colorScheme === "dark" ? "black" : "#bfbfbf",
						borderTopWidth: 2,
						borderTopColor: "gray",
					},
					headerShown: true,

					// headerTintColor: headerTextColor,
					// headerRight: () => <DarkModeSwitch />,
				})}
			>
				<Tab.Screen name="Home" component={HomeScreen} />
				<Tab.Screen name="Bills" component={CategoriesScreen} />
			</Tab.Navigator>
		</NavigationContainer>
	);
}
