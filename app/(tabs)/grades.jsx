import { 
  SafeAreaView, 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  Image,
  Modal } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import ItemInfoCard from '../../components/ItemInfoCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { icons } from '../../constants';
import { useFocusEffect } from '@react-navigation/native';

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
    const jsonValue = await AsyncStorage.getItem('@items');
    const storedItems = jsonValue != null ? JSON.parse(jsonValue) : [];
    setItems(storedItems);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadItems(); 
    }, [])
  );

  const allTags = [...new Set(items.flatMap(item => item.tags))];

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

  const calculateAverageRating = (criteriaRatings) => {
    const total = criteriaRatings.reduce((sum, { rating }) => sum + rating, 0);
    return total / criteriaRatings.length;
  };

  const filteredAndSortedItems = items
    .filter((item) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !item.title.toLowerCase().includes(query) &&
          !item.tags.some((tag) => tag.toLowerCase().includes(query)) &&
          !item.criteria.some((criteria) =>
            criteria.name.toLowerCase().includes(query)
          )
        ) {
          return false;
        }
      }

      if (selectedTags.length > 0 && !selectedTags.every(tag => item.tags.includes(tag))) {
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
          return calculateAverageRating(a.criteria) - calculateAverageRating(b.criteria);
        case 'ratingDesc':
          return calculateAverageRating(b.criteria) - calculateAverageRating(a.criteria);
        default:
          return 0;
      }
    });

    const renderItem = ({ item }) => (
      <View style={{ flex: 1, margin: 10 }}>
        <ItemInfoCard
          id={item.id}
          title={item.title}
          tags={item.tags}
          criteriaRatings={item.criteria}
          showButtons={true}
          onDelete={() => handleDeleteItem(item.id)} 
          onUpdate={() => handleUpdateItem(item)} 
        />
      </View>
    );    

  const handleDeleteItem = async (id) => {
    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);
  
    await AsyncStorage.setItem('@items', JSON.stringify(updatedItems));
  };

  const handleUpdateItem = (item) => {
    setEditItemId(item.id);
    setTitle(item.title);
    setTags([...item.tags]);
    setCriteria(item.criteria.map(crit => crit.name));
    setRatings(item.criteria.map(crit => String(crit.rating)));
    setModalVisible(true);
  };

  const handleSave = async () => {
    const updatedItems = items.map((item) => {
      if (item.id === editItemId) {
        return {
          ...item,
          title,
          tags: tags.filter(tag => tag),  
          criteria: criteria.map((name, index) => ({
            name,
            rating: parseFloat(ratings[index]) || 0,  
          })).filter(crit => crit.name), 
        };
      }
      return item;
    });
  
    setItems(updatedItems);
    await AsyncStorage.setItem('@items', JSON.stringify(updatedItems));
    setModalVisible(false); 
  };
  

  return (
    <SafeAreaView style={{paddingBottom:'10%'}} className="flex-1 bg-background px-4 py-6 pt-14">
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

      {isTagsVisible && (
        <View className="flex-wrap flex-row bg-primaryLight rounded-lg p-4 mb-4">
          <View className="flex-row flex-wrap justify-center items-center">
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

      <FlatList
        data={filteredAndSortedItems}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        numColumns={2}
      />
      <Modal animationType="slide" transparent={false} visible={modalVisible}>
        <View className="flex-1 justify-center p-6 bg-backgroundAnti">
          <Text className="text-2xl font-pextrabold mb-4 self-center">
            New Tasting
          </Text>
          <Text className="font-pbold mb-2 mx-5 text-primary">Title</Text>
          <TextInput
            placeholder="Title"
            placeholderTextColor="#424242"
            value={title}
            onChangeText={setTitle}
            className="text-secondaryLight border border-neutral py-2 px-4 mb-4 rounded bg-background font-psemibold"
          />
          <Text className="font-pbold mb-2 mx-5 text-primary">Tags</Text>

          <TextInput
            placeholder="Tag 1"
            placeholderTextColor="#424242"
            value={tags[0]}
            onChangeText={(text) => {
              const newTags = [...tags];
              newTags[0] = text;
              setTags(newTags);
            }}
            className="text-secondaryLight border border-neutral py-2 px-4 mb-2 rounded bg-background font-psemibold"
          />

          {tags[0] ? (
            <TextInput
              placeholder="Tag 2"
              placeholderTextColor="#424242"
              value={tags[1]}
              onChangeText={(text) => {
                const newTags = [...tags];
                newTags[1] = text;
                setTags(newTags);
              }}
              className="text-secondaryLight border border-neutral py-2 px-4 mb-2 rounded bg-background font-psemibold"
            />
          ) : null}

          {tags[1] ? (
            <TextInput
              placeholder="Tag 3"
              placeholderTextColor="#424242"
              value={tags[2]}
              onChangeText={(text) => {
                const newTags = [...tags];
                newTags[2] = text;
                setTags(newTags);
              }}
              className="text-secondaryLight border border-neutral py-2 px-4 mb-4 rounded bg-background font-psemibold"
            />
          ) : null}

          <View className="flex-row justify-between">
            <Text className="font-pbold mb-2 mx-5 text-primary">Criterias</Text>
            <Text className="font-pbold mb-2 mx-7 text-primary">Rating</Text>
          </View>
          <View className="flex-row items-center mb-2">
            <TextInput
              placeholder="Criteria 1"
              placeholderTextColor="#424242"
              value={criteria[0]}
              onChangeText={(text) => {
                const newCriteria = [...criteria];
                newCriteria[0] = text;
                setCriteria(newCriteria);
              }}
              className="text-secondaryLight border border-neutral py-2 px-4 mb-2 rounded bg-background font-psemibold flex-1 mr-2 align"
            />
            <TextInput
              placeholder="(0-5)"
              placeholderTextColor="#424242"
              value={ratings[0]}
              keyboardType="numeric"
              onChangeText={(text) => {
                const newRatings = [...ratings];
                newRatings[0] = text;
                setRatings(newRatings);
              }}
              className="text-secondaryLight border border-neutral py-2 px-4 mb-2 rounded bg-background font-psemibold w-24"
            />
          </View>

          {criteria[0] ? (
            <View className="flex-row items-center mb-2">
              <TextInput
                placeholder="Criteria 2"
                placeholderTextColor="#424242"
                value={criteria[1]}
                onChangeText={(text) => {
                  const newCriteria = [...criteria];
                  newCriteria[1] = text;
                  setCriteria(newCriteria);
                }}
                className="text-secondaryLight border border-neutral py-2 px-4 mb-2 rounded bg-background font-psemibold flex-1 mr-2"
              />
              <TextInput
                placeholder="(0-5)"
                placeholderTextColor="#424242"
                value={ratings[1]}
                keyboardType="numeric"
                onChangeText={(text) => {
                  const newRatings = [...ratings];
                  newRatings[1] = text;
                  setRatings(newRatings);
                }}
                className="text-secondaryLight border border-neutral py-2 px-4 mb-2 rounded bg-background font-psemibold w-24"
              />
            </View>
          ) : null}

          {criteria[1] ? (
            <View className="flex-row items-center mb-2">
              <TextInput
                placeholder="Criteria 3"
                placeholderTextColor="#424242"
                value={criteria[2]}
                onChangeText={(text) => {
                  const newCriteria = [...criteria];
                  newCriteria[2] = text;
                  setCriteria(newCriteria);
                }}
                className="text-secondaryLight border border-neutral py-2 px-4 mb-2 rounded bg-background font-psemibold flex-1 mr-2"
              />
              <TextInput
                placeholder="(0-5)"
                placeholderTextColor="#424242"
                value={ratings[2]}
                keyboardType="numeric"
                onChangeText={(text) => {
                  const newRatings = [...ratings];
                  newRatings[2] = text;
                  setRatings(newRatings);
                }}
                className="text-secondaryLight border border-neutral py-2 px-4 mb-2 rounded bg-background font-psemibold w-24"
              />
            </View>
          ) : null}

          <View className="flex-row justify-end mb-4">
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="bg-secondaryLight rounded-full px-6 py-4 mx-3"
            >
              <Text className="text-xl font-pbold text-primary">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              className="bg-primary rounded-full px-6 py-4 mx-3"
            >
              <Text className="text-xl font-pbold text-secondaryLight">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Grades;
