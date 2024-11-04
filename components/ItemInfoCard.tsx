import React from 'react';
import { View, Text, FlatList } from 'react-native';

interface Criteria {
  name: string;
  rating: number;
}

interface ItemInfoCardProps {
  title: string;
  creationDate: string;
  tags: string[];
  criteriaRatings: Criteria[];
}

const ItemInfoCard = ({ title, tags, criteriaRatings }: ItemInfoCardProps) => {
  return (
    <View className="p-4 rounded-lg bg-secondary shadow-md mb-4 border" style={{ borderColor:'#089889', backgroundColor:"#DCC8AA" }}>
      <Text className="text-xl font-pbold text-center mb-1">{title}</Text>

      <View className="flex-row items-center mb-4">
        <FlatList
          data={tags}
          renderItem={({ item }) => (
            <View style={{borderRadius:45, backgroundColor: "#FFD700", padding:2,paddingHorizontal:4, marginHorizontal:2}} >
              <Text className="text-sm text-neutral mx-1">{item}</Text> 
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          horizontal
        />
      </View>

      <View>
        {criteriaRatings.map((criteria, index) => (
          <View key={index} className="flex-row justify-between py-1">
            <Text className="text-sm font-medium">{criteria.name}</Text>
            <Text className="text-sm text-gray-700">Rating: {criteria.rating}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ItemInfoCard;
