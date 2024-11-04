import { StatusBar } from "expo-status-bar";
import { SafeAreaView, Text } from 'react-native'
import { Link } from "expo-router";

export default function App() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background">
      <StatusBar style="dark"/>
      <Text className="text-3xl font-pblack">THIS IS HOME NOW BBYGURL</Text>
    </SafeAreaView>
  );
}