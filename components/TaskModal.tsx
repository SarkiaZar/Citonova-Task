import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

import { Colors } from '../constants/Colors';
import { useColorScheme } from '../components/useColorScheme';
import { Task } from '../context/TaskContext';

interface TaskModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (title: string, location: { latitude: number; longitude: number }, imageUri?: string) => void;
    onDelete?: (id: string) => void;
    initialTask?: Task | null;
    isReadOnly?: boolean;
}

export default function TaskModal({ visible, onClose, onSave, onDelete, initialTask, isReadOnly = false }: TaskModalProps) {
    const [title, setTitle] = useState('');
    const [imageUri, setImageUri] = useState('');
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [locationError, setLocationError] = useState('');

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    useEffect(() => {
        if (initialTask) {
            setTitle(initialTask.title);
            setImageUri(initialTask.photoUri || '');
            setLocation(initialTask.location);
        } else {
            setTitle('');
            setImageUri('');
            setLocation(null);
            getCurrentLocation();
        }
    }, [initialTask, visible]);

    const getCurrentLocation = async () => {
        setIsLocating(true);
        setLocationError('');
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocationError('Permiso de ubicación denegado');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });
        } catch (error) {
            setLocationError('Error al obtener ubicación');
        } finally {
            setIsLocating(false);
        }
    };

    const handleSave = () => {
        if (title.trim() && location) {
            onSave(title, location, imageUri);
            onClose();
        } else {
            Alert.alert('Error', 'Título y ubicación son obligatorios');
        }
    };

    const handleDelete = () => {
        if (initialTask && onDelete) {
            Alert.alert(
                'Eliminar Tarea',
                '¿Estás seguro de que deseas eliminar esta tarea?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Eliminar',
                        style: 'destructive',
                        onPress: () => {
                            onDelete(initialTask.id);
                            onClose();
                        }
                    }
                ]
            );
        }
    };

    const pickImage = async () => {
        if (isReadOnly) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
                <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>
                            {isReadOnly ? 'Detalles de la Tarea' : (initialTask ? 'Editar Tarea' : 'Nueva Tarea')}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <FontAwesome name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        {/* Image Picker */}
                        {!isReadOnly && (
                            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                                {imageUri ? (
                                    <Image source={{ uri: imageUri }} style={styles.previewImage} />
                                ) : (
                                    <View style={[styles.placeholderImage, { borderColor: theme.border }]}>
                                        <FontAwesome name="camera" size={40} color={theme.secondary} />
                                        <Text style={{ color: theme.secondary, marginTop: 10 }}>Agregar Foto</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        )}
                        {isReadOnly && imageUri && (
                            <Image source={{ uri: imageUri }} style={styles.readOnlyImage} />
                        )}

                        <Text style={[styles.label, { color: theme.text }]}>Título</Text>
                        {isReadOnly ? (
                            <Text style={[styles.readOnlyText, { color: theme.text }]}>{title}</Text>
                        ) : (
                            <TextInput
                                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Título de la tarea"
                                placeholderTextColor={theme.secondary}
                            />
                        )}

                        <Text style={[styles.label, { color: theme.text }]}>Ubicación</Text>
                        <View style={styles.locationContainer}>
                            {isLocating ? (
                                <ActivityIndicator size="small" color={theme.primary} />
                            ) : location ? (
                                <Text style={{ color: theme.text }}>
                                    Lat: {location.latitude.toFixed(4)}, Long: {location.longitude.toFixed(4)}
                                </Text>
                            ) : (
                                <Text style={{ color: theme.error }}>{locationError || 'Ubicación no disponible'}</Text>
                            )}
                            {!isReadOnly && !location && (
                                <TouchableOpacity onPress={getCurrentLocation} style={{ marginLeft: 10 }}>
                                    <FontAwesome name="refresh" size={20} color={theme.primary} />
                                </TouchableOpacity>
                            )}
                        </View>

                        {!isReadOnly && (
                            <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={handleSave}>
                                <Text style={styles.saveButtonText}>
                                    {initialTask ? 'Guardar Cambios' : 'Crear Tarea'}
                                </Text>
                            </TouchableOpacity>
                        )}

                        {initialTask && !isReadOnly && onDelete && (
                            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                                <Text style={styles.deleteButtonText}>Eliminar Tarea</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    form: {
        width: '100%',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
    },
    readOnlyText: {
        fontSize: 16,
        marginBottom: 10,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        height: 40,
    },
    imagePicker: {
        alignItems: 'center',
        marginBottom: 20,
    },
    placeholderImage: {
        width: '100%',
        height: 200,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
    },
    readOnlyImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 20,
    },
    saveButton: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    deleteButton: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: '#ff4444',
    },
    deleteButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
