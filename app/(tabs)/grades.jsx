import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView
} from 'react-native';
import React, { useState, useRef } from 'react';
import ItemInfoCard from '../../components/ItemInfoCard';
import { icons } from '../../constants';
import { useFocusEffect } from '@react-navigation/native';

import { getItems, deleteItem, updateItem } from "../../utils/database";
import ItemFormModal from '../../components/ItemFormModal';

const Grades = () => {
  const [isTagsVisible, setTagsVisible] = useState(false);
  const [isOrderByVisible, setOrderByVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [selectedTags, setSelectedTags] = useState([]);
  const [orderBy, setOrderBy] = useState('alphabetical');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);

  const [editItemId, setEditItemId] = useState(null);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState(['']);
  const [criteria, setCriteria] = useState(['']);
  const [ratings, setRatings] = useState(['']);

  const searchInputRef = useRef(null);

  const loadItems = async () => {
    const itemsFromDb = await getItems(0);
    setItems(itemsFromDb);
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchItems = async () => {
        await loadItems();
      };
      fetchItems();
    }, [])
  );
  const allTags = [...new Set(items.flatMap(item => item.tags.map(tag => tag.name)))];

  const toggleTagSelection = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const displayTags = () => {
    setTagsVisible(!isTagsVisible);
    setOrderByVisible(false);
  };

  const displayOrderBy = () => {
    setTagsVisible(false);
    setOrderByVisible(!isOrderByVisible);
  };

  const calculateAverageRating = (criteriaRatings = []) => {
    if (!criteriaRatings || criteriaRatings.length === 0) return 0;
    const total = criteriaRatings.reduce((sum, { rating }) => sum + (parseFloat(rating) || 0), 0);
    return total / criteriaRatings.length;
  };


  const filteredAndSortedItems = items
    .filter((item) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !item.title.toLowerCase().includes(query) &&
          !item.tags.some((tag) => tag.toLowerCase().includes(query)) &&
          !item.criteriaRatings.some((criteria) =>
            criteria.name.toLowerCase().includes(query)
          )
        ) {
          return false;
        }
      }
      if (selectedTags.length > 0 && !selectedTags.every(tag => item.tags.some(t => t.name === tag))) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (orderBy) {
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'random':
          return Math.random() - 0.5;
        case 'ratingAsc':
          return calculateAverageRating(a.criteriaRatings) - calculateAverageRating(b.criteriaRatings);
        case 'ratingDesc':
          return calculateAverageRating(b.criteriaRatings) - calculateAverageRating(a.criteriaRatings);
        default:
          return 0;
      }
    });

  const splitData = (data) => {
    const midIndex = Math.ceil(data.length / 2);
    return [data.slice(0, midIndex), data.slice(midIndex)];
  };

  const [leftColumnItems, rightColumnItems] = splitData(filteredAndSortedItems);

  const renderItem = ({ item }) => (
    <View style={{ flex: 1, margin: 10 }}>
      <ItemInfoCard
        id={item.id}
        title={item.title}
        tags={item.tags}
        criteriaRatings={item.criteriaRatings}
        showButtons={true}
        onDelete={() => handleDeleteItem(item.id)}
        onUpdate={() => handleUpdateItem(item)}
      />
    </View>
  );

  const handleDeleteItem = async (id) => {
    await deleteItem(id);
    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);
  };

  const handleUpdateItem = (item) => {
    setEditItemId(item.id);
    setTitle(item.title);
    setTags(item.tags.map(tag => tag.name));
    setCriteria(item.criteriaRatings.map(crit => crit.name));
    setRatings(item.criteriaRatings.map(crit => String(crit.rating)));
    setModalVisible(true);
  };

  const handleSave = async (newTitle, newTags, newCriteria, ratings) => {
    const updatedItems = items.map((item) => {
      if (item.id === editItemId) {
        return {
          ...item,
          title: newTitle,
          tags: newTags
            .map(tag => ({ name: tag.trim() })) 
            .filter(tag => tag.name !== ''),
          criteriaRatings: newCriteria
            .map((crit, index) => ({
              name: crit.trim(),
              rating: parseFloat(ratings[index]) || 0,
            }))
            .filter(crit => crit.name.trim() !== ''), 
        };
      }
      return item;
    });

    const item = updatedItems.find(item => item.id === editItemId);
    
    if (item) {
      try {
        setModalVisible(false);
        await updateItem(item.id, item.title, item.tags, item.criteriaRatings);
        
        setItems(updatedItems);
        
      } catch (error) {
        console.error("Error updating item:", error);
      }
    }
};

  return (
    <SafeAreaView style={{ paddingBottom: '15%' }} className="flex-1 bg-background px-4 py-6 pt-14">

      {/* SearchBar */}
      <View>
        <View className="my-6" style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            ref={searchInputRef}
            placeholder="Search..."
            className="border-2 border-neutral rounded-full px-4 py-2 text-neutral flex-1 self-center"
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
          <TouchableOpacity onPress={() => {
            if (searchQuery) {
              setSearchQuery('');
            } else {
              searchInputRef.current.focus();
            }
          }}
          >
            <Image
              source={searchQuery ? icons.erase : icons.search}
              resizeMode='contain'
              style={{
                width: 24,
                height: 24,
                tintColor: '#424242',
                marginLeft: 8,
                alignSelf: 'center',
              }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Order and Filter Buttons */}
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
      </View>

      {/* Filter By */}
      {isTagsVisible && (
        <View className="flex-wrap flex-row bg-primaryLight rounded-lg p-4 mb-4">
          <View className="flex-row flex-wrap justify-center items-center">
            {allTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                onPress={() => toggleTagSelection(tag)}
                className={`border border-neutral p-3 rounded-lg mb-2 mr-2 ${selectedTags.includes(tag) ? 'bg-secondary' : 'bg-background'}`}
              >
                <Text className={`${selectedTags.includes(tag) ? 'text-background' : 'text-neutral'}`}>{tag}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setSelectedTags([])}
              className="border border-neutral p-3 rounded-lg mb-2 mr-2 bg-accent"
            >
              <Text className="text-neutral">Reset All Tags</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Order By */}
      {isOrderByVisible && (
        <View className="bg-primaryLight rounded-lg p-4 mb-4">
          <View className="flex-row flex-wrap justify-center items-center">
            <TouchableOpacity
              onPress={() => setOrderBy('ratingAsc')}
              className={`border p-3 rounded-lg mb-2 mr-2 ${orderBy === 'ratingAsc' ? 'bg-secondary' : 'bg-white'}`}
            >
              <Text className={`${orderBy === 'ratingAsc' ? 'text-white' : 'text-black'}`}>Rating (Ascending)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setOrderBy('ratingDesc')}
              className={`border p-3 rounded-lg mb-2 mr-2 ${orderBy === 'ratingDesc' ? 'bg-secondary' : 'bg-white'}`}
            >
              <Text className={`${orderBy === 'ratingDesc' ? 'text-white' : 'text-black'}`}>Rating (Descending)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setOrderBy('alphabetical')}
              className={`border p-3 rounded-lg mb-2 mr-2 ${orderBy === 'alphabetical' ? 'bg-secondary' : 'bg-white'}`}
            >
              <Text className={`${orderBy === 'alphabetical' ? 'text-white' : 'text-black'}`}>Alphabetical</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setOrderBy('random')}
              className={`border p-3 rounded-lg mb-2 mr-2 ${orderBy === 'random' ? 'bg-secondary' : 'bg-white'}`}
            >
              <Text className={`${orderBy === 'random' ? 'text-white' : 'text-black'}`}>Random</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* List of Items */}
      <ScrollView>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <FlatList
            data={leftColumnItems}
            renderItem={renderItem}
            keyExtractor={(item, index) => 'left-' + index.toString()}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
          <FlatList
            data={rightColumnItems}
            renderItem={renderItem}
            keyExtractor={(item, index) => 'right-' + index.toString()}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      {/* Modal */}
      <ItemFormModal
        typeOfModal="create"
        title={title}
        tags={tags.map(tag => ({ name: tag }))}
        criteria={criteria.map((name, index) => ({ name, rating: ratings[index] ? parseFloat(ratings[index]) : 0 }))}
        isVisible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
};

export default Grades;
