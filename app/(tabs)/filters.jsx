import { SafeAreaView, Text, View, FlatList } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getTagsUsageCount, getCriteriaUsageCount } from '../../utils/database';

const Filters = () => {
  const [tagCounts, setTagCounts] = useState([]);
  const [criteriasCounts, setCriteriasCounts] = useState([]);

  const loadCounts = async () => {
    const tags = await getTagsUsageCount(0);
    setTagCounts(tags);
    const criterias = await getCriteriaUsageCount(0);
    setCriteriasCounts(criterias);
  }

  useFocusEffect(
    React.useCallback(() => {
      loadCounts();
    }, [])
       
  );

  const renderItem = ({ item }) => (
    <View className="flex-row justify-between px-4 py-2">
      <Text className="text-neutral text-lg font-pbold">
        {item.tag || item.name}
      </Text>
      <Text className="text-neutral text-lg">{item.usage_count}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background pt-20">

      <View style={{ marginVertical: '2%' }}>
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

      <View style={{ marginVertical: '2%' }}>
        <View className="bg-backgroundAnti border-t border-neutral py-4">
          <Text className="text-neutral ml-16 text-xl font-pextrabold">CRITERIAS</Text>
        </View>
        <View className="bg-secondaryLight border-y border-neutral py-4">
          <FlatList
            data={criteriasCounts}
            renderItem={renderItem}
            keyExtractor={(item) => item.name}
          />
        </View>
      </View>
      
      <View style={{ maxHeight: '20%', marginVertical: '2%' }}>
        <View className="bg-backgroundAnti border-t border-neutral py-4">
          <Text className="text-neutral ml-16 text-xl font-pextrabold">TEMPLATES</Text>
        </View>
        <View className="bg-secondaryLight border-y border-neutral py-4">
          <Text className="ml-10">SOON TO COME</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Filters;
