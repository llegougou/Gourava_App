import React, { useEffect, useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useLanguage } from './LanguageContext';
import { icons } from "../constants"; 

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
        borderRadius: 8,
        marginRight: 15,
        marginTop: 15,
        paddingVertical:3,
        paddingHorizontal:5,
        borderWidth:1.5,
        borderColor:'#424242',
    },
    flagIcon: {
        width: 0.05 * windowHeight,
        height: 0.08 * windowWidth,
        aspectRatio: 'auto',
        resizeMode: 'cover',
    }
});

export default LanguageSwitcher;
