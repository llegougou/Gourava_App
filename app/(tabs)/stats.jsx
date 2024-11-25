import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, Text, View, FlatList, ScrollView, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { icons } from '../../constants';

import { getTagsUsageCount, getCriteriaUsageCount } from '../../utils/database';

const Stats = () => {
  const [tagCounts, setTagCounts] = useState([]);
  const [criteriasCounts, setCriteriasCounts] = useState([]);

  const [visibleTagsCount, setVisibleTagsCount] = useState(6);
  const [visibleCriteriasCount, setVisibleCriteriasCount] = useState(6);

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

  const renderItem = ({ item, index }) => {
    const backgroundColor = index % 2 === 0 ? 'bg-secondaryLight' : 'bg-secondary'

    return (
      <View className={`flex-row justify-between px-4 pb-2 pt-3 ${backgroundColor}`}>
        <Text className="text-neutral text-lg font-pbold">{item.name}</Text>
        <Text className="text-neutral text-lg">{item.usage_count}</Text>
      </View>
    )
  };

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
      setVisibleTagsCount(6);
    } else if (section === 'criterias') {
      setIsExpandedCriterias(false);
      setVisibleCriteriasCount(6);
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
      <StatusBar backgroundColor='#DCC8AA' barStyle="dark-content" style="dark" />
      <ScrollView>
        {/* Title */}
        <Text className='text-primary text-center text-4xl font-pextrabold mt-11 mb-5'>USAGE  DASHBOARD</Text>

        {/* TAGS Section */}
        <View style={{ marginVertical: '2%' }}>
          <View className="bg-backgroundAnti py-4 elevation-md">
            <Text className="text-neutral text-center text-xl font-pextrabold">Tags Usage</Text>
          </View>
          <View className="bg-secondaryLight">
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
          <View className="bg-backgroundAnti py-4 elevation-md">
            <Text className="text-neutral text-center text-xl font-pextrabold">Criteria Usage</Text>
          </View>
          <View className="bg-secondaryLight">
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

export default Stats;