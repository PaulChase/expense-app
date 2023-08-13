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
								return <AntDesign name="tags" size={24} color={color} />;
							case "Calendar":
								return <Entypo name="calendar" size={24} color={color} />;
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
						height: 50,
						// backgroundColor: colorScheme === "dark" ? "black" : "#bfbfbf",
						borderTopWidth: 1,
						borderTopColor: "gray",
					},
					headerShown: true,
					tabBarShowLabel: false,

					headerTintColor: "blue",
					// headerRight: () => <DarkModeSwitch />,
				})}
			>
				<Tab.Screen name="Home" component={HomeScreen} />
				<Tab.Screen name="Bills" component={CategoriesScreen} />
				<Tab.Screen name="Calendar" component={CalendarScreen} />
			</Tab.Navigator>
		</NavigationContainer>
	);
}
