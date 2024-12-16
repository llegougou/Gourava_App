import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Easing
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { initializeApp, addItem, getTemplates } from "../../utils/database";
import ItemFormModal from '../../components/ItemFormModal';
import { useLanguage } from '../../components/LanguageContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';

import { icons } from '../../constants';

export default function App() {
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState(["", "", ""]);
  const [criteria, setCriteria] = useState(["", "", ""]);
  const [ratings, setRatings] = useState(["", "", ""]);
  const [templates, setTemplates] = useState([]);

  const { languageData } = useLanguage();

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height
  const squareSize = screenWidth * 0.6;
  const rotationValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const initializeAndLoad = async () => {
      await initializeApp();
      await loadTemplates(); 
    };
  
    initializeAndLoad();
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
      await addItem(trimmedTitle, filteredTags, filteredCriteria);

    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

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
    outputRange: ['0deg', '-360deg'],
  });  

  const onPressAdd = () => {
    startRotation();
    setTimeout(() => {
      setCustomModalVisible(true);
    }, 100);
  };

  
  const accentTextStyle = 'text-secondary font-pextrabold text-xl leading-relaxed'

  return (
    <SafeAreaView className="flex-1 bg-background pt-14">
      <StatusBar backgroundColor='#DCC8AA' barStyle="dark-content" style="dark" />
      <ScrollView>
        <View className="flex-row justify-between items-end">
          <Text className="text-4xl text-primaryLight font-pextrabold ml-4 pt-4">{languageData.screens.home.text.welcomeMessage}</Text>
          <LanguageSwitcher />
        </View>
        <Text className="text-6xl text-primary font-pextrabold py-2 ml-6">GOURAVA!</Text>
        <View className="items-end">
          <Text className="text-2xl  text-secondaryLight font-psemibold mr-6">{languageData.screens.home.text.sloganPart1}</Text>
          <Text className="text-3xl text-secondary mb-4 font-psemibold mr-4">{languageData.screens.home.text.sloganPart2}</Text>
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
                onPress={onPressAdd}
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
                  className="text-xl font-bold text-background text-center pt-2"
                  style={{
                    position: 'absolute',
                    bottom: 20,
                    width: '100%',
                  }}
                >
                  {languageData.screens.home.text.addButtonText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Descritpion text*/}
        <View className="mx-3 justify-center">
          <Text className='text-neutral font-psemibold text-xl '>
          {languageData.screens.home.text.descriptionPart1} <Text className={`${accentTextStyle}`}>{languageData.screens.home.text.descriptionAccent1} </Text>
          {languageData.screens.home.text.descriptionPart2} <Text className={`${accentTextStyle}`}>{languageData.common.tag.variations[3]} </Text>{languageData.screens.home.text.descriptionPart3}
            <Text className={`${accentTextStyle}`}> {languageData.common.criteria.variations[3]}</Text> {languageData.screens.home.text.descriptionPart4}
            <Text className={`${accentTextStyle}`}> {languageData.screens.home.text.descriptionAccent4}</Text> {languageData.screens.home.text.descriptionPart5}
          </Text>
        </View>

        {/* Custom Adding Modal */}
        <ItemFormModal
          typeOfModal="customCreate"
          title={title}
          tags={tags.map(tag => ({ name: tag }))}
          criteria={criteria.map((name, index) => ({ name, rating: ratings[index] }))}
          templates={templates}
          templateChoice={true}
          isVisible={customModalVisible}
          onCancel={() => setCustomModalVisible(false)}
          onSave={handleSave}
        />

      </ScrollView>
    </SafeAreaView>
  );
}