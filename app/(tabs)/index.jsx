import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  Dimensions,
  Animated,
  Easing
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { initializeApp, addItem, getTemplates } from "../../utils/database";
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
  const [templates, setTemplates] = useState([]);
  const [templateTags, setTemplateTags] = useState(["", "", ""]);
  const [templateCriteria, setTemplateCriteria] = useState(["", "", ""]);

  const navigation = useNavigation();

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height
  const squareSize = screenWidth * 0.6;
  const rotationValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeApp();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadTemplates();
    }, [])
  );

  const loadTemplates = async () => {
    const templates = await getTemplates();
    setTemplates(templates);
  }

  const handleSave = async (newTitle, newTags, newCriteria, ratings) => {
    try {
      const filteredCriteria = newCriteria
        .map((name, index) => ({
          name: name.trim(),
          rating: ratings[index].trim() === "" ? undefined : ratings[index].trim(),
        }))
        .filter(criteria => criteria.rating !== undefined);

      const filteredTags = newTags
        .map(tag => tag.trim())
        .filter(tag => tag !== "")

        .map(tag => ({ name: tag }));

      const trimmedTitle = newTitle.trim();

      setCustomModalVisible(false);
      setTemplateModalVisible(false);
      setChoiceModalVisible(false);
      await addItem(trimmedTitle, filteredTags, filteredCriteria);

    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const handleTemplateSelect = async (templateId) => {
    const selectedTemplate = templates.find((template) => template.id === templateId);
    if (selectedTemplate) {
      setTemplateTags(selectedTemplate.tags);
      setTemplateCriteria(selectedTemplate.criteria);
    }
    setTemplateModalVisible(true);
  };

  const handleTemplatesPress = () => {
    navigation.navigate('templates');
    setChoiceModalVisible(false)
  }

  const handleGradesPress = () => {
    navigation.navigate('grades');
  }

  const resetTemplateForm = () => {
    setTemplateTags(["", "", ""]);
    setTemplateCriteria(["", "", ""]);
  }

  const startRotation = () => {
    rotationValue.setValue(0); 
    Animated.timing(rotationValue, {
      toValue: 0.5, 
      duration: 200, 
      easing: Easing.linear, 
      useNativeDriver: true, 
    }).start(() => {
    });
  };

  const rotateInterpolation = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'], 
  });

  const accentTextStyle = 'text-secondary font-pextrabold text-xl leading-loose'

  return (
    <SafeAreaView className="flex-1 bg-background pt-14">
      <StatusBar backgroundColor='#DCC8AA' barStyle="dark-content" style="dark" />
      <ScrollView>
        <Text className="text-4xl text-primaryLight font-pextrabold ml-4 pt-4">WELCOME TO</Text>
        <Text className="text-6xl text-primary font-pextrabold py-2 ml-6">GOURAVA!</Text>
        <View className="items-end">
          <Text className="text-2xl  text-secondaryLight font-psemibold mr-6">SAVOR EVERY MOMENT,</Text>
          <Text className="text-3xl text-secondary mb-4 font-psemibold mr-4">RATE EVERY TASTE!</Text>
        </View>


        {/* Add Button */}
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          marginVertical: screenHeight * 0.05,
        }}>
          <View
            className="bg-primary rounded-3xl center"
            style={{
              width: squareSize * 1.2,
              height: squareSize * 1.2,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}>
            <View
              className="bg-background rounded-2xl center elevation-lg"
              style={{
                width: squareSize * 1.1,
                height: squareSize * 1.1,
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}>
              <TouchableOpacity
                className="bg-primaryLight rounded-xl center elevation-md"
                style={{
                  width: squareSize,
                  height: squareSize,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  position: 'relative',

                }}
                onPress={() => {
                  startRotation(); 
                  setTimeout(() => {
                    setChoiceModalVisible(true);
                  }, 100);
                }}
              >
                <Animated.Image
                  source={icons.add}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: [
                      { translateX: -(squareSize * 0.2) },
                      { translateY: -(squareSize * 0.2) },
                      { rotate: rotateInterpolation }, 
                    ],
                    width: squareSize * 0.4,
                    height: squareSize * 0.4,
                    tintColor: '#FFF3E0',
                  }}
                />

                <Text
                  className="text-xl font-bold text-background text-center mt-2"
                  style={{
                    position: 'absolute',
                    bottom: 20,
                    width: '100%',
                  }}
                >
                  GRADE A NEW ITEM
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Descritpion text*/}
        <View className="mx-3 justify-center">
          <Text className='text-neutral font-psemibold text-xl '>
            This app lets you <Text className={`${accentTextStyle}`}>grade anything you want! </Text>
            Use <Text className={`${accentTextStyle}`}>TAGS</Text> to organize and label your items, and
            <Text className={`${accentTextStyle}`}> CRITERIA</Text> to rate and evaluate them in a way that makes sense to you.
            It’s <Text className={`${accentTextStyle}`}>YOUR WORLD</Text> — categorize it, rate it, and see what stands out!
          </Text>
        </View>


        {/* Choice Modal */}
        <Modal animationType="slide" transparent={false} visible={choiceModalVisible}>
          <View className="flex-1 bg-backgroundAnti p-4">

            <Text className="text-primary text-xl font-pextrabold mt-10">Create a custom item...</Text>
            {/* Custom Template Creation Section */}
            <TouchableOpacity
              className="m-3 px-4 pt-4 pb-3 elevation-md bg-background rounded-md mb-6"
              onPress={() => { setCustomModalVisible(true) }}
            >
              <Text className="text-neutral text-lg font-pbold text-center">Create Custom Item</Text>
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
                    className="flex-1 m-3 px-4 pt-4 pb-3 elevation-md bg-background rounded-md"
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
                  className="m-3 px-4 pt-4 pb-3 elevation-md bg-background rounded-md mb-6"
                  onPress={handleTemplatesPress}
                >
                  <Text className="text-neutral text-lg font-pbold text-center">Create a template</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Close Modal Button */}
            <TouchableOpacity
              className="mt-4 bg-secondaryLight px-4 py-4 rounded-md items-center"
              onPress={() => setChoiceModalVisible(false)}
            >
              <Text className="text-primary text-xl font-pbold">Close</Text>
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
          onCancel={() => { setTemplateModalVisible(false); resetTemplateForm(); }}
          onSave={handleSave}
        />
      </ScrollView>
    </SafeAreaView>
  );
}