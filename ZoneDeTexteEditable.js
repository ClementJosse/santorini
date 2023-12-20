import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';

const ZoneDeTexteEditable = ({ onTextChange }) => {
  const [contenu, setContenu] = useState('');

  const handleTextChange = (text) => {
    setContenu(text);
    // Appel de la fonction de rappel avec le contenu de la zone de texte
    onTextChange(text);
  };

  return (
    <View>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10 }}
        placeholder="Entrez le code ici"
        onChangeText={handleTextChange}
        value={contenu}
        multiline
        numberOfLines={4}
      />
      {/* Pas besoin du bouton ici, car on ne console.log pas directement depuis ce composant */}
    </View>
  );
};

export default ZoneDeTexteEditable;
