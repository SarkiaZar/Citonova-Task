import React, { useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Text, View, SafeAreaView, TextInput, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { useLocations, Location } from '@/context/LocationContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function LocationsScreen() {
    const { user } = useAuth();
    const { locations, addLocation, removeLocation } = useLocations();
    const [newLocationName, setNewLocationName] = useState('');
    const [newLocationUrl, setNewLocationUrl] = useState('');
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();

    // Security check
    React.useEffect(() => {
        if (user?.role !== 'superadmin') {
            router.replace('/(tabs)');
        }
    }, [user]);

    const handleAddLocation = () => {
        if (newLocationName.trim()) {
            addLocation(newLocationName.trim(), newLocationUrl.trim());
            setNewLocationName('');
            setNewLocationUrl('');
        }
    };

    const handleRemoveLocation = (id: string) => {
        Alert.alert(
            'Eliminar Ubicación',
            '¿Estás seguro de que deseas eliminar esta ubicación?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => removeLocation(id)
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: Location }) => (
        <View style={[styles.locationItem, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <View style={styles.locationInfo}>
                <Text style={[styles.locationName, { color: theme.text }]}>{item.name}</Text>
                {item.mapsUrl ? (
                    <Text style={[styles.locationUrl, { color: theme.tint }]} numberOfLines={1}>{item.mapsUrl}</Text>
                ) : null}
            </View>
            <TouchableOpacity onPress={() => handleRemoveLocation(item.id)}>
                <FontAwesome name="trash" size={20} color={theme.error} />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <FontAwesome name="arrow-left" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Gestionar Ubicaciones</Text>
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#f9f9f9' }]}
                    placeholder="Nombre del Condominio"
                    placeholderTextColor={theme.secondary}
                    value={newLocationName}
                    onChangeText={setNewLocationName}
                />
                <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#f9f9f9', marginTop: 10 }]}
                    placeholder="Enlace de Google Maps (Opcional)"
                    placeholderTextColor={theme.secondary}
                    value={newLocationUrl}
                    onChangeText={setNewLocationUrl}
                />
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.primary }]}
                    onPress={handleAddLocation}
                >
                    <Text style={styles.addButtonText}>Agregar Ubicación</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={locations}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: theme.secondary }]}>No hay ubicaciones registradas.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    backButton: {
        marginRight: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    inputContainer: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    addButton: {
        marginTop: 15,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    listContent: {
        padding: 20,
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 10,
    },
    locationInfo: {
        flex: 1,
    },
    locationName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    locationUrl: {
        fontSize: 12,
        marginTop: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
    },
});
