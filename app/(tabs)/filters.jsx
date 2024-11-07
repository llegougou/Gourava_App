import { SafeAreaView, Text, View, FlatList } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getTagsUsageCount, getCriteriaUsageCount } from '../../utils/database';

const Filters = () => {
  const [tagCounts, setTagCounts] = useState([]);
  const [criteriasCounts, setCriteriasCounts] = useState([]);

  const loadCounts = async () => {
    const tags = await getTagsUsageCount;
    setTagCounts(tags);
    const criterias = await getCriteriaUsageCount;
    setCriteriasCounts(criterias);
  }

  useFocusEffect(
    React.useCallback(() => {
      const fetchCounts = async () => {
        await loadCounts();
      }
      fetchCounts();
    }, [])
  );

  const renderItem = ({ item }) => (
    <View className="flex-row justify-between px-4 py-2">
      <Text className="text-neutral text-lg font-pbold">{item.tag}</Text>
      <Text className="text-neutral text-lg">{item.count}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background pt-20">
      <View style={{maxHeight:'20%', marginVertical:'2%'}}>
        <View className="bg-backgroundAnti border-t border-neutral py-4">
          <Text className="text-neutral ml-16 text-xl font-pextrabold">TAGS</Text>
        </View>
        <View className="bg-secondaryLight border-y border-neutral py-4">
          <FlatList
            data={tagCounts}
            renderItem={renderItem}
            keyExtractor={(item) => item.tag}
          /> 
        </View>
      </View>
      <View style={{maxHeight:'20%', marginVertical:'2%'}}>
        <View className="bg-backgroundAnti border-t border-neutral py-4">
          <Text className="text-neutral ml-16 text-xl font-pextrabold">CRITERIAS</Text>
        </View>
        <View className="bg-secondaryLight border-y border-neutral py-4">
          <FlatList
            data={tagCounts}
            renderItem={renderItem}
            keyExtractor={(item) => item.tag}
          /> 
        </View>
      </View>
      <View style={{maxHeight:'20%', marginVertical:'2%'}}>
        <View className="bg-backgroundAnti border-t border-neutral py-4">
          <Text className="text-neutral ml-16 text-xl font-pextrabold">CRITERIAS</Text>
        </View>
        <View className="bg-secondaryLight border-y border-neutral py-4">
          <FlatList
            data={tagCounts}
            renderItem={renderItem}
            keyExtractor={(item) => item.tag}
          /> 
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Filters;
