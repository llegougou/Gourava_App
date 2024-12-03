import { StatusBar } from "expo-status-bar";
import {
    SafeAreaView,
    Text,
    View,
    FlatList,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    Animated
} from 'react-native';
import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useLanguage } from '../../components/LanguageContext';

import { icons } from '../../constants';
import { createTemplate, getTemplates, getTemplateById, updateTemplate, deleteTemplate } from '../../utils/database';
import TemplateFormModal from '../../components/TemplateFormModal';

const Templates = () => {
    const [templates, setTemplates] = useState([]);
    const [expandedTemplateId, setExpandedTemplateId] = useState(null);

    const [modalCreationVisible, setModalCreationVisible] = useState(false);
    const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
    const [title, setTitle] = useState("");
    const [tags, setTags] = useState(["", "", ""]);
    const [criteria, setCriteria] = useState(["", "", ""]);
    const [updateTitle, setUpdateTitle] = useState("");
    const [updateTags, setUpdateTags] = useState(["", "", ""]);
    const [updateCriteria, setUpdateCriteria] = useState(["", "", ""]);
    const [updateTemplateId, setUpdateTemplateId] = useState("");

    const { languageData } = useLanguage();
    const [rotationAnims, setRotationAnims] = useState({});
    const [slideAnims, setSlideAnims] = useState({});
    const [heights, setHeights] = useState ({});

    const loadTemplates = async () => {
        try {
            const fetchedTemplates = await getTemplates();
            setTemplates(fetchedTemplates);
    
            const anims = {};
            const slides = {};
            const heights = {};
            
            fetchedTemplates.forEach(template => {
                anims[template.id] = rotationAnims[template.id] || new Animated.Value(0);
                slides[template.id] = slideAnims[template.id] || new Animated.Value(0);
    
                const numTags = template.tags.length;
                const numCriteria = template.criteria.length;
                const height = Math.max(numCriteria, numTags) * 20 + 40;
    
                heights[template.id] = height;
            });
    
            setRotationAnims(anims);
            setSlideAnims(slides);
            setHeights(heights);
        } catch (error) {
            console.error("Error fetching templates:", error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadTemplates();
        }, [])
    );

    const toggleExpandTemplate = (id) => {
        const isExpanded = expandedTemplateId === id;
    
        if (isExpanded) {
            Animated.timing(rotationAnims[id], {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
    
            Animated.timing(slideAnims[id], {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }).start(() => {
                setExpandedTemplateId(null);
            });
        } else {
            if (expandedTemplateId !== null) {
                Animated.timing(rotationAnims[expandedTemplateId], {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
    
                Animated.timing(slideAnims[expandedTemplateId], {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: false,
                }).start(() => {
                    slideAnims[expandedTemplateId].setValue(0);
                });
            }
    
            Animated.timing(rotationAnims[id], {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
    
            Animated.timing(slideAnims[id], {
                toValue: 1,
                duration: 300,
                useNativeDriver: false,
            }).start();
    
            setExpandedTemplateId(id);
        }
    };
    
    const handleCreation = async (newTitle, newTags, newCriteria) => {
        try {
            const filteredTags = newTags.filter(tag => tag.trim() !== "");
            const filteredCriteria = newCriteria.filter(criterion => criterion.trim() !== "");

            setModalCreationVisible(false);

            await createTemplate(newTitle, filteredTags, filteredCriteria);

            loadTemplates();
        } catch (error) {
            console.error("Error saving Template:", error);
        }
    };

    const handleDelete = (templateId, templateName) => {
        const confirmDeleteMessage = `${languageData.screens.templates.text.confirmDeleteMessage} ${templateName} ?`;
        Alert.alert(
            languageData.screens.templates.text.confirmDeleteTitle,
            confirmDeleteMessage,
            [
                { text: languageData.common.cancel.onecaps, style: "cancel" },
                { text: languageData.common.ok.onecaps, onPress: () => onDelete(templateId) }
            ]
        );
    };

    const onDelete = async (templateId) => {
        try {
            await deleteTemplate(templateId);

            setTemplates(prevTemplates => prevTemplates.filter(template => template.id !== templateId));

            if (expandedTemplateId === templateId) {
                setExpandedTemplateId(null);
            }

        } catch (error) {
            console.error('Error deleting template:', error);
        }
    };

    const handleUpdate = async (templateId) => {
        try {
            const template = await getTemplateById(templateId);

            if (template) {
                setUpdateTitle(template.name);
                setUpdateTags(template.tags.map(tag => tag.name));
                setUpdateCriteria(template.criteria.map(criterion => criterion.name));

                setModalUpdateVisible(true);
                setUpdateTemplateId(templateId);
                loadTemplates();
            } else {
                console.error("Template not found for update.");
            }
        } catch (error) {
            console.error("Error fetching template data for update:", error);
        }
    };

    const handleSaveUpdate = async (newTitle, newTags, newCriteria) => {
        try {
            const filteredTags = newTags.filter(tag => tag.trim() !== "");
            const filteredCriteria = newCriteria.filter(criterion => criterion.trim() !== "");

            setModalUpdateVisible(false);

            await updateTemplate(updateTemplateId, newTitle, filteredTags, filteredCriteria);

            loadTemplates();
        } catch (error) {
            console.error("Error updating template:", error);
        }
    };

    const renderTemplate = ({ item, index }) => {
        const isExpanded = expandedTemplateId === item.id;
        const backgroundColor = index % 2 === 0 ? 'bg-backgroundAnti elevation' : 'bg-background';
    
        const rotation = rotationAnims[item.id]?.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '180deg'],
        }) || '0deg';

        const opacity = slideAnims[item.id]?.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0, 1],
        }) || 0;

        const maxHeight = heights[item.id] || 0;

        return (
            <View className={`p-4 ${backgroundColor}`}>
                {/* Header with Touchable to toggle */}
                <TouchableOpacity
                    className="flex-row justify-between items-center px-4"
                    onPress={() => toggleExpandTemplate(item.id)}
                >
                    <View className="flex-row justify-between items-center flex-1">
                        <Text className="text-neutral text-2xl font-pbold">{item.name}</Text>
                    </View>
                    <Animated.Image
                        source={icons.navArrow}
                        style={{
                            width: 14,
                            height: 14,
                            transform: [{ rotate: rotation }],
                            tintColor: '#424242',
                        }}
                    />
                </TouchableOpacity>
    
                {/* Sliding Animated View */}
                <Animated.View
                    style={{
                        height: slideAnims[item.id]?.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0,maxHeight], 
                        }),
                        opacity, 
                        overflow: 'hidden', 
                    }}
                >
                    {isExpanded && (
                        <View className="px-4 mt-2 mx-6">
                            <View className="flex-row justify-between items-start">
                                {/* Tags List */}
                                <View className="flex-1 mr-4">
                                    <Text className="text-neutral font-pextrabold mb-2">
                                        {languageData.common.tag.variations[4]}
                                    </Text>
                                    {item.tags.map((tag, index) => (
                                        <Text key={index} className="text-neutral font-pmedium mb-1 ml-2">
                                            {tag}
                                        </Text>
                                    ))}
                                </View>
    
                                {/* Criteria List */}
                                <View className="flex-1">
                                    <Text className="text-neutral font-pextrabold mb-2">
                                        {languageData.common.criteria.variations[4]}
                                    </Text>
                                    {item.criteria.map((criterion, index) => (
                                        <Text key={index} className="text-neutral font-pmedium mb-1 ml-2">
                                            {criterion}
                                        </Text>
                                    ))}
                                </View>

                                {/* Action Buttons */}
                                <View className="flex-row flex-1 justify-center items-center h-full space-x-2 ml-6">
                                    <TouchableOpacity
                                        className="bg-primaryLight p-2 rounded-full border border-neutral mr-4"
                                        onPress={() =>
                                            handleUpdate(item.id)
                                        }
                                    >
                                        <Image
                                            source={icons.update}
                                            style={{
                                                width: 20,
                                                height: 20,
                                                tintColor: '#424242',
                                            }}
                                        />
                                    </TouchableOpacity>
    
                                    <TouchableOpacity
                                        className="bg-secondary p-2 rounded-full border border-neutral"
                                        onPress={() => handleDelete(item.id, item.name)}
                                    >
                                        <Image
                                            source={icons.deleteIcon}
                                            style={{
                                                width: 20,
                                                height: 20,
                                                tintColor: '#424242',
                                            }}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                </Animated.View>
            </View>
        );
    };
    
    return (
        <SafeAreaView className="flex-1 bg-background pt-14 pb-20">
            <StatusBar backgroundColor='#DCC8AA' barStyle="dark-content" style="dark" />
            <TouchableOpacity
                className="bg-primary rounded-lg px-6 py-4 mx-4 my-8 elevation-md"
                onPress={() => setModalCreationVisible(true)}
            >
                <Text className="text-xl font-bold text-background text-center">{languageData.screens.templates.text.createButton}</Text>
            </TouchableOpacity>

            <ScrollView>
                <View>
                    <View className="bg-secondary elevation py-4">
                        <Text className="text-neutral text-center text-xl font-pextrabold">
                            {languageData.screens.templates.text.header}
                        </Text>
                    </View>
                    <View className="bg-background border-b border-backgroundAnti">
                        <FlatList
                            data={templates}
                            renderItem={renderTemplate}
                            keyExtractor={(item) => `${item.id}`}
                            scrollEnabled={false}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* FormModal for Creation */}
            <TemplateFormModal
                typeOfModal="createTemplate"
                title={title}
                tags={tags.map(tag => ({ name: tag }))}
                criteria={criteria.map((name) => ({ name }))}
                isVisible={modalCreationVisible}
                onCancel={() => setModalCreationVisible(false)}
                onSave={handleCreation}
            />

            {/* FormModal for Update */}
            <TemplateFormModal
                typeOfModal="updateTemplate"
                templateId={updateTemplateId}
                title={updateTitle}
                tags={updateTags.map(tag => ({ name: tag }))}
                criteria={updateCriteria.map((name) => ({ name }))}
                isVisible={modalUpdateVisible}
                onCancel={() => setModalUpdateVisible(false)}
                onSave={handleSaveUpdate}
            />
        </SafeAreaView>
    );
};

export default Templates;
