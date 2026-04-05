import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Instruction } from './models';

export type TabParamList = {
  Início: undefined;
  Glossário: undefined;
  Favoritos: undefined;
  Perfil: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  Login: undefined;
  Register: undefined;
  RecipeDetails: { id: number };
  CategoryRecipes: { categoryName: string };
  GuidedPrep: { instructions: Instruction[]; recipeId: number };
  History: undefined;
  CategoryScreen: undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export type RootRouteProp<RouteName extends keyof RootStackParamList> = RouteProp<
  RootStackParamList,
  RouteName
>;