import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { DocumentViewerScreen } from '../screens/DocumentViewerScreen';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-primary-600">
                <ActivityIndicator size="large" color="white" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }}
            >
                {isAuthenticated ? (
                    // Authenticated screens
                    <>
                        <Stack.Screen name="Home" component={HomeScreen} />
                        <Stack.Screen
                            name="DocumentViewer"
                            component={DocumentViewerScreen}
                            options={{
                                animation: 'slide_from_bottom',
                            }}
                        />
                    </>
                ) : (
                    // Auth screens
                    <Stack.Screen name="Login" component={LoginScreen} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
