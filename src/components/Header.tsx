import {Text, View} from "react-native";
import React from "react";

// imports locais
import {styles} from "../styles/appStyles";

export function Header() {
    return (
        <View>
            <Text style={styles.title}>Parque Verde</Text>
            <Text style={styles.subtitle}>Web Rádio</Text>
        </View>
    )
}