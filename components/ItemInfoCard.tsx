import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert, StyleSheet, LayoutChangeEvent, Animated } from 'react-native';

import { useLanguage } from './LanguageContext';
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
  onDelete: () => void;
  onUpdate: () => void;
}

const ItemInfoCard = ({ title, tags, criteriaRatings, onDelete, onUpdate }: ItemInfoCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [rotationAnim] = useState(new Animated.Value(0));
  const [buttonSlideAnim] = useState(new Animated.Value(50));

  const { languageData } = useLanguage();

  const CRITERIA_MAX_LENGTH = 8;

  const toggleExpansion = () => {
    setIsExpanded((prev) => !prev);

    Animated.parallel([
      Animated.timing(buttonSlideAnim, {
        toValue: isExpanded ? 50 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(rotationAnim, {
        toValue: isExpanded ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  };

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['90deg', '0deg']
  });

  const handleDelete = () => {
    const confirmDeleteMessage = `${languageData.screens.templates.text.confirmDeleteMessage} ${title} ?`;
    Alert.alert(
      languageData.screens.templates.text.confirmDeleteTitle,
      confirmDeleteMessage,
      [
        { text: languageData.common.cancel.onecaps, style: "cancel" },
        { text: languageData.common.ok.onecaps, onPress: onDelete }
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

  const renderCompactedStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        <Text style={styles.criteriaText}>
          {rating} <Image source={icons.star} style={[styles.star, styles.yellowStar]} />
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {title}
        </Text>
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
        {criteriaRatings.map((criteria, index) => {
          const isCriteriaTooLong = criteria.name.length > CRITERIA_MAX_LENGTH;

          return (
            <View key={index} style={styles.criteriaRow}>
              {criteria.name && criteria.name.trim() ? (
                <>
                  <Text
                    style={[styles.criteriaText, isCriteriaTooLong ? { width: '100%' } : {}]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {criteria.name}
                  </Text>
                  {isCriteriaTooLong
                    ? renderCompactedStars(criteria.rating)
                    : renderStars(criteria.rating)}
                </>
              ) : null}
            </View>
          );
        })}
      </View>

      <TouchableOpacity style={styles.bottomRow} onPress={toggleExpansion}>
        <Animated.View style={[
          styles.buttonContainer,
          {
            transform: [{ translateX: buttonSlideAnim }]
          }
        ]}>
          {isExpanded && (
            <>
              <TouchableOpacity onPress={onUpdate} style={styles.updateButton}>
                <Image source={icons.update} style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                <Image source={icons.deleteIcon} style={styles.icon} />
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
        <Animated.Image
          source={icons.navArrow}
          style={[styles.navArrow, { transform: [{ rotate: rotation }] }]} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderRadius: 8,
    backgroundColor: '#DCC8AA',
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
    color: '#424242',
    fontSize: 20
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flex: 1,
  },
  navArrow: {
    width: 20,
    height: 20,
    tintColor: '#424242',
    margin: 8,
    zIndex:1
  },
  updateButton: {
    width: 35,
    height: 35,
    borderRadius: 25,
    backgroundColor: '#00796B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#424242'
  },
  deleteButton: {
    width: 35,
    height: 35,
    borderRadius: 25,
    backgroundColor: '#FF7043',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    borderWidth: 1,
    borderColor: '#424242'
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
    color: '#424242',
  },
  criteriaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    overflow: 'hidden'
  },
  criteriaText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 6,
    flexShrink: 1,
    color: '#424242',
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
  compactRating: {
    fontSize: 14,
    fontWeight: '500',
    color: '#424242',
    marginLeft: 6,
  },
  yellowStar: {
    tintColor: '#FF7043',
  },
  grayStar: {
    tintColor: '#424242',
  },
});

export default ItemInfoCard;
