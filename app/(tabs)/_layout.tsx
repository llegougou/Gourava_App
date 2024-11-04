import { View, Text, Image } from 'react-native'
import { Tabs, Redirect } from 'expo-router'

import { icons } from '../../constants'

interface TabIconProps {
  icon: any;
  color: string;
  name: string;
  focused: boolean;
}

const TabIcon = ({icon, color, name, focused}: TabIconProps) =>{
  return(
    <View className='items-center justify-center gap-2'>
      <Image
        source={icon}
        resizeMode='contain'
        tintColor={color}
        className='w-6 h-6 mt-2'
      />
      <Text className={`${focused ? 'font-pextrabold':'font-psemibold'} text-s pt-0`} style={{color:color}}>
        {name}
      </Text>
    </View>
  )
}

const TabsLayout = () => {
  return (
    <>
    <Tabs
      screenOptions={{
        tabBarShowLabel:false,
        tabBarActiveTintColor:'#FF7043',
        tabBarInactiveTintColor:'#424242',
        tabBarActiveBackgroundColor:'#00796B',
        tabBarInactiveBackgroundColor:'#089889',
        tabBarStyle:{
          height:'7%',
        }
      }}
    >
      <Tabs.Screen 
        name='index'
        options={{
          title:'Home',
          headerShown:false,
          tabBarIcon:({color, focused})=>(
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
          title:'Grades',
          headerShown:false,
          tabBarIcon:({color, focused})=>(
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
        name='filters'
        options={{
          title:'Filters',
          headerShown:false,
          tabBarIcon:({color, focused})=>(
            <TabIcon
              icon={icons.criterias}
              color={color}
              name="Filters"
              focused={focused}
            />
          )
        }}
        />
        <Tabs.Screen 
        name='profile'
        options={{
          title:'Profile',
          headerShown:false,
          tabBarIcon:({color, focused})=>(
            <TabIcon
              icon={icons.profile}
              color={color}
              name="Profile"
              focused={focused}
            />
          )
        }}
        />
    </Tabs>
    </>
  )
}

export default TabsLayout