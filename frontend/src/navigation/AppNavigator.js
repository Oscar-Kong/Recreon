import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={TabNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator; 