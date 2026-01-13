import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { StoreProvider } from "./src/store/store";
import { colors } from "./src/ui";
import { StatusBar } from "expo-status-bar";

export default function App() {
  return (
    <StoreProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </StoreProvider>
  );
}
