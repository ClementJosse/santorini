import React, { useState } from 'react';
import { View, TextInput } from 'react-native';

const ZoneDeTexteEditable = ({ onTextChange }) => {
  const [contenu, setContenu] = useState('');

  const handleTextChange = (text) => {
    const texteEnMajuscules = text.toUpperCase(); // Conversion en majuscules
    setContenu(texteEnMajuscules);
    // Appel de la fonction de rappel avec le contenu de la zone de texte en majuscules
    onTextChange(texteEnMajuscules);
  };

  return (
    <View>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10, backgroundColor: '#ffffff',}}
        placeholder="Entrez le code ici"
        onChangeText={handleTextChange}
        value={contenu}
        multiline
        numberOfLines={4}
      />
    </View>
  );
};

export default ZoneDeTexteEditable;
