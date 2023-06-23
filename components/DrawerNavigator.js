import { React, useContext } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { UserContext } from "../services/UserContext";
import HomeScreen from "../screens/HomeScreen";
import StockScreen from "../screens/StockScreen";
import WaiterScreen from "../screens/WaiterScreen";
import ProductsList from "../screens/ProductsList";
import SelectTables from "../screens/SelectTables";
import StockPrediction from "../screens/StockPrediction";
import Menu from "./Menu";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const { user } = useContext(UserContext);

  return (
    <Drawer.Navigator
      useLegacyImplementation
      drawerContent={(props) => <Menu {...props} />}
    >
      {user?.isManager ? (
        <>
          <Drawer.Screen name="Home" component={HomeScreen} />
          <Drawer.Screen name="Stock" component={StockScreen} />
          <Drawer.Screen name="Waiters" component={WaiterScreen} />
          <Drawer.Screen name="Products" component={ProductsList} />
          <Drawer.Screen name="Stock Prediction" component={StockPrediction} />
        </>
      ) : (
        <>
          <Drawer.Screen name="Home" component={HomeScreen} />
          <Drawer.Screen name="SelectTables" component={SelectTables} />
        </>
      )}
    </Drawer.Navigator>
  );
}
