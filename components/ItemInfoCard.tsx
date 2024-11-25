import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert, StyleSheet, LayoutChangeEvent } from 'react-native';

import { icons } from '@/constants';

interface Tag {
  name: string;
}

interface Criteria {
  name: string;
  rating: number;
}

interface ItemInfoCardProps {
  title: string;
  tags: Tag[];
  criteriaRatings: Criteria[];
  showButtons?: boolean;
  onDelete: () => void;
  onUpdate: () => void
}

const ItemInfoCard = ({ title, tags, criteriaRatings, showButtons, onDelete, onUpdate }: ItemInfoCardProps) => {
  const [titleFontSize, setTitleFontSize] = useState(20);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    const maxFontSize = 20;
    const minFontSize = 14;
    const idealFontSize = Math.max(minFontSize, Math.min(maxFontSize, width / (title.length * 0.5)));
    setTitleFontSize(idealFontSize);
  };

  const handleDelete = () => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete ${title}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: onDelete }
      ]
    );
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const maxStars = 5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Image key={`star-${i}`} source={icons.star} style={[styles.star, styles.yellowStar]} />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Image key={'halfStar'} source={icons.halfStar} style={styles.star} />
      );
    }

    for (let i = stars.length; i < maxStars; i++) {
      stars.push(
        <Image key={`empty-star-${i}`} source={icons.star} style={[styles.star, styles.grayStar]} />
      );
    }

    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const isSingleWord = title.trim().split(' ').length === 1;

  return (
    <View style={styles.card}>
      <View style={styles.header} onLayout={isSingleWord ? handleLayout : undefined}>
        <Text style={[styles.title, { fontSize: isSingleWord ? titleFontSize : 16 }]} numberOfLines={isSingleWord ? 1 : undefined} adjustsFontSizeToFit>
          {title}
        </Text>
        {showButtons && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onUpdate} style={styles.updateButton}>
              <Image source={icons.update} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
              <Image source={icons.deleteIcon} style={styles.icon} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.tagsContainer}>
        <FlatList
          data={tags}
          renderItem={({ item }) => (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{item.name}</Text>
            </View>
          )}
          keyExtractor={(item, index) => item.name || index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View>
        {criteriaRatings.map((criteria, index) => (
          <View key={index} style={styles.criteriaRow}>
            {criteria.name && criteria.name.trim() ? (
              <>
                <Text style={styles.criteriaText}>{criteria.name}</Text>
                {typeof criteria.rating === 'number' && criteria.rating >= 0 && criteria.rating <= 5 && renderStars(criteria.rating)}
              </>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#DCC8AA',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    marginBottom: 4,
    borderColor: '#089889',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  updateButton: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: '#00796B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  deleteButton: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: '#FF7043',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: 'black',
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
    alignItems: 'center',
  },
  tag: {
    borderRadius: 45,
    backgroundColor: '#FFD700',
    padding: 4,
    paddingHorizontal: 6,
    marginRight: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#000',
  },
  criteriaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    overflow:'hidden'
  },
  criteriaText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 6,
    flexShrink: 1,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    width: 16,
    height: 16,
    marginRight: 2,
  },
  yellowStar: {
    tintColor: '#FF7043',
  },
  grayStar: {
    tintColor: '#424242',
  },
});

export default ItemInfoCard;
