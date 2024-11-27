import React, { useEffect, useState } from 'react';
import { View, Text, Image, Keyboard, SafeAreaView } from 'react-native';
import { Tabs } from 'expo-router';
import { icons } from '../../constants';

interface TabIconProps {
  icon: any;
  color: string;
  name: string;
  focused: boolean;
}

const TabIcon = ({ icon, color, name, focused }: TabIconProps) => {
  return (
    <View className='items-center justify-center gap-2'>
      <Image
        source={icon}
        resizeMode='contain'
        tintColor={color}
        className='w-6 h-6 mt-2'
      />
      <Text className={`${focused ? 'font-pextrabold' : 'font-psemibold'} text-s pt-0`} style={{ color: color }}>
        {name}
      </Text>
    </View>
  );
}

const TabsLayout = () => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  return (
    <SafeAreaView
      style={{ flex: 1 }}
    >
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#FF7043',
          tabBarInactiveTintColor: '#424242',
          tabBarActiveBackgroundColor: '#00796B',
          tabBarInactiveBackgroundColor: '#089889',
          tabBarStyle: {
            height: 70, 
            display: isKeyboardVisible ? 'none' : 'flex', 
            bottom: 0,
          }
        }}
      >
        <Tabs.Screen
          name='index'
          options={{
            title: 'Home',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.home}
                color={color}
                name="Home"
                focused={focused}
              />
            )
          }}
        />
        <Tabs.Screen
          name='grades'
          options={{
            title: 'Grades',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.star}
                color={color}
                name="Grades"
                focused={focused}
              />
            )
          }}
        />
        <Tabs.Screen
          name='templates'
          options={{
            title: 'Templates',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.template}
                color={color}
                name="Templates"
                focused={focused}
              />
            )
          }}
        />
        <Tabs.Screen
          name='stats'
          options={{
            title: 'Stats',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.criterias}
                color={color}
                name="Stats"
                focused={focused}
              />
            )
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

export default TabsLayout;
