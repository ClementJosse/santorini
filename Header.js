import {View, Text} from 'react-native'
import React from 'react'

const Header = () => {
    return(
        <View style={{marginLeft:15, marginTop:30}}>
            <Text style={{fontWeight:'bold', fontSize:28}}>
                Veuillez vous connecter
            </Text>
        </View>
    )
}

export default Header;