import React, { useEffect, useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useLanguage } from './LanguageContext';
import { icons } from "../constants"; // Assuming icons contains the paths to the flags

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

function LanguageSwitcher() {
    const { languageData, switchLanguage } = useLanguage();
    const [currentLanguage, setCurrentLanguage] = useState('en');

    useEffect(() => {
        setCurrentLanguage(languageData.language === 'English' ? 'en' : 'fr');
    }, [languageData]);

    const toggleLanguage = () => {
        const nextLanguage = currentLanguage === 'en' ? 'fr' : 'en';
        switchLanguage(nextLanguage);
        setCurrentLanguage(nextLanguage);
    };

    const nextLanguage = currentLanguage === 'en' ? 'fr' : 'en';
    const flagToShow = nextLanguage === 'en' ? icons.uk : icons.france;

    return (
        <View style={styles.lngMenu}>
            <TouchableOpacity style={styles.flagButton} onPress={toggleLanguage}>
                <Image
                    source={flagToShow}
                    style={styles.flagIcon}
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    lngMenu: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10
    },
    flagButton: {
        backgroundColor: '#DCC8AA',
        borderRadius: 8,
        padding: 3,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        marginRight: 15,
        marginTop: 15,
    },
    flagIcon: {
        width: 0.06 * windowHeight,
        height: 0.09 * windowWidth,
        aspectRatio: 'auto',
        resizeMode: 'contain',
    }
});

export default LanguageSwitcher;
