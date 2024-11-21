import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import React, { useState, useMemo } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { initializeDatabase, addItem, getItems, getTagsUsageCount, getCriteriaUsageCount, getTemplateById } from "../../utils/database";
import ItemInfoCard from '../../components/ItemInfoCard';
import ItemFormModal from '../../components/ItemFormModal';
import { useNavigation } from "@react-navigation/native";

import { icons } from '../../constants';

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState(["", "", ""]);
  const [criteria, setCriteria] = useState(["", "", ""]);
  const [ratings, setRatings] = useState(["", "", ""]);
  const [randomItems, setRandomItems] = useState([]);
  const [tagsCounts, setTagsCounts] = useState([]);
  const [criteriasCounts, setCriteriasCounts] = useState([]);

  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      loadItems();
      loadCounts();
    }, [])
  );

  const loadItems = async () => {
    await initializeDatabase();
    const fetchedRandomItems = await getItems(2);
    setRandomItems(fetchedRandomItems);
  };

  const loadCounts = async () => {
    const tags = await getTagsUsageCount(4);
    setTagsCounts(tags);
    const criterias = await getCriteriaUsageCount(4);
    setCriteriasCounts(criterias);
  }

  const handleSave = async (newTitle, newTags, newCriteria, ratings) => {
    try {
      const filteredCriteria = newCriteria.map((name, index) => ({
        name,
        rating: ratings[index].trim() === "" ? undefined : ratings[index],
      })).filter(criteria => criteria.rating !== undefined);

      const filteredTags = newTags
        .filter(tag => tag.trim() !== "")
        .map(tag => ({ name: tag }));
      
        
      setModalVisible(false);
      await addItem(newTitle, filteredTags, filteredCriteria);

      loadItems();

    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={{ flex: 1, margin: 10 }}>
      <ItemInfoCard
        id={item.id}
        title={item.title}
        tags={item.tags}
        criteriaRatings={item.criteriaRatings}
        showButtons={false}
      />
    </View>
  );

  const renderStats = ({item}) => (
    <View className="flex-row justify-between px-4 py-2">
      <Text className="text-neutral text-lg font-pmedium">
        {item.name}
      </Text>
    </View>
  )

  const handleGradesPress = () => {
    navigation.navigate('grades');
  }

  const handleFiltersPress = () => {
    navigation.navigate('filters');
  }

  return (
    <SafeAreaView className="flex-1 bg-background pt-24">
      <StatusBar style="light" />
      <Text className="text-4xl text-primaryLight font-pextrabold ml-4">WELCOME TO</Text>
      <Text className="text-7xl text-primary font-pextrabold py-2 ml-6">GOURAVA!</Text>
      <View className="items-end">
        <Text className="text-2xl  text-secondaryLight font-psemibold mr-6">SAVOR EVERY MOMENT,</Text>
        <Text className="text-3xl text-secondary mb-4 font-psemibold mr-4">RATE EVERY TASTE!</Text>
      </View>

      {/* Add Button */}
      <TouchableOpacity
        className="bg-primary rounded-xl px-6 py-4 mx-4 mb-2 border border-neutral"
        onPress={() => setModalVisible(true)}
      >
        <Text className="text-xl font-bold text-background text-center">
          GRADE SOMETHING NEW
        </Text>
      </TouchableOpacity>

      {/* Random Items */}
      <View className="bg-secondaryLight border-y border-neutral pb-3 my-3">
        <View className="bg-secondary flex-row items-center justify-between p-3 border-b">
          <Text className="text-neutral text-2xl font-psemibold ml-3 pt-3 px-3 pb-2 mr-1">Random Graded Items</Text>
          <TouchableOpacity onPress={handleGradesPress} className="flex-row justify-between border bg-neutral items-center rounded mx-3">
            <View className="flex-row items-center p-3 mr-1 ">
              <Text className="text-accent text-base font-pmedium my-1">See more</Text>
              <Image
                source={icons.rightArrow}
                resizeMode="contain"
                style={{
                  tintColor: '#FFD700',
                  marginLeft: 4,
                  width: 18,
                  height: 18,
                }}
              />
            </View>
          </TouchableOpacity>
        </View>
        <FlatList
          data={randomItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          numColumns={2}
        />
      </View>

      {/* Random Stats */}
      <View className="bg-secondaryLight border-y border-neutral pb-3 my-3">
        <View className="bg-secondary flex-row items-center justify-between p-3 border-b">
          <Text className="text-neutral text-2xl font-psemibold ml-3 pt-3 px-3 pb-2 mr-1">Random Stats</Text>
          <TouchableOpacity onPress={handleFiltersPress} className="flex-row justify-between border bg-neutral items-center rounded mx-3">
            <View className="flex-row items-center p-3 mr-1 ">
              <Text className="text-accent text-base font-pmedium my-1">See more</Text>
              <Image
                source={icons.rightArrow}
                resizeMode="contain"
                style={{
                  tintColor: '#FFD700',
                  marginLeft: 4,
                  width: 18,
                  height: 18,
                }}
              />
            </View>
          </TouchableOpacity>
        </View>
        <View className="max-h-52 flex-row mt-2 border-b border-neutral mx-1">
          <View className="flex-1 border-x border-neutral">
            <Text className="bg-backgroundAnti border-y border-neutral text-center font-pbold p-1 pt-2 ">
              Tags
            </Text>
            <FlatList
              data={tagsCounts}
              renderItem={renderStats}
              keyExtractor={(item) => item.name}
              showsVerticalScrollIndicator={false}
            />
          </View>
          <View className="flex-1 border-r border-neutral">
            <Text className="bg-backgroundAnti border-y border-neutral text-center font-pbold p-1 pt-2">
              Criterias
            </Text>
            <FlatList
              data={criteriasCounts}
              renderItem={renderStats}
              keyExtractor={(item) => item.name}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </View>


      {/* Adding Modal */}
      <ItemFormModal
        typeOfModal="create"
        title={title}
        tags={tags.map(tag => ({ name: tag }))}
        criteria={criteria.map((name, index) => ({ name, rating: ratings[index] }))}
        isVisible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSave={handleSave}
      />

    </SafeAreaView>
  );
}