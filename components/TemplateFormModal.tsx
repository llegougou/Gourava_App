import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    ScrollView,
    Platform
} from 'react-native';
import { useLanguage} from './LanguageContext';

interface Tag {
    name: string;
}

interface Criterion {
    name: string;
}

interface FormModalProps {
    typeOfModal: string;
    templateId?: string;
    title: string;
    tags: Tag[];
    criteria: Criterion[];
    isVisible: boolean;
    onCancel: () => void;
    onSave: (title: string, tags: string[], criteria: string[], templateId?: string) => void;
}

const TemplateFormModal = ({
    typeOfModal,
    templateId,
    title,
    tags,
    criteria,
    isVisible,
    onCancel,
    onSave }: FormModalProps) => {
    const [newTitle, setTitle] = useState(title);
    const [newTags, setTags] = useState(tags.map(tag => tag.name));
    const [newCriteria, setCriteria] = useState(criteria.map(criterion => criterion.name));
    const [currentTemplateId, setCurrentTemplateId] = useState(templateId)

    const { languageData } = useLanguage();

    useEffect(() => {
        setTitle(title);
        setTags(tags.map(tag => tag.name));
        setCriteria(criteria.map(criterion => criterion.name));
    }, [title, tags, criteria, isVisible]);

    let modalTitle = '';
    switch (typeOfModal) {
        case 'createTemplate':
            modalTitle = languageData.screens.templateFormModal.text.newTemplate;
            break;
        case 'updateTemplate':
            modalTitle = languageData.screens.templateFormModal.text.updateTemplate;
            break;
    }

    const handleSave = () => {
        if (validateForm()) {
            onSave(newTitle, newTags, newCriteria, templateId);
            resetForm();
        }
    };

    const validateForm = () => {
        const isTitleValid = newTitle.trim() !== "";
        const hasAtLeastOneTag = newTags.some(tag => tag.trim() !== "");

        if (!isTitleValid || !hasAtLeastOneTag) {
            Alert.alert(languageData.common.error, languageData.screens.templateFormModal.errors.missingTitleAndTag);
            return false;
        }

        return true;
    };

    const handleCancel = () => {
        onCancel();
        resetForm();
    };

    const resetForm = () => {
        setTitle("");
        setTags(["", "", ""]);
        setCriteria(["", "", ""]);
        setCurrentTemplateId("");
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
                        <Text style={styles.catTitle}>Criterias</Text>
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
        backgroundColor: '#DCC8AA',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
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

export default TemplateFormModal;
