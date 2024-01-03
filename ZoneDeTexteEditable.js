import React, { useState } from 'react';
import { View, TextInput } from 'react-native';

const ZoneDeTexteEditable = ({ onTextChange }) => {
  const [contenu, setContenu] = useState('');

  const handleTextChange = (text) => {
    // Filtrer les caractères pour ne conserver que les chiffres
    const chiffresUniquement = text.replace(/[^0-9]/g, '');

    // Limiter la longueur maximale à 5 caractères
    const contenuLimite = chiffresUniquement.slice(0, 5);

    setContenu(contenuLimite);
    // Appel de la fonction de rappel avec le contenu de la zone de texte en majuscules
    onTextChange(contenuLimite);
  };

  return (
    <View>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10, backgroundColor: '#ffffff',}}
        placeholder="Entrez le code ici"
        onChangeText={handleTextChange}
        value={contenu}
        keyboardType="numeric" // Afficher le clavier numérique
      />
    </View>
  );
};

export default ZoneDeTexteEditable;
