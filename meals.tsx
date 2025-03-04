import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/use-theme";
import { useLanguage } from "@/hooks/use-language";
import { useStore } from "@/hooks/store";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { FoodItem, Meal } from "@/types";
import { Plus, X, Utensils, Calendar, ChevronRight, Trash2 } from "lucide-react-native";
import { foodDatabase } from "@/constants/food-database";

// MealCard 컴포넌트
interface MealCardProps {
  meal: Meal;
  onPress: () => void;
  onDelete?: () => void;
}

const MealCard: React.FC<MealCardProps> = ({ meal, onPress, onDelete }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
      <Card>
        <View style={mealCardStyles.header}>
          <View style={mealCardStyles.titleContainer}>
            <Utensils size={18} color={theme.primary} />
            <Text style={[mealCardStyles.title, { color: theme.text }]}>
              {meal.name}
            </Text>
          </View>
          <Text style={[mealCardStyles.time, { color: theme.textSecondary }]}>
            {new Date(meal.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>

        <View style={mealCardStyles.nutritionContainer}>
          <View style={mealCardStyles.nutritionItem}>
            <Text style={[mealCardStyles.nutritionValue, { color: theme.text }]}>
              {meal.calories}
            </Text>
            <Text style={[mealCardStyles.nutritionLabel, { color: theme.textSecondary }]}>
              {t("calories")}
            </Text>
          </View>

          {meal.protein !== undefined && (
            <View style={mealCardStyles.nutritionItem}>
              <Text style={[mealCardStyles.nutritionValue, { color: theme.text }]}>
                {meal.protein}g
              </Text>
              <Text style={[mealCardStyles.nutritionLabel, { color: theme.textSecondary }]}>
                {t("protein")}
              </Text>
            </View>
          )}

          {meal.carbs !== undefined && (
            <View style={mealCardStyles.nutritionItem}>
              <Text style={[mealCardStyles.nutritionValue, { color: theme.text }]}>
                {meal.carbs}g
              </Text>
              <Text style={[mealCardStyles.nutritionLabel, { color: theme.textSecondary }]}>
                {t("carbs")}
              </Text>
            </View>
          )}

          {meal.fat !== undefined && (
            <View style={mealCardStyles.nutritionItem}>
              <Text style={[mealCardStyles.nutritionValue, { color: theme.text }]}>
                {meal.fat}g
              </Text>
              <Text style={[mealCardStyles.nutritionLabel, { color: theme.textSecondary }]}>
                {t("fat")}
              </Text>
            </View>
          )}
        </View>

        <View style={[mealCardStyles.footer, { borderTopColor: theme.border }]}>
          <Text style={[mealCardStyles.itemsText, { color: theme.textSecondary }]}>
            {meal.items.length} {meal.items.length === 1 ? "item" : "items"}
          </Text>
          <View style={mealCardStyles.footerActions}>
            {onDelete && (
              <Pressable
                onPress={onDelete}
                style={mealCardStyles.deleteButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Trash2 size={16} color={theme.error} />
              </Pressable>
            )}
            <ChevronRight size={16} color={theme.textSecondary} />
          </View>
        </View>
      </Card>
    </Pressable>
  );
};

const mealCardStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  time: {
    fontSize: 14,
  },
  nutritionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  nutritionItem: {
    alignItems: "center",
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: "600",
  },
  nutritionLabel: {
    fontSize: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  itemsText: {
    fontSize: 14,
  },
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deleteButton: {
    padding: 4,
  },
});

// FoodSearchInput 컴포넌트
interface FoodSearchInputProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  onSelectFood?: (foodName: string) => void;
}

const FoodSearchInput: React.FC<FoodSearchInputProps> = ({
  value,
  onValueChange,
  placeholder = "Search for a food...",
  onSelectFood,
}) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState(value);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const debounce = setTimeout(() => {
      setIsLoading(true);
      const results = foodDatabase
        .filter((food) => food.name.toLowerCase().includes(searchTerm.toLowerCase().trim()))
        .slice(0, 20);
      setSearchResults(results);
      setShowResults(true);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handleTextChange = (text: string) => {
    setSearchTerm(text);
    onValueChange(text);
  };

  const handleSelectFood = (foodName: string) => {
    console.log("Food selected in FoodSearchInput:", foodName); // 디버깅
    setSearchTerm(foodName);
    onValueChange(foodName);
    setShowResults(false);
    onSelectFood?.(foodName);
    Keyboard.dismiss();
  };

  return (
    <View style={foodSearchStyles.container}>
      <TextInput
        style={[foodSearchStyles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
        value={searchTerm}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        onFocus={() => searchTerm.trim() && setShowResults(true)}
      />
      {isLoading && (
        <View style={foodSearchStyles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.primary} />
        </View>
      )}
      {showResults && searchResults.length > 0 && (
        <View style={[foodSearchStyles.resultsContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <FlatList
            data={searchResults}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[foodSearchStyles.resultItem, { borderBottomColor: theme.border }]}
                onPress={() => handleSelectFood(item.name)}
                activeOpacity={0.7}
              >
                <Text style={[foodSearchStyles.resultText, { color: theme.text }]}>{item.name}</Text>
                <Text style={[foodSearchStyles.resultCalories, { color: theme.textSecondary }]}>
                  {item.caloriesPer100g} kcal/100g
                </Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="always"
            style={foodSearchStyles.resultsList}
          />
        </View>
      )}
    </View>
  );
};

const foodSearchStyles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    zIndex: 1000,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  loadingContainer: {
    position: "absolute",
    right: 12,
    top: 12,
  },
  resultsContainer: {
    borderWidth: 1,
    borderRadius: 8,
    zIndex: 1001,
    maxHeight: 200,
    overflow: "hidden",
    marginTop: 8,
  },
  resultsList: {
    maxHeight: 200,
    flexGrow: 0,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  resultText: {
    fontSize: 16,
  },
  resultCalories: {
    fontSize: 14,
  },
});

// MealsScreen 컴포넌트
export default function MealsScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { meals, addMeal, deleteMeal } = useStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [mealName, setMealName] = useState("");
  const [selectedFoods, setSelectedFoods] = useState<Array<{ id: string; name: string; amount: number }>>([]);
  const [currentFoodName, setCurrentFoodName] = useState("");
  const [currentFoodAmount, setCurrentFoodAmount] = useState("");
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    console.log("Meals state updated:", meals); // 상태 변화 추적
  }, [meals]);

  const calculateNutrition = (foodName: string, amount: number): {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null => {
    try {
      if (!foodName || !amount) return null;

      let food = foodDatabase.find((item) => item.name.toLowerCase() === foodName.toLowerCase());
      if (!food) {
        const normalizedFoodName = foodName.toLowerCase().trim();
        food = foodDatabase.find((item) => item.name.toLowerCase().includes(normalizedFoodName));
      }
      if (!food) return null;

      const ratio = amount / 100;
      return {
        calories: Math.round(food.caloriesPer100g * ratio),
        protein: Math.round(food.proteinPer100g * ratio * 10) / 10,
        carbs: Math.round(food.carbsPer100g * ratio * 10) / 10,
        fat: Math.round(food.fatPer100g * ratio * 10) / 10,
      };
    } catch (error) {
      console.error("Error calculating nutrition:", error);
      return null;
    }
  };

  const handleAddFood = () => {
    if (currentFoodName.trim() === "") {
      Alert.alert("Error", "Please enter a food name");
      return;
    }
    if (currentFoodAmount.trim() === "") {
      Alert.alert("Error", "Please enter an amount");
      return;
    }

    const amount = parseInt(currentFoodAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Please enter a valid amount greater than 0");
      return;
    }

    const newFood = {
      id: Date.now().toString(),
      name: currentFoodName,
      amount,
    };
    console.log("Adding food:", newFood); // 디버깅
    setSelectedFoods((prev) => [...prev, newFood]);
    setCurrentFoodName("");
    setCurrentFoodAmount("");
    setShowFoodModal(false);
  };

  const handleRemoveFood = (id: string) => {
    setSelectedFoods(selectedFoods.filter((food) => food.id !== id));
  };

  const handleSaveMeal = () => {
    if (!mealName.trim()) {
      Alert.alert("Error", "Please enter a meal name");
      return;
    }
    if (!selectedFoods.length) {
      Alert.alert("Error", "Please add at least one food item");
      return;
    }

    try {
      const foodItems: FoodItem[] = [];
      let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;

      selectedFoods.forEach((food) => {
        const nutrition = calculateNutrition(food.name, food.amount) || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        };
        totalCalories += nutrition.calories;
        totalProtein += nutrition.protein;
        totalCarbs += nutrition.carbs;
        totalFat += nutrition.fat;
        foodItems.push({ id: food.id, name: food.name, amount: food.amount, ...nutrition });
      });

      const mealDate = new Date(selectedDate);
      const now = new Date();
      mealDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

      const newMeal = {
        name: mealName,
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
        items: foodItems,
      };

      console.log("Saving meal:", newMeal); // 디버깅
      addMeal(newMeal);
      console.log("Meals after save:", meals); // 상태 확인

      setMealName("");
      setSelectedFoods([]);
      setModalVisible(false);
    } catch (error) {
      console.error("Error saving meal:", error);
      Alert.alert("Error", "Failed to save meal.");
    }
  };

  const handleSelectFood = (foodName: string) => {
    console.log("Selected food from FoodSearchInput:", foodName); // 디버깅
    setCurrentFoodName(foodName);
  };

  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  const isSelectedDate = (date: Date) => date.toDateString() === selectedDate.toDateString();
  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();
  const formatDay = (date: Date) => date.getDate().toString();
  const formatWeekday = (date: Date) => date.toLocaleDateString(undefined, { weekday: "short" });

  const filteredMeals = meals.filter(
    (meal) => new Date(meal.date).toDateString() === selectedDate.toDateString()
  );

  const dismissKeyboard = () => Keyboard.dismiss();

  const renderNutritionPreview = () => {
    if (!currentFoodName || !currentFoodAmount) {
      return (
        <Text style={[styles.nutritionNotFound, { color: theme.textSecondary }]}>
          Enter a valid food name and amount to see nutrition info
        </Text>
      );
    }

    const amount = parseInt(currentFoodAmount);
    if (isNaN(amount) || amount <= 0) {
      return (
        <Text style={[styles.nutritionNotFound, { color: theme.textSecondary }]}>
          Enter a valid amount in grams
        </Text>
      );
    }

    const nutrition = calculateNutrition(currentFoodName, amount);
    if (!nutrition) {
      return (
        <Text style={[styles.nutritionNotFound, { color: theme.textSecondary }]}>
          Nutrition information not found for this food
        </Text>
      );
    }

    return (
      <View style={styles.nutritionValues}>
        <Text style={[styles.nutritionValue, { color: theme.text }]}>
          Calories: {nutrition.calories} kcal
        </Text>
        <Text style={[styles.nutritionValue, { color: theme.text }]}>
          Protein: {nutrition.protein}g
        </Text>
        <Text style={[styles.nutritionValue, { color: theme.text }]}>
          Carbs: {nutrition.carbs}g
        </Text>
        <Text style={[styles.nutritionValue, { color: theme.text }]}>
          Fat: {nutrition.fat}g
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>{t("meals")}</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={() => {
              console.log("Add Meal button clicked"); // 디버깅
              setModalVisible(true);
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Card>
          <View style={styles.calendarContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarScrollContent}>
              <View style={styles.calendarDays}>
                {calendarDays.map((date, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.calendarDay,
                      isSelectedDate(date) && { backgroundColor: theme.primary },
                      isToday(date) && { borderColor: theme.primary, borderWidth: 1 },
                    ]}
                    onPress={() => setSelectedDate(date)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.calendarWeekday,
                        { color: isSelectedDate(date) ? "#FFFFFF" : theme.textSecondary },
                      ]}
                    >
                      {formatWeekday(date)}
                    </Text>
                    <Text
                      style={[
                        styles.calendarDate,
                        { color: isSelectedDate(date) ? "#FFFFFF" : theme.text },
                      ]}
                    >
                      {formatDay(date)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </Card>

        {filteredMeals.length > 0 ? (
          filteredMeals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onPress={() => console.log("Meal clicked:", meal.name)} // 디버깅
              onDelete={() => deleteMeal(meal.id)}
            />
          ))
        ) : (
          <Card>
            <View style={styles.emptyContainer}>
              <Utensils size={40} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No meals added for {selectedDate.toLocaleDateString()}
              </Text>
              <Button
                title={t("addMeal")}
                onPress={() => setModalVisible(true)}
                icon={<Plus size={16} color="#FFFFFF" />}
                style={styles.emptyButton}
              />
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Add Meal Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>{t("addMeal")}</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={24} color={theme.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>{t("mealName")}</Text>
                  <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                    value={mealName}
                    onChangeText={setMealName}
                    placeholder="Enter meal name"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>

                <View style={styles.foodsContainer}>
                  <View style={styles.foodsHeader}>
                    <Text style={[styles.foodsTitle, { color: theme.text }]}>Foods</Text>
                    <Button
                      title={t("addFood")}
                      onPress={() => setShowFoodModal(true)}
                      variant="outline"
                      size="small"
                      icon={<Plus size={16} color={theme.primary} />}
                    />
                  </View>

                  {selectedFoods.length > 0 ? (
                    selectedFoods.map((food) => (
                      <View
                        key={food.id}
                        style={[styles.foodItem, { backgroundColor: theme.background, borderColor: theme.border }]}
                      >
                        <View style={styles.foodInfo}>
                          <Text style={[styles.foodName, { color: theme.text }]}>{food.name}</Text>
                          <Text style={[styles.foodAmount, { color: theme.textSecondary }]}>{food.amount}g</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleRemoveFood(food.id)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <X size={16} color={theme.error} />
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <Text style={[styles.emptyFoods, { color: theme.textSecondary }]}>No foods added yet</Text>
                  )}
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <Button title={t("cancel")} onPress={() => setModalVisible(false)} variant="outline" style={styles.footerButton} />
                <Button
                  title={t("save")}
                  onPress={handleSaveMeal}
                  style={styles.footerButton}
                  disabled={mealName.trim() === "" || selectedFoods.length === 0}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Food Modal */}
      <Modal animationType="slide" transparent={true} visible={showFoodModal} onRequestClose={() => setShowFoodModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{t("addFood")}</Text>
              <TouchableOpacity
                onPress={() => setShowFoodModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false}>
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>{t("foodName")}</Text>
                <FoodSearchInput
                  value={currentFoodName}
                  onValueChange={setCurrentFoodName}
                  placeholder="Enter food name or search"
                  onSelectFood={handleSelectFood}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>{t("amount")} (g)</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                  value={currentFoodAmount}
                  onChangeText={setCurrentFoodAmount}
                  placeholder="Enter amount in grams"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              {(currentFoodName || currentFoodAmount) && (
                <View style={styles.nutritionPreview}>
                  <Text style={[styles.nutritionPreviewTitle, { color: theme.text }]}>Nutrition Preview:</Text>
                  {renderNutritionPreview()}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button title={t("cancel")} onPress={() => setShowFoodModal(false)} variant="outline" style={styles.footerButton} />
              <Button
                title={t("add")}
                onPress={handleAddFood}
                style={styles.footerButton}
                disabled={currentFoodName.trim() === "" || currentFoodAmount.trim() === ""}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 100 : 80,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  calendarContainer: {
    marginBottom: 16,
  },
  calendarScrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  calendarDays: {
    flexDirection: "row",
    alignItems: "center",
  },
  calendarDay: {
    width: 60,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    borderRadius: 12,
  },
  calendarWeekday: {
    fontSize: 12,
    marginBottom: 4,
  },
  calendarDate: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    marginVertical: 16,
    textAlign: "center",
  },
  emptyButton: {
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  modalScroll: {
    maxHeight: "70%",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  foodsContainer: {
    marginTop: 16,
  },
  foodsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  foodsTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  foodItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  foodAmount: {
    fontSize: 14,
  },
  emptyFoods: {
    textAlign: "center",
    padding: 16,
    fontStyle: "italic",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  nutritionPreview: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  nutritionPreviewTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  nutritionValues: {
    gap: 4,
  },
  nutritionValue: {
    fontSize: 14,
  },
  nutritionNotFound: {
    fontSize: 14,
    fontStyle: "italic",
  },
});
