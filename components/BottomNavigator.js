import { React, useContext } from "react";
import { UserContext } from "../services/UserContext";
import HomeScreen from "../screens/HomeScreen";
import StockScreen from "../screens/StockScreen";
import ProductsList from "../screens/ProductsList";
import SelectTables from "../screens/SelectTables";
import StockPrediction from "../screens/StockPrediction";
import ChartScreen from "../screens/ChartScreen";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


const Tab = createBottomTabNavigator();

export default function BottomNavigator() {
  const { userData: {user}}  = useContext(UserContext);

  return (
        user?.isManager ? 
        <Tab.Navigator>
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarLabel: 'Home',
              tabBarIcon: ({ color, size }) => {
                return <Icon name="home" size={size} color={color} />;
              },
            }}
          />
          <Tab.Screen
            name="Stock"
            component={StockScreen}
            options={{
              tabBarLabel: 'Stock',
              tabBarIcon: ({ color, size }) => {
                return <Icon name="package-variant" size={size} color={color} />;
              },
            }}
          />
          <Tab.Screen
            name="Products"
            component={ProductsList}
            options={{
              tabBarLabel: 'Products',
              tabBarIcon: ({ color, size }) => {
                return <Icon name="food" size={size} color={color} />;
              },
            }}
          />
          <Tab.Screen
            name="Prediction"
            component={StockPrediction}
            options={{
              tabBarLabel: 'Prediction',
              tabBarIcon: ({ color, size }) => {
                return <Icon name="application-variable-outline" size={size} color={color} />;
              },
            }}
          />
          <Tab.Screen
            name="Charts"
            component={ChartScreen}
            options={{
              tabBarLabel: 'Charts',
              tabBarIcon: ({ color, size }) => {
                return <Icon name="chart-areaspline" size={size} color={color} />;
              },
            }}
          />
        </Tab.Navigator> 
        : 
        <Tab.Navigator>
          <Tab.Screen
              name="Home"
              component={HomeScreen}
              options={{
                tabBarLabel: 'Home',
                tabBarIcon: ({ color, size }) => {
                  return <Icon name="home" size={size} color={color} />;
                },
              }}
            />
          <Tab.Screen
            name="Tables"
            component={SelectTables}
            options={{
              tabBarLabel: 'Tables',
              tabBarIcon: ({ color, size }) => {
                return <Icon name="clipboard-list-outline" size={size} color={color} />;
              },
            }}
          />
        </Tab.Navigator>  
  )
}

