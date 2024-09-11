import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const Doacoes: React.FC = () => {
    return (
        <View style={styles.itens}>
            <View style={styles.qrcode}>
                <Image
                    source={{ uri: 'https://via.placeholder.com/150.png?text=QR+Code' }} // Replace with your QR code URL
                    style={styles.qrImage}
                />
            </View>
            <View style={styles.text}>
                <Text>Text</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    itens: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    qrcode: {
        height: '35%',
        aspectRatio: 1,
        backgroundColor: 'lightgray',
        marginBottom: 20,
        borderRadius: 15,
        alignItems: 'center', // Align children to center (flex: 1 required)
        justifyContent: 'center', // Align children to center (flex: 1 required)
    },
    text: {
        textAlign: 'center',
        backgroundColor: 'lightgray',
        padding: 10,
        width: '50%',
        borderRadius: 15,
    },
    qrImage: {
        width: '100%',
        height: '100%',
    },
});

export default Doacoes;
