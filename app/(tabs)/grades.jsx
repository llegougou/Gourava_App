import { SafeAreaView, View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import ItemInfoCard from '../../components/ItemInfoCard';

const Grades = () => {
  const [isTagsVisible, setTagsVisible] = useState(false);
  const [isOrderByVisible, setOrderByVisible] = useState(false);
  const [isFiltersVisible, setFiltersVisible] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

  const sampleItems = [
    {
      title: 'Espresso',
      creationDate: '2024-11-01',
      tags: ['coffee', 'strong', 'morning'],
      criteriaRatings: [
        { name: 'Taste', rating: 4 },
        { name: 'Aroma', rating: 5 },
        { name: 'Aftertaste', rating: 3 },
      ],
    },
    {
      title: 'Smoothie',
      tags: ['fruit', 'refreshing', 'healthy'],
      criteriaRatings: [
        { name: 'Taste', rating: 5 },
        { name: 'Texture', rating: 4 },
        { name: 'Presentation', rating: 5 },
      ],
    },
    {
      title: 'Green Tea',
      tags: ['tea', 'relaxing', 'healthy'],
      criteriaRatings: [
        { name: 'Taste', rating: 3 },
        { name: 'Aroma', rating: 4 },
        { name: 'Freshness', rating: 4 },
      ],
    },
    {
      title: 'Red Beer',
      tags: ['Beer', 'Red', 'Alcool'],
      criteriaRatings: [
        { name: 'Taste', rating: 3 },
        { name: 'Aroma', rating: 4 },
      ],
    },
  ];

  // Get all unique tags from sampleItems
  const allTags = [...new Set(sampleItems.flatMap(item => item.tags))];

  // Function to toggle tag selection
  const toggleTagSelection = (tag) => {
    setSelectedTags((prev) => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const displayTags = () => {
    setTagsVisible(!isTagsVisible);
    setOrderByVisible(false);
    setFiltersVisible(false);
  }

  const displayOrderBy = () => {
    setTagsVisible(false);
    setOrderByVisible(!isOrderByVisible);
    setFiltersVisible(false);
  }

  const displayFilters = () => {
    setTagsVisible(false);
    setOrderByVisible(false);
    setFiltersVisible(!isFiltersVisible);
  }

  // Filter items based on selected tags
  const filteredItems = selectedTags.length === 0
    ? sampleItems
    : sampleItems.filter(item => item.tags.some(tag => selectedTags.includes(tag)));

  const renderItem = ({ item }) => (
    <View style={{ flex: 1, margin: 10 }}> 
      <ItemInfoCard
        title={item.title}
        creationDate={item.creationDate}
        tags={item.tags}
        criteriaRatings={item.criteriaRatings}
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background px-4 py-6 pt-14">
      <TextInput
        placeholder="Search..."
        className="border border-neutral rounded-full px-4 py-2 mb-4 text-neutral"
      />

      <View className="flex-row justify-between mb-4">
        <TouchableOpacity
          onPress={() => displayTags()}
          className="bg-primary rounded-full px-6 py-4"
        >
          <Text className="text-xl font-pbold text-secondaryLight">Tags</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => displayOrderBy()}
          className="bg-primary rounded-full px-6 py-4"
        >
          <Text className="text-xl font-pbold text-secondaryLight">Order By</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => displayFilters()}
          className="bg-primary rounded-full px-6 py-4"
        >
          <Text className="text-xl font-pbold text-secondaryLight">Filters</Text>
        </TouchableOpacity>
      </View>

      {isTagsVisible && (
        <View className="flex-wrap flex-row bg-primaryLight rounded-lg p-4 mb-4">
          <Text className="text-lg text-white font-semibold mb-2">Select Tags:</Text>
          <View className="flex-row flex-wrap">
            {allTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                onPress={() => toggleTagSelection(tag)}
                className={`border p-3 rounded-lg mb-2 mr-2 ${selectedTags.includes(tag) ? 'bg-secondary' : 'bg-white'}`}
              >
                <Text className={`${selectedTags.includes(tag) ? 'text-white' : 'text-black'}`}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        numColumns={2}
      />
    </SafeAreaView>
  );
};

export default Grades;
