import {StyleSheet} from "react-native";

// estilos globais do app
export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "transparent",
        alignItems: "center",
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    shadows: {
        overflow: 'visible',
        shadowColor: '#03ebff',
        shadowOffset: { width: 10, height: 20 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 10,
        borderRadius: 12,
    },
    title: {
        fontSize: 20,
        fontFamily: 'Michroma',
        color: "#03ebff",
        marginTop: 10,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Michroma',
        color: "#03ebff",
        marginBottom: 20,
        textAlign: "center",
    },
    artworkContainer: {
        alignItems: "center",
        marginBottom: 10,
    },
    artwork: {
        width: 220,
        height: 220,
        borderRadius: 12,
        backgroundColor: "transparent",
        margin: 2
    },
    artistText: {
        fontSize: 16,
        fontFamily: 'Michroma',
        color: "#03ebff",
        textAlign: "center",
    },
    titleText: {
        fontSize: 14,
        fontFamily: 'Michroma',
        color: "#ffffff",
        marginTop: 4,
        textAlign: "center",
    },
    playButton: {
        marginTop: 24,
        width: 50,
        height: 50,
        borderRadius: 42,
        borderColor: "rgba(3,235,255,0.7)",
        borderStyle: "solid",
        borderWidth: 2,
        backgroundColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
        elevation: 4,
    },
    playing: {
        backgroundColor: "rgba(3,235,255,0.6)",
        borderColor: "rgba(255,77,77,0.8)",
        borderStyle: "solid",
        borderWidth: 2,
    },
    iconStop: {
        color: "#000b11",
    },
    iconStart: {
        color: "#03ebff",
    },
});