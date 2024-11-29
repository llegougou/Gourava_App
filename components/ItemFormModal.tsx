import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert, KeyboardAvoidingView, ScrollView, Platform, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLanguage} from './LanguageContext';
import { icons } from "../constants";

interface Tag {
    name: string;
}

interface Criterion {
    name: string;
    rating: number;
}


interface Template {
    name: string;
    tags: string[];
    criteria: string[];
}

interface FormModalProps {
    typeOfModal: string;
    title: string;
    tags: Tag[];
    criteria: Criterion[];
    templates?: Template[];
    templateChoice: boolean;
    isVisible: boolean;
    onCancel: () => void;
    onSave: (title: string, tags: string[], criteria: string[], criteriaratings: string[]) => void;
}

const ItemFormModal = ({ typeOfModal, title, tags, templates, templateChoice, criteria, isVisible, onCancel, onSave }: FormModalProps) => {
    const [newTitle, setTitle] = useState(title);
    const [newTags, setTags] = useState(tags.map(tag => tag.name));
    const [newCriteria, setCriteria] = useState(criteria.map(criterion => criterion.name));
    const [ratings, setRatings] = useState(criteria.map(criterion => criterion.rating.toString()));
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [selectedTemplateName, setSelectedTemplateName] = useState('')

    const { languageData } = useLanguage();

    useEffect(() => {
        setTitle(title);
        setTags(tags.map(tag => tag.name));
        setCriteria(criteria.map(criterion => criterion.name));
        setRatings(criteria.map(criterion => criterion.rating.toString()));
    }, [title, tags, criteria, isVisible]);

    let modalTitle = '';
    switch (typeOfModal) {
        case 'customCreate':
            modalTitle = languageData.screens.itemFormModal.text.addNewItem;
            break;
        case 'update':
            modalTitle = languageData.screens.itemFormModal.text.updateItem;
            break;
    }

    const handleTemplateSelect = (templateTitle: string) => {
        const template = templates?.find(t => t.name === templateTitle);
        if (template) {
            setSelectedTemplate(template);
            setTags(template.tags);
            setCriteria(template.criteria);
            setSelectedTemplateName(template.name)
        }
    };

    const handleSave = () => {
        if (validateForm()) {
            onSave(newTitle, newTags, newCriteria, ratings);
            resetForm();
        }
    };

    const validateForm = () => {
        const isTitleValid = newTitle.trim() !== "";
        const hasAtLeastOneTag = newTags.some(tag => tag.trim() !== "");

        if (!isTitleValid || !hasAtLeastOneTag) {
            Alert.alert(languageData.common.error, languageData.screens.itemFormModal.errors.missingTitleAndTag);
            return false;
        }

        const isRatingsValid = newCriteria.every((criterion, index) => {
            if (criterion.trim()) {
                const normalizedRating = ratings[index].replace(',', '.');
                const parsedRating = parseFloat(normalizedRating);
                return (
                    !isNaN(parsedRating) &&
                    parsedRating >= 0 &&
                    parsedRating <= 5 &&
                    (parsedRating * 2) % 1 === 0
                );
            }
            return true;
        });

        if (!isRatingsValid) {
            Alert.alert(languageData.common.error, languageData.screens.itemFormModal.errors.invalidRatings);
            return false;
        }

        return true;
    };

    const handleCancel = () => {
        onCancel();
        resetForm();
    };

    const resetForm = () => {
        setSelectedTemplate(null);
        setTitle("");
        setTags(["", "", ""]);
        setCriteria(["", "", ""]);
        setRatings(["", "", ""]);
        setSelectedTemplateName('');
    };

    return (
        <Modal animationType="slide" transparent={false} visible={isVisible}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalContainer}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.modalTitle}>{modalTitle}</Text>

                    {templateChoice && templates && templates.length > 0 && (
                        <>
                            <Text style={styles.catTitle}>{languageData.screens.itemFormModal.text.useTemplate}</Text>
                            <View style={styles.pickerRow}>
                                <View style={styles.pickerWrapper}>
                                    <Picker
                                        selectedValue={selectedTemplate?.name || 'noTemplate'}
                                        onValueChange={(value) => handleTemplateSelect(value)}
                                        style={[styles.picker, { color: selectedTemplateName ? '#FF7043' : '#424242' }]} 
                                    >
                                        <Picker.Item label={languageData.screens.itemFormModal.text.selectTemplate} value="noTemplate" />
                                        {templates.map(template => (
                                            <Picker.Item key={template.name} label={template.name} value={template.name} />
                                        ))}
                                    </Picker>
                                </View>

                                {selectedTemplateName !== '' && (
                                    <TouchableOpacity style={styles.erase} onPress={resetForm}>
                                        <Image source={icons.erase} style={styles.eraseIcon} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </>
                    )}

                    <Text style={styles.catTitle}>{languageData.common.title.onecaps}</Text>
                    <TextInput
                        placeholder={languageData.common.title.onecaps}
                        placeholderTextColor="#424242"
                        value={newTitle}
                        onChangeText={setTitle}
                        style={styles.input}
                    />

                    <Text style={styles.catTitle}>{languageData.common.tag.plural}</Text>
                    <TextInput
                        placeholder={languageData.common.placeholders.tag1}
                        placeholderTextColor="#424242"
                        value={newTags[0]}
                        onChangeText={(text) => {
                            const updatedTags = [...newTags];
                            updatedTags[0] = text;
                            setTags(updatedTags);
                        }}
                        style={styles.input}
                    />
                    {newTags[0] && (
                        <TextInput
                            placeholder={languageData.common.placeholders.tag2}
                            placeholderTextColor="#424242"
                            value={newTags[1]}
                            onChangeText={(text) => {
                                const updatedTags = [...newTags];
                                updatedTags[1] = text;
                                setTags(updatedTags);
                            }}
                            style={styles.input}
                        />
                    )}
                    {newTags[1] && (
                        <TextInput
                            placeholder={languageData.common.placeholders.tag3}
                            placeholderTextColor="#424242"
                            value={newTags[2]}
                            onChangeText={(text) => {
                                const updatedTags = [...newTags];
                                updatedTags[2] = text;
                                setTags(updatedTags);
                            }}
                            style={styles.input}
                        />
                    )}

                    <View style={styles.criteriaContainer}>
                        <Text style={styles.catTitle}>{languageData.common.criteria.plural}</Text>
                        <Text style={styles.catTitle}>{languageData.screens.itemFormModal.text.rating}</Text>
                    </View>

                    <View style={styles.criteriaRow}>
                        <TextInput
                            placeholder={languageData.common.placeholders.criteria1}
                            placeholderTextColor="#424242"
                            value={newCriteria[0]}
                            onChangeText={(text) => {
                                const updatedCriteria = [...newCriteria];
                                updatedCriteria[0] = text;
                                setCriteria(updatedCriteria);
                            }}
                            style={[styles.input, styles.criteriaInput]}
                        />
                        <TextInput
                            placeholder="(0-5)"
                            placeholderTextColor="#424242"
                            value={ratings[0]}
                            keyboardType="numeric"
                            onChangeText={(text) => {
                                const updatedRatings = [...ratings];
                                updatedRatings[0] = text;
                                setRatings(updatedRatings);
                            }}
                            style={[styles.input, styles.ratingInput]}
                        />
                    </View>

                    {newCriteria[0] && (
                        <View style={styles.criteriaRow}>
                            <TextInput
                                placeholder={languageData.common.placeholders.criteria2}
                                placeholderTextColor="#424242"
                                value={newCriteria[1]}
                                onChangeText={(text) => {
                                    const updatedCriteria = [...newCriteria];
                                    updatedCriteria[1] = text;
                                    setCriteria(updatedCriteria);
                                }}
                                style={[styles.input, styles.criteriaInput]}
                            />
                            <TextInput
                                placeholder="(0-5)"
                                placeholderTextColor="#424242"
                                value={ratings[1]}
                                keyboardType="numeric"
                                onChangeText={(text) => {
                                    const updatedRatings = [...ratings];
                                    updatedRatings[1] = text;
                                    setRatings(updatedRatings);
                                }}
                                style={[styles.input, styles.ratingInput]}
                            />
                        </View>
                    )}

                    {newCriteria[1] && (
                        <View style={styles.criteriaRow}>
                            <TextInput
                                placeholder={languageData.common.placeholders.criteria3}
                                placeholderTextColor="#424242"
                                value={newCriteria[2]}
                                onChangeText={(text) => {
                                    const updatedCriteria = [...newCriteria];
                                    updatedCriteria[2] = text;
                                    setCriteria(updatedCriteria);
                                }}
                                style={[styles.input, styles.criteriaInput]}
                            />
                            <TextInput
                                placeholder="(0-5)"
                                placeholderTextColor="#424242"
                                value={ratings[2]}
                                keyboardType="numeric"
                                onChangeText={(text) => {
                                    const updatedRatings = [...ratings];
                                    updatedRatings[2] = text;
                                    setRatings(updatedRatings);
                                }}
                                style={[styles.input, styles.ratingInput]}
                            />
                        </View>
                    )}

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={handleCancel} style={[styles.button, styles.cancelButton]}>
                            <Text style={styles.cancelButtonText}>{languageData.common.cancel.onecaps}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSave} style={[styles.button, styles.saveButton]}>
                            <Text style={styles.saveButtonText}>{languageData.common.save.onecaps}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        paddingHorizontal: 24,
        paddingVertical: 10,
        backgroundColor: '#DCC8AA',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    pickerWrapper: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#424242',
        borderRadius: 8,
        backgroundColor: '#FFF3E0',
        height: 48,
        justifyContent: 'center', 
    },
    picker: {
        fontSize: 16,
        paddingHorizontal: 12,
        height: 48,
        justifyContent: 'center', 
    },
    pickerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignContent:'center',
        marginBottom: 16,
        marginHorizontal: 20,
    },
    erase: {
        padding: 8, 
        justifyContent: 'center',
        alignItems: 'center',
        height: 48,
    },
    eraseIcon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
        tintColor:'#424242'
    },
    catTitle: {
        marginBottom: 8,
        marginHorizontal: 20,
        fontWeight: 'bold',
        color: '#00796B',
    },
    input: {
        marginHorizontal: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#424242',
        borderRadius: 8,
        backgroundColor: '#FFF3E0',
        fontSize: 16,
        marginBottom: 12,
        color: '#FF7043',
    },
    criteriaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    criteriaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    criteriaInput: {
        flex: 1,
        marginRight: 0,
    },
    ratingInput: {
        width: 60,
        marginRight: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 6,
        marginHorizontal: 8,
    },
    cancelButton: {
        backgroundColor: '#FF8B66',
    },
    saveButton: {
        backgroundColor: '#00796B',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#424242',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#DCC8AA',
    },
});

export default ItemFormModal;
