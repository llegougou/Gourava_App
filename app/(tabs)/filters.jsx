import { SafeAreaView, Text, View, FlatList, ScrollView, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { icons } from '../../constants';

import { getTagsUsageCount, getCriteriaUsageCount } from '../../utils/database';

const Filters = () => {
  const [tagCounts, setTagCounts] = useState([]);
  const [criteriasCounts, setCriteriasCounts] = useState([]);

  const [visibleTagsCount, setVisibleTagsCount] = useState(10);
  const [visibleCriteriasCount, setVisibleCriteriasCount] = useState(10);
  
  const [isExpandedTags, setIsExpandedTags] = useState(false);
  const [isExpandedCriterias, setIsExpandedCriterias] = useState(false);

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

  const renderItem = ({ item }) => (
    <View className="flex-row justify-between px-4 py-2">
      <Text className="text-neutral text-lg font-pbold">{item.name}</Text>
      <Text className="text-neutral text-lg">{item.usage_count}</Text>
    </View>
  );

  const handleSeeMore = (section) => {
    if (section === 'tags') {
      setIsExpandedTags(true);
      setVisibleTagsCount(tagCounts.length);
    } else if (section === 'criterias') {
      setIsExpandedCriterias(true);
      setVisibleCriteriasCount(criteriasCounts.length);
    }
  };

  const handleSeeLess = (section) => {
    if (section === 'tags') {
      setIsExpandedTags(false);
      setVisibleTagsCount(10);
    } else if (section === 'criterias') {
      setIsExpandedCriterias(false);
      setVisibleCriteriasCount(10);
    }
  };

  const renderSeeMoreButton = (section) => {
    const isExpanded =
      section === 'tags' ? isExpandedTags :
        section === 'criterias' ? isExpandedCriterias :
          false;

    return (
      <View className="flex-row justify-center">
        <TouchableOpacity
          onPress={() => isExpanded ? handleSeeLess(section) : handleSeeMore(section)}
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
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background pt-14">
      <ScrollView>
        {/* TAGS Section */}
        <View style={{ marginVertical: '2%' }}>
          <View className="bg-backgroundAnti border border-neutral py-4">
            <Text className="text-neutral text-center text-xl font-pextrabold">Tags Usage</Text>
          </View>
          <View className="bg-secondaryLight border border-t-0 border-neutral py-4">
            <FlatList
              data={tagCounts.slice(0, visibleTagsCount)}
              renderItem={renderItem}
              keyExtractor={(item, index) => `${item.name}-${index}`}
              scrollEnabled={false}
            />
            {tagCounts.length > 10 && renderSeeMoreButton('tags')}
          </View>
        </View>

        {/* CRITERIA Section */}
        <View style={{ marginVertical: '2%' }}>
          <View className="bg-backgroundAnti border border-neutral py-4">
            <Text className="text-neutral text-center text-xl font-pextrabold">Criteria Usage</Text>
          </View>
          <View className="bg-secondaryLight border border-t-0 border-neutral py-4">
            <FlatList
              data={criteriasCounts.slice(0, visibleCriteriasCount)}
              renderItem={renderItem}
              keyExtractor={(item, index) => `${item.name}-${index}`}
              scrollEnabled={false}
            />
            {criteriasCounts.length > 10 && renderSeeMoreButton('criterias')}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Filters;