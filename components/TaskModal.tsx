import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Linking, ScrollView, Alert, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { Colors } from '../constants/Colors';
import { useColorScheme } from '../components/useColorScheme';
import { Task } from '../context/TaskContext';
import { useLocations } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';

interface TaskModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (title: string, description: string, location: string, imageUri: string, assignedTo?: string, note?: string, completionImageUri?: string) => void;
    onDelete?: (id: string) => void;
    initialTask?: Task | null;
    isReadOnly?: boolean;
}

export default function TaskModal({ visible, onClose, onSave, onDelete, initialTask, isReadOnly = false }: TaskModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [imageUri, setImageUri] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [note, setNote] = useState('');
    const [completionImageUri, setCompletionImageUri] = useState('');

    const { locations } = useLocations();
    const { user, allUsers } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    useEffect(() => {
        if (initialTask) {
            setTitle(initialTask.title);
            setDescription(initialTask.description || '');
            setLocation(initialTask.location || '');
            setImageUri(initialTask.imageUri || '');
            setAssignedTo(initialTask.assignedTo || '');
            setNote(initialTask.note || '');
            setCompletionImageUri(initialTask.completionImageUri || '');
        } else {
            setTitle('');
            setDescription('');
            setLocation('');
            setImageUri('');
            setAssignedTo('');
            setNote('');
            setCompletionImageUri('');
        }
    }, [initialTask, visible]);

    const handleSave = () => {
        if (title.trim()) {
            onSave(title, description, location, imageUri, assignedTo, note, completionImageUri);
            onClose();
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

    const pickImage = async (isCompletion: boolean = false) => {
        if (isReadOnly && !isRestrictedAdmin) return; // Allow if restricted admin (for completion photo)
        if (isRestrictedAdmin && !isCompletion) return; // Restricted admin can't change main photo

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            if (isCompletion) {
                setCompletionImageUri(result.assets[0].uri);
            } else {
                setImageUri(result.assets[0].uri);
            }
        }
    };

    const handleLocationSelect = (locName: string) => {
        setLocation(locName);
    };

    const openMap = () => {
        if (!location) return;

        // Check if the location matches a saved location with a URL
        const savedLocation = locations.find(l => l.name === location);
        if (savedLocation?.mapsUrl) {
            Linking.openURL(savedLocation.mapsUrl);
            return;
        }

        // Fallback to search query
        const query = encodeURIComponent(location);
        const url = Platform.select({
            ios: `maps:0,0?q=${query}`,
            android: `geo:0,0?q=${query}`,
        });
        if (url) Linking.openURL(url);
    };

    const canAssign = user?.role === 'admin' || user?.role === 'superadmin';

    // Logic for restricted admin permissions
    // If user is admin AND task creator is superadmin AND task is assigned to this admin
    const isRestrictedAdmin = React.useMemo(() => {
        if (user?.role !== 'admin' || !initialTask) return false;

        const creator = allUsers.find(u => u.email === initialTask.userId);
        const isCreatorSuperadmin = creator?.role === 'superadmin';
        const isAssignedToMe = initialTask.assignedTo === user.email;

        return isCreatorSuperadmin && isAssignedToMe;
    }, [user, initialTask, allUsers]);

    // Determine if fields are editable
    // If restricted admin, only Note and Completion Photo are editable.
    // If isReadOnly (collaborator viewing others' tasks), nothing is editable except maybe notes if we allowed that before (but requirements say "collaborator... add a note"). 
    // Let's assume isReadOnly means "view only" BUT we enable notes for everyone involved as per previous requirement.
    // However, for restricted admin, we explicitly disable main fields.

    const isMainContentEditable = !isReadOnly && !isRestrictedAdmin;

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

                    <ScrollView style={styles.scrollView}>
                        {/* Main Image Picker */}
                        {isMainContentEditable && (
                            <TouchableOpacity onPress={() => pickImage(false)} style={styles.imagePicker}>
                                {imageUri ? (
                                    <Image source={{ uri: imageUri }} style={styles.previewImage} />
                                ) : (
                                    <View style={[styles.placeholderImage, { borderColor: theme.border }]}>
                                        <FontAwesome name="camera" size={40} color={theme.secondary} />
                                        <Text style={{ color: theme.secondary, marginTop: 10 }}>Agregar Foto Principal</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        )}
                        {!isMainContentEditable && imageUri && (
                            <Image source={{ uri: imageUri }} style={styles.readOnlyImage} />
                        )}

                        <Text style={[styles.label, { color: theme.text }]}>Título</Text>
                        {isMainContentEditable ? (
                            <TextInput
                                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Título de la tarea"
                                placeholderTextColor={theme.secondary}
                            />
                        ) : (
                            <Text style={[styles.readOnlyText, { color: theme.text }]}>{title}</Text>
                        )}

                        <Text style={[styles.label, { color: theme.text }]}>Descripción</Text>
                        {isMainContentEditable ? (
                            <TextInput
                                style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Descripción (Opcional)"
                                placeholderTextColor={theme.secondary}
                                multiline
                            />
                        ) : (
                            <Text style={[styles.readOnlyText, { color: theme.text }]}>{description || 'Sin descripción'}</Text>
                        )}

                        <Text style={[styles.label, { color: theme.text }]}>Ubicación</Text>
                        {isMainContentEditable ? (
                            <>
                                <View style={styles.locationInputContainer}>
                                    <TextInput
                                        style={[styles.input, { flex: 1, color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                                        value={location}
                                        onChangeText={setLocation}
                                        placeholder="Ubicación"
                                        placeholderTextColor={theme.secondary}
                                    />
                                    <TouchableOpacity onPress={openMap} style={styles.mapButton}>
                                        <FontAwesome name="map" size={20} color={theme.primary} />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.locationSelector}>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {locations.map((loc) => (
                                            <TouchableOpacity
                                                key={loc.id}
                                                style={[
                                                    styles.locationChip,
                                                    { backgroundColor: location === loc.name ? theme.primary : theme.border }
                                                ]}
                                                onPress={() => handleLocationSelect(loc.name)}
                                            >
                                                <Text style={{ color: location === loc.name ? 'white' : theme.text }}>{loc.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            </>
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={[styles.readOnlyText, { color: theme.text, marginRight: 10 }]}>{location || 'Sin ubicación'}</Text>
                                {location && (
                                    <TouchableOpacity onPress={openMap}>
                                        <FontAwesome name="map-marker" size={20} color={theme.primary} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {/* Assignee Section */}
                        {(canAssign || (isReadOnly && assignedTo) || isRestrictedAdmin) && (
                            <>
                                <Text style={[styles.label, { color: theme.text }]}>Asignado a</Text>
                                {isMainContentEditable ? (
                                    <View style={styles.locationSelector}>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            <TouchableOpacity
                                                style={[
                                                    styles.locationChip,
                                                    { backgroundColor: assignedTo === '' ? theme.primary : theme.border }
                                                ]}
                                                onPress={() => setAssignedTo('')}
                                            >
                                                <Text style={{ color: assignedTo === '' ? 'white' : theme.text }}>Nadie</Text>
                                            </TouchableOpacity>
                                            {allUsers.map((u) => (
                                                <TouchableOpacity
                                                    key={u.email}
                                                    style={[
                                                        styles.locationChip,
                                                        { backgroundColor: assignedTo === u.email ? theme.primary : theme.border }
                                                    ]}
                                                    onPress={() => setAssignedTo(u.email)}
                                                >
                                                    <Text style={{ color: assignedTo === u.email ? 'white' : theme.text }}>{u.email}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                ) : (
                                    <Text style={[styles.readOnlyText, { color: theme.text }]}>{assignedTo || 'Sin asignar'}</Text>
                                )}
                            </>
                        )}

                        {/* Notes Section - Always editable for assigned users or admins */}
                        <Text style={[styles.label, { color: theme.text, marginTop: 20 }]}>Notas de Ejecución</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                            value={note}
                            onChangeText={setNote}
                            placeholder="Agregar una nota sobre la tarea..."
                            placeholderTextColor={theme.secondary}
                            multiline
                        />

                        {/* Completion Photo Section */}
                        <Text style={[styles.label, { color: theme.text, marginTop: 10 }]}>Foto de Término</Text>
                        <TouchableOpacity onPress={() => pickImage(true)} style={styles.imagePicker}>
                            {completionImageUri ? (
                                <Image source={{ uri: completionImageUri }} style={styles.previewImage} />
                            ) : (
                                <View style={[styles.placeholderImage, { borderColor: theme.border, height: 150 }]}>
                                    <FontAwesome name="image" size={30} color={theme.secondary} />
                                    <Text style={{ color: theme.secondary, marginTop: 10 }}>Subir Foto de Término</Text>
                                </View>
                            )}
                        </TouchableOpacity>


                        {(!isReadOnly || note !== (initialTask?.note || '') || completionImageUri !== (initialTask?.completionImageUri || '')) && (
                            <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={handleSave}>
                                <Text style={styles.saveButtonText}>
                                    {isReadOnly || isRestrictedAdmin ? 'Guardar Cambios' : 'Guardar Tarea'}
                                </Text>
                            </TouchableOpacity>
                        )}

                        {initialTask && !isReadOnly && !isRestrictedAdmin && onDelete && (
                            <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(initialTask.id)}>
                                <Text style={styles.deleteButtonText}>Eliminar Tarea</Text>
                            </TouchableOpacity>
                        )}
                        <View style={{ height: 20 }} />
                    </ScrollView>
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
        height: '90%',
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
    scrollView: {
        flex: 1,
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
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    readOnlyText: {
        fontSize: 16,
        marginBottom: 10,
    },
    locationInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    mapButton: {
        padding: 10,
        marginLeft: 10,
    },
    locationSelector: {
        marginBottom: 10,
    },
    locationChip: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#ccc',
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
