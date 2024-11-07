import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  FlatList,
  Image,
} from "react-native";
import React, { useState, useEffect, useMemo } from "react";
import { initializeDatabase, addItem, getItems } from "../../utils/database";
import ItemInfoCard from '../../components/ItemInfoCard';
import { Link } from "expo-router";

import { icons } from '../../constants';

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState(["", "", ""]);
  const [criteria, setCriteria] = useState(["", "", ""]);
  const [ratings, setRatings] = useState(["", "", ""]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Initialize database and fetch items on load
    const loadItems = async () => {
      await initializeDatabase();
      const fetchedItems = await getItems(0); // Fetch all items
      setItems(fetchedItems);
    };

    loadItems();
    randomItems;
  }, []);

  const validateRatings = () => {
    return criteria.map((crit, index) => {
      if (crit.trim()) {
        const normalizedRating = ratings[index].replace(',', '.');
        const parsedRating = parseFloat(normalizedRating);
        return (
          !isNaN(parsedRating) &&
          parsedRating >= 0 &&
          parsedRating <= 5 &&
          (parsedRating * 2) % 1 === 0
        );
      }
      return true;
    }).every(Boolean);
  };

  const handleSave = async () => {
    const adjustedRatings = ratings.map((rating) =>
      rating.trim() === "" ? "0" : rating
    );

    if (!title || !tags.some((tag) => tag)) {
      Alert.alert("Error", "Please provide a title and at least one tag.");
      return;
    }

    if (!validateRatings()) {
      Alert.alert(
        "Error",
        "Please enter valid ratings between 0 and 5 in increments of 0.5 for filled criteria."
      );
      return;
    }

    const newItem = {
      title,
      tags: tags.filter((tag) => tag),
      criteriaRatings: criteria.map((crit, index) => ({
        name: crit,
        rating: parseFloat(adjustedRatings[index].replace(",", ".")) || 0,
      })),
    };

    try {
      // Add new item to database
      await addItem(newItem.title, newItem.tags, newItem.criteriaRatings);
      const updatedItems = await getItems(0); // Fetch all items after adding
      setItems(updatedItems);
      resetForm();
      setModalVisible(false);
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setTags(["", "", ""]);
    setCriteria(["", "", ""]);
    setRatings(["", "", ""]);
  };

  const renderItem = ({ item }) => (
    <View style={{ flex: 1, margin: 10 }}>
      <ItemInfoCard
        id={item.id}
        title={item.title}
        tags={item.tags}
        criteriaRatings={item.criteriaRatings}
        showButtons={false}
        onDelete={() => handleDeleteItem(item.id)}
      />
    </View>
  );

  const randomItems = useMemo(() => {
    if (items.length <= 2) return items;
    const shuffledItems = [...items].sort(() => Math.random() - 0.5);
    return shuffledItems.slice(0, 2);
  }, [items]);

  const handleDeleteItem = async (id) => {
    try {
      await deleteItem(id); // Delete item from database
      const updatedItems = await getItems(0); // Fetch updated list
      setItems(updatedItems);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background pt-28">
      <StatusBar style="dark" />
      <Text className="text-4xl text-primaryLight font-pextrabold ml-4">WELCOME TO</Text>
      <Text className="text-8xl text-primary font-pextrabold py-2 ml-6">GOURAVA!</Text>
      <View className="items-end">
        <Text className="text-2xl  text-secondaryLight font-psemibold mr-6">SAVOR EVERY MOMENT,</Text>
        <Text className="text-3xl text-secondary mb-6 font-psemibold mr-4">RATE EVERY TASTE!</Text>
      </View>

      <TouchableOpacity
        className="bg-primary rounded-xl px-6 py-4 mx-4 mb-4 border border-neutral"
        onPress={() => setModalVisible(true)}
      >
        <Text className="text-xl font-bold text-secondaryLight text-center">
          GRADE SOMETHING NEW
        </Text>
      </TouchableOpacity>

      <View className="bg-secondaryLight border-y border-neutral py-3 my-3">
        <View className="flex-row justify-between items-center">
          <Text className="text-neutral text-lg font-pmedium ml-3 pt-3 px-3 pb-2 border mr-1 rounded border-neutral">Random Graded Items</Text>
          <Link href="/grades" className="flex-row items-center p-3 mr-1 ">
            <Text className="text-neutral text-base font-pmedium m-3">See more</Text>
            <Image
              source={icons.rightArrow}
              resizeMode="contain"
              style={{ tintColor: '#424242', marginLeft:35 }}
              className="mr-3"
            />
          </Link>
        </View>
        <FlatList
          data={randomItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          numColumns={2}
        />
      </View>

      <View className="bg-secondaryLight border-y border-neutral py-3 my-3">
        <View className="flex-row justify-between items-center">
          <Text className="text-neutral text-lg font-pmedium ml-3 pt-3 px-3 pb-2 border mr-1 rounded border-neutral">Stats</Text>
          <Link href="/filters" className="flex-row items-center p-3 mr-1 ">
            <Text className="text-neutral text-base font-pmedium m-3">See more</Text>
            <Image
              source={icons.rightArrow}
              resizeMode="contain"
              style={{ tintColor: '#424242', marginLeft:35 }}
              className="mr-3"
            />
          </Link>
        </View>
        <FlatList
          data={randomItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          numColumns={2}
        />
      </View>

      <Modal animationType="slide" transparent={false} visible={modalVisible}>
        <View className="flex-1 justify-center p-6 bg-backgroundAnti">
          <Text className="text-2xl font-pextrabold mb-4 self-center">
            New Tasting
          </Text>
          <Text className="font-pbold mb-2 mx-5 text-primary">Title</Text>
          <TextInput
            placeholder="Title"
            placeholderTextColor="#424242"
            value={title}
            onChangeText={setTitle}
            className="text-secondaryLight border border-neutral py-2 px-4 mb-4 rounded bg-background font-psemibold"
          />
          <Text className="font-pbold mb-2 mx-5 text-primary">Tags</Text>

          <TextInput
            placeholder="Tag 1"
            placeholderTextColor="#424242"
            value={tags[0]}
            onChangeText={(text) => {
              const newTags = [...tags];
              newTags[0] = text;
              setTags(newTags);
            }}
            className="text-secondaryLight border border-neutral py-2 px-4 mb-2 rounded bg-background font-psemibold"
          />

          {tags[0] ? (
            <TextInput
              placeholder="Tag 2"
              placeholderTextColor="#424242"
              value={tags[1]}
              onChangeText={(text) => {
                const newTags = [...tags];
                newTags[1] = text;
                setTags(newTags);
              }}
              className="text-secondaryLight border border-neutral py-2 px-4 mb-2 rounded bg-background font-psemibold"
            />
          ) : null}

          {tags[1] ? (
            <TextInput
              placeholder="Tag 3"
              placeholderTextColor="#424242"
              value={tags[2]}
              onChangeText={(text) => {
                const newTags = [...tags];
                newTags[2] = text;
                setTags(newTags);
              }}
              className="text-secondaryLight border border-neutral py-2 px-4 mb-4 rounded bg-background font-psemibold"
            />
          ) : null}

<View className="flex-row justify-between">
            <Text className="font-pbold mb-2 mx-5 text-primary">Criterias</Text>
            <Text className="font-pbold mb-2 mx-7 text-primary">Rating</Text>
          </View>
          <View className="flex-row items-center mb-2">
            <TextInput
              placeholder="Criteria 1"
              placeholderTextColor="#424242"
              value={criteria[0]}
              onChangeText={(text) => {
                const newCriteria = [...criteria];
                newCriteria[0] = text;
                setCriteria(newCriteria);
              }}
              className="text-secondaryLight border border-neutral py-2 px-4 mb-2 rounded bg-background font-psemibold flex-1 mr-2 align"
            />
            <TextInput
              placeholder="(0-5)"
              placeholderTextColor="#424242"
              value={ratings[0]}
              keyboardType="numeric"
              onChangeText={(text) => {
                const newRatings = [...ratings];
                newRatings[0] = text;
                setRatings(newRatings);
              }}
              className="text-secondaryLight border border-neutral py-2 px-4 mb-2 rounded bg-background font-psemibold w-24"
            />
          </View>

          {criteria[0] ? (
            <View className="flex-row items-center mb-2">
              <TextInput
                placeholder="Criteria 2"
                placeholderTextColor="#424242"
                value={criteria[1]}
                onChangeText={(text) => {
                  const newCriteria = [...criteria];
                  newCriteria[1] = text;
                  setCriteria(newCriteria);
                }}
                className="text-secondaryLight border border-neutral py-2 px-4 mb-2 rounded bg-background font-psemibold flex-1 mr-2"
              />
              <TextInput
                placeholder="(0-5)"
                placeholderTextColor="#424242"
                value={ratings[1]}
                keyboardType="numeric"
                onChangeText={(text) => {
                  const newRatings = [...ratings];
                  newRatings[1] = text;
                  setRatings(newRatings);
                }}
                className="text-secondaryLight border border-neutral py-2 px-4 mb-2 rounded bg-background font-psemibold w-24"
              />
            </View>
          ) : null}

          {criteria[1] ? (
            <View className="flex-row items-center mb-2">
              <TextInput
                placeholder="Criteria 3"
                placeholderTextColor="#424242"
                value={criteria[2]}
                onChangeText={(text) => {
                  const newCriteria = [...criteria];
                  newCriteria[2] = text;
                  setCriteria(newCriteria);
                }}
                className="text-secondaryLight border border-neutral py-2 px-4 mb-2 rounded bg-background font-psemibold flex-1 mr-2"
              />
              <TextInput
                placeholder="(0-5)"
                placeholderTextColor="#424242"
                value={ratings[2]}
                keyboardType="numeric"
                onChangeText={(text) => {
                  const newRatings = [...ratings];
                  newRatings[2] = text;
                  setRatings(newRatings);
                }}
                className="text-secondaryLight border border-neutral py-2 px-4 mb-2 rounded bg-background font-psemibold w-24"
              />
            </View>
          ) : null}

          <View className="flex-row justify-end mb-4">
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }}
              className="bg-secondaryLight rounded-full px-6 py-4 mx-3"
            >
              <Text className="text-xl font-pbold text-primary">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              className="bg-primary rounded-full px-6 py-4 mx-3"
            >
              <Text className="text-xl font-pbold text-secondaryLight">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
