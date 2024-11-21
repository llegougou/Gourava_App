import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  Modal
} from "react-native";
import React, { useState } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { initializeDatabase, addItem, getItems, getTagsUsageCount, getCriteriaUsageCount, getTemplates } from "../../utils/database";
import ItemInfoCard from '../../components/ItemInfoCard';
import ItemFormModal from '../../components/ItemFormModal';
import { useNavigation } from "@react-navigation/native";

import { icons } from '../../constants';

export default function App() {
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [choiceModalVisible, setChoiceModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState(["", "", ""]);
  const [criteria, setCriteria] = useState(["", "", ""]);
  const [ratings, setRatings] = useState(["", "", ""]);
  const [randomItems, setRandomItems] = useState([]);
  const [tagsCounts, setTagsCounts] = useState([]);
  const [criteriasCounts, setCriteriasCounts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateTags, setTemplateTags] = useState(["", "", ""]);
  const [templateCriteria, setTemplateCriteria] = useState(["", "", ""]);

  const statusBarColor = 
        templateModalVisible || customModalVisible || choiceModalVisible
            ? '#DCC8AA'
            : '#FFF3E0';


  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      loadItems();
      loadCounts();
      loadTemplates();
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

  const loadTemplates = async () => {
    const templates = await getTemplates();
    setTemplates(templates);
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

      setCustomModalVisible(false);
      setTemplateModalVisible(false);
      setChoiceModalVisible(false);
      await addItem(newTitle, filteredTags, filteredCriteria);

      loadItems();

    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const handleTemplateSelect = async (templateId) => {
    const selectedTemplate = templates.find((template) => template.id === templateId);
    if (selectedTemplate) {
      setTemplateTitle(selectedTemplate.name);
      setTemplateTags(selectedTemplate.tags);
      setTemplateCriteria(selectedTemplate.criteria);
    }
    setTemplateModalVisible(true);
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

  const renderStats = ({ item }) => (
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

  const handleTemplatesPress = () => {
    navigation.navigate('templates');
    setChoiceModalVisible(false)
  }

  const resetTemplateForm =()=>{
    setTemplateTags(["", "", ""]);
    setTemplateCriteria(["", "", ""]);
  }

  return (
    <SafeAreaView className="flex-1 bg-background pt-24">
      <StatusBar backgroundColor={statusBarColor} barStyle="dark-content" style="dark" />
      <Text className="text-4xl text-primaryLight font-pextrabold ml-4">WELCOME TO</Text>
      <Text className="text-7xl text-primary font-pextrabold py-2 ml-6">GOURAVA!</Text>
      <View className="items-end">
        <Text className="text-2xl  text-secondaryLight font-psemibold mr-6">SAVOR EVERY MOMENT,</Text>
        <Text className="text-3xl text-secondary mb-4 font-psemibold mr-4">RATE EVERY TASTE!</Text>
      </View>


      {/* Template Add Button */}
      <TouchableOpacity
        className="bg-primary rounded-xl px-6 py-4 mx-4 mb-2 border border-neutral"
        onPress={() => setChoiceModalVisible(true)}
      >
        <Text className="text-xl font-bold text-background text-center">
          GRADE A NEW ITEM
        </Text>
      </TouchableOpacity>

      {/* Random Items */}
      <View className="bg-secondaryLight border-y border-neutral my-3">
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

      {/* Choice Modal */}
      <Modal animationType="slide" transparent={false} visible={choiceModalVisible}>
        <View className="flex-1 bg-backgroundAnti p-4">

        <Text className="text-primary text-xl font-pextrabold mt-10">Create a custom template...</Text>
          {/* Custom Template Creation Section */}
          <TouchableOpacity
            className="m-3 px-4 pt-4 pb-3 border border-neutral bg-background rounded-md mb-6"
            onPress={() => {setCustomModalVisible(true)}}
          >
            <Text className="text-neutral text-lg font-pbold text-center">Create Custom Template</Text>
          </TouchableOpacity>

          <Text className="text-primary text-xl font-pextrabold">... or choose an existing template</Text>
          {/* Templates Section */}
          {templates.length > 0 ? (
            <FlatList
              data={templates}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="flex-1 m-3 px-4 pt-4 pb-3 border border-neutral bg-background rounded-md"
                  onPress={() => handleTemplateSelect(item.id)}
                >
                  <Text className="font-psemibold text-lg text-center text-neutral">{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          ) : (
            <View>
              <Text className="text-secondary text-lg font-pbold text-center mt-4">No Templates Found</Text>
              <TouchableOpacity
                className="m-3 px-4 pt-4 pb-3 border border-neutral bg-background rounded-md mb-6"
                onPress={handleTemplatesPress}
              >
                <Text className="text-neutral text-lg font-pbold text-center">Create a template</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Close Modal Button */}
          <TouchableOpacity
            className="mt-4 bg-secondary px-4 py-4 rounded-md items-center"
            onPress={() => setChoiceModalVisible(false)}
          >
            <Text className="text-background text-xl font-pbold">Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Custom Adding Modal */}
      <ItemFormModal
        typeOfModal="customCreate"
        title={title}
        tags={tags.map(tag => ({ name: tag }))}
        criteria={criteria.map((name, index) => ({ name, rating: ratings[index] }))}
        isVisible={customModalVisible}
        onCancel={() => setCustomModalVisible(false)}
        onSave={handleSave}
      />

      {/* Template Adding Modal */}
      <ItemFormModal
        typeOfModal="fromTemplateCreate"
        title={title}
        tags={templateTags.map((tag) => ({ name: tag }))}
        criteria={templateCriteria.map((name, index) => ({
          name,
          rating: '',
        }))}
        isVisible={templateModalVisible}
        onCancel={() =>{setTemplateModalVisible(false); resetTemplateForm();}}
        onSave={handleSave}
      />

    </SafeAreaView>
  );
}