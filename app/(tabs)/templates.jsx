import { SafeAreaView, Text, View, FlatList, ScrollView, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { icons } from '../../constants';
import { createTemplate, getTemplates, getTemplateById, updateTemplate, deleteTemplate } from '../../utils/database';
import TemplateFormModal from '../../components/TemplateFormModal';

const Templates = () => {
    const [templates, setTemplates] = useState([]);
    const [visibleTemplates, setVisibleTemplates] = useState(4);
    const [isExpandedTemplates, setIsExpandedTemplates] = useState(false);
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

    const loadTemplates = async () => {
        try {
            const fetchedTemplates = await getTemplates();
            setTemplates(fetchedTemplates);
        } catch (error) {
            console.error("Error fetching templates:", error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadTemplates();
        }, [])
    );

    const handleSeeMore = () => {
        setIsExpandedTemplates(true);
        setVisibleTemplates(templates.length);
    };

    const handleSeeLess = () => {
        setIsExpandedTemplates(false);
        setVisibleTemplates(4);
    };

    const toggleExpandTemplate = (id) => {
        setExpandedTemplateId((prevId) => (prevId === id ? null : id));
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

    const handleDelete = async (templateId) => {
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

    const renderSeeMoreGeneralButton = () => {
        return (
            <TouchableOpacity
                className="flex-row justify-center p-3"
                onPress={() => isExpandedTemplates ? handleSeeLess() : handleSeeMore()}
            >
                <Image
                    source={icons.navArrow}
                    style={{
                        width: 20,
                        height: 20,
                        transform: [{ rotate: isExpandedTemplates ? '180deg' : '0deg' }],
                        tintColor: '#424242',
                    }}
                />
            </TouchableOpacity>
        );
    };

    const renderSeeMoreTemplateButton = (item) => {
        return (
            <View className="flex-row justify-center">
                <TouchableOpacity onPress={() => toggleExpandTemplate(item.id)}>
                    <Image
                        source={icons.navArrow}
                        style={{
                            width: 14,
                            height: 14,
                            transform: [{ rotate: expandedTemplateId === item.id ? '180deg' : '0deg' }],
                            tintColor: '#424242',
                        }}
                    />
                </TouchableOpacity>
            </View>
        );
    };

    const renderItem = ({ item }) => {
        const isExpanded = expandedTemplateId === item.id;

        return (
            <View className="border-b border-neutral p-4">
                <TouchableOpacity
                    className="flex-row justify-between items-center px-4"
                    onPress={() => toggleExpandTemplate(item.id)}
                >
                    <View className="flex-row justify-between items-center flex-1">
                        <Text className="text-neutral text-2xl font-pbold">{item.name}</Text>
                    </View>

                    {renderSeeMoreTemplateButton(item)}
                </TouchableOpacity>

                {isExpanded && (
                    <View className="px-4 mt-2 mx-6">
                        <View className="flex-row justify-between items-center">
                            {/* Tags List */}
                            <View className="flex-1">
                                <Text className="text-neutral font-pextrabold mb-2">Tags:</Text>
                                {item.tags.map((tag, index) => (
                                    <Text key={index} className="text-neutral mb-1">
                                        {tag}
                                    </Text>
                                ))}
                            </View>

                            {/* Criteria List */}
                            <View className="flex-1">
                                <Text className="text-neutral font-pextrabold mb-2">Criterias:</Text>
                                {item.criteria.map((criterion, index) => (
                                    <Text key={index} className="text-neutral mb-1">
                                        {criterion}
                                    </Text>
                                ))}
                            </View>

                            {/* Action Button */}
                            <View className="flex-1 justify-end">
                                <View className="flex-row items-center space-x-2 ml-6">
                                    <TouchableOpacity
                                        className="bg-primaryLight p-2 rounded-full border border-neutral mr-4"
                                        onPress={() => handleUpdate(item.id)}
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
                                        onPress={() => handleDelete(item.id)}
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
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background pt-14 pb-20">
            <TouchableOpacity
                className="bg-primary rounded-xl px-6 py-4 mx-4 my-8 border border-neutral"
                onPress={() => setModalCreationVisible(true)}
            >
                <Text className="text-xl font-bold text-background text-center">CREATE NEW TEMPLATE</Text>
            </TouchableOpacity>

            <ScrollView>
                <View>
                    <View className="bg-backgroundAnti border border-neutral py-4">
                        <Text className="text-neutral text-center text-xl font-pextrabold">
                            TEMPLATES
                        </Text>
                    </View>
                    <View className={`bg-secondaryLight ${templates.length != 0 ? 'border border-t-0' : ''} border-neutral`}>
                        <FlatList
                            data={templates.slice(0, visibleTemplates)}
                            renderItem={renderItem}
                            keyExtractor={(item) => `${item.id}`}
                            scrollEnabled={false}
                        />
                        {templates.length > 4 && renderSeeMoreGeneralButton()}
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
