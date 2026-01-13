import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import { TabsNavigator } from "./TabsNavigator";
import { MeasureDetailScreen } from "../screens/MeasureDetailScreen";
import { colors } from "../ui";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTitleStyle: { fontWeight: "900" },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="MeasureDetail" component={MeasureDetailScreen} options={{ title: "Мера поддержки" }} />
    </Stack.Navigator>
  );
}
