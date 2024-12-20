import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaView,
  Text,
  View,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  ToastAndroid,
  LayoutAnimation
} from 'react-native';
import Checkbox from 'expo-checkbox';
import React, { useState } from 'react';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { useFocusEffect } from '@react-navigation/native';
import { useLanguage } from '../../components/LanguageContext';
import { icons } from '../../constants';

import { getTagsUsageCount, getCriteriaUsageCount, importData, exportAll, exportItems, exportTemplates } from '../../utils/database';

const Stats = () => {
  const MAX_VISIBLE = 6;
  const [tagCounts, setTagCounts] = useState([]);
  const [criteriasCounts, setCriteriasCounts] = useState([]);
  const [visibleTagsCount, setVisibleTagsCount] = useState(MAX_VISIBLE);
  const [visibleCriteriasCount, setVisibleCriteriasCount] = useState(MAX_VISIBLE);
  const [isExpandedTags, setIsExpandedTags] = useState(false);
  const [isExpandedCriterias, setIsExpandedCriterias] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [exportItemsChecked, setExportItemsChecked] = useState(false);
  const [exportTemplatesChecked, setExportTemplatesChecked] = useState(false);

  const { languageData } = useLanguage();

  const loadCounts = async () => {
    const tags = await getTagsUsageCount(0);
    setTagCounts(tags);
    const criterias = await getCriteriaUsageCount(0);
    setCriteriasCounts(criterias);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadCounts();
    }, [])
  );

  const handleSeeMore = (section) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (section === 'tags') {
      setIsExpandedTags(true);
      setVisibleTagsCount(tagCounts.length);
    } else if (section === 'criterias') {
      setIsExpandedCriterias(true);
      setVisibleCriteriasCount(criteriasCounts.length);
    }
  };
  
  const handleSeeLess = (section) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (section === 'tags') {
      setIsExpandedTags(false);
      setVisibleTagsCount(MAX_VISIBLE);
    } else if (section === 'criterias') {
      setIsExpandedCriterias(false);
      setVisibleCriteriasCount(MAX_VISIBLE);
    }
  };

  const handleExportSave = async () => {
    try {
      if (!exportItemsChecked && !exportTemplatesChecked) {
        ToastAndroid.show(languageData.screens.stats.text.exportEmpty, ToastAndroid.SHORT);
        return;
      }

      let jsonData;
      let fileNameParts = ['export'];

      if (exportItemsChecked && exportTemplatesChecked) {
        jsonData = await exportAll();
        fileNameParts.push('items_templates');
      } else if (exportItemsChecked) {
        jsonData = await exportItems();
        fileNameParts.push('items');
      } else if (exportTemplatesChecked) {
        jsonData = await exportTemplates();
        fileNameParts.push('templates');
      }

      const currentDate = new Date();
      const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}_` +
        `${String(currentDate.getHours()).padStart(2, '0')}-${String(currentDate.getMinutes()).padStart(2, '0')}`;

      if (jsonData) {
        const fileUri = FileSystem.documentDirectory + fileNameParts.join('_') + `_${formattedDate}.json`;

        await FileSystem.writeAsStringAsync(fileUri, jsonData);

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        }

        ToastAndroid.show(languageData.screens.stats.text.exportSucces, ToastAndroid.SHORT);
        setIsModalVisible(false);
        setExportItemsChecked(false);
        setExportTemplatesChecked(false);
      }
    } catch (error) {
      ToastAndroid.show(languageData.screens.stats.text.exportError, ToastAndroid.SHORT);
    }
  };

  const handleImportSave = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
      });

      if (result.type === 'cancel') {
        ToastAndroid.show("File selection cancelled.", ToastAndroid.SHORT);
        return;
      }

      const fileUri = result.assets[0].uri;

      if (!fileUri) {
        ToastAndroid.show("Invalid file format or URI.", ToastAndroid.SHORT);
        return;
      }

      try {
        const fileContent = await FileSystem.readAsStringAsync(fileUri);

        await importData(fileContent);

        ToastAndroid.show("File imported successfully.", ToastAndroid.SHORT);

        loadCounts();

      } catch (error) {
        ToastAndroid.show("Error reading or parsing the file.", ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show("Error selecting the file.", ToastAndroid.SHORT);
    }
  };

  const renderItem = ({ item, index }) => {
    const backgroundColor = index % 2 === 0 ? 'bg-backgroundAnti' : 'bg-background';

    return (
      <View className={`flex-row justify-between px-4 pb-2 pt-3 ${backgroundColor}`}>
        <Text className="text-neutral text-lg font-pbold">{item.name}</Text>
        <Text className="text-neutral text-lg">{item.usage_count}</Text>
      </View>
    );
  };

  const renderSeeMoreButton = (section) => {
    const isExpanded =
      section === 'tags' ? isExpandedTags :
        section === 'criterias' ? isExpandedCriterias :
          false;

    return (
      <TouchableOpacity
        onPress={() => isExpanded ? handleSeeLess(section) : handleSeeMore(section)}
        className="flex-row justify-center bg-background border-t border-backgroundAnti py-2"
      >
        <Image
          source={icons.navArrow}
          style={{
            width: 20,
            height: 20,
            transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
            tintColor: '#424242'
          }}
        />
      </TouchableOpacity>
    );
  };
  

  return (
    <SafeAreaView className="flex-1 bg-background pt-14">
      <StatusBar backgroundColor='#DCC8AA' barStyle="dark-content" style="dark" />
      <ScrollView>
        {/* Title */}
        <Text className='text-primary text-center text-4xl font-pextrabold mt-11 mb-5'>{languageData.screens.stats.text.usageDashboard}</Text>

        {/* TAGS Section */}
        <View style={{ marginVertical: '2%' }}>
          <View className="bg-secondary py-4 elevation-md">
            <Text className="text-neutral text-center text-xl font-pextrabold">{languageData.common.tag.variations[3]}</Text>
          </View>
          <View className="bg-backgroundAnti border-b border-backgroundAnti">
            <FlatList
              data={tagCounts.slice(0, visibleTagsCount)}
              renderItem={renderItem}
              keyExtractor={(item, index) => `${item.name}-${index}`}
              scrollEnabled={false}
            />
            {tagCounts.length > MAX_VISIBLE && renderSeeMoreButton('tags')}
          </View>
        </View>

        {/* CRITERIA Section */}
        <View style={{ marginVertical: '2%' }}>
          <View className="bg-secondary py-4 elevation-md">
            <Text className="text-neutral text-center text-xl font-pextrabold">{languageData.common.criteria.variations[3]}</Text>
          </View>
          <View className="bg-background border-b border-backgroundAnti">
            <FlatList
              data={criteriasCounts.slice(0, visibleCriteriasCount)}
              renderItem={renderItem}
              keyExtractor={(item, index) => `${item.name}-${index}`}
              scrollEnabled={false}
            />
            {criteriasCounts.length > MAX_VISIBLE && renderSeeMoreButton('criterias')}
          </View>
        </View>

        {/* Saving Buttons */}
        <View style={{ width: '80%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', alignSelf: 'center' }}>
          <TouchableOpacity
            className="p-3 border border-neutral rounded-lg flex-row self-center"
            onPress={() => setIsModalVisible(true)}
          >
            <Image source={icons.download} style={{
              width: 20,
              height: 20,
              tintColor: '#424242',
              marginRight: 6
            }} />
            <Text className="font-pbold text-neutral">{languageData.screens.stats.text.exporting}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="p-3 border border-neutral rounded-lg flex-row self-center m-2"
            onPress={handleImportSave}
          >
            <Image source={icons.upload} style={{
              width: 20,
              height: 20,
              tintColor: '#424242',
              marginRight: 6
            }} />
            <Text className="font-pbold text-neutral">{languageData.screens.stats.text.importing}</Text>
          </TouchableOpacity>
        </View>

        {/* Export Modal */}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="none"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-neutral">
            <View className="bg-backgroundAnti p-5 rounded-lg" style={{ width: '80%' }}>
              <Text className="text-xl font-pextrabold mb-4">{languageData.screens.stats.text.exportOptions}</Text>
              <TouchableOpacity className="flex-row items-center mb-3" onPress={() => setExportItemsChecked(!exportItemsChecked)}>
                <Checkbox
                  value={exportItemsChecked}
                  onValueChange={() => setExportItemsChecked(!exportItemsChecked)}
                />
                <Text className="text-lg font-pbold ml-2" numberOfLines={2}>{languageData.screens.stats.text.items}</Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center mb-3" onPress={() => setExportTemplatesChecked(!exportTemplatesChecked)}>
                <Checkbox
                  value={exportTemplatesChecked}
                  onValueChange={() => setExportTemplatesChecked(!exportTemplatesChecked)}
                />
                <Text className="text-lg font-pbold ml-2" numberOfLines={2}>{languageData.screens.stats.text.templates}</Text>
              </TouchableOpacity>

              <View className="flex-row justify-between mt-4">
                {/* Cancel Button */}
                <TouchableOpacity
                  onPress={() => {
                    setIsModalVisible(false);
                    setExportItemsChecked(false);
                    setExportTemplatesChecked(false);
                  }}
                  className="bg-secondaryLight py-3 px-6 rounded-lg mx-2"
                >
                  <Text className="text-lg font-bold text-neutral">
                    {languageData.common.cancel.onecaps}
                  </Text>
                </TouchableOpacity>

                {/* Save Button */}
                <TouchableOpacity
                  onPress={handleExportSave}
                  className="bg-primary py-3 px-6 rounded-lg mx-2"
                >
                  <Text className="text-lg font-bold text-backgroundAnti">
                    {languageData.common.save.onecaps}
                  </Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Stats;
