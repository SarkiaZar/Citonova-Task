import React, { useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Text, View, SafeAreaView, Alert, Modal, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAuth, User, UserRole } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function AdminPanelScreen() {
    const { allUsers, updateUserRole, user: currentUser } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();

    const [selectedUserImage, setSelectedUserImage] = useState<string | null>(null);

    // Security check: redirect if not superadmin
    React.useEffect(() => {
        if (currentUser?.role !== 'superadmin') {
            router.replace('/(tabs)');
        }
    }, [currentUser]);

    const handleToggleRole = (user: User) => {
        if (user.role === 'superadmin') return;

        if (user.role === 'admin') {
            Alert.alert(
                'Gestionar Administrador',
                `¿Qué acción deseas realizar con ${user.email}?`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Hacer Superadmin',
                        onPress: () => updateUserRole(user.email, 'superadmin')
                    },
                    {
                        text: 'Degradar a Colaborador',
                        style: 'destructive',
                        onPress: () => updateUserRole(user.email, 'collaborator')
                    }
                ]
            );
        } else {
            // Collaborator -> Admin
            Alert.alert(
                'Ascender Usuario',
                `¿Deseas ascender a ${user.email} a Administrador?`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Confirmar',
                        onPress: () => updateUserRole(user.email, 'admin')
                    }
                ]
            );
        }
    };

    const renderItem = ({ item }: { item: User }) => (
        <View style={[styles.userItem, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <View style={styles.userInfo}>
                <View style={styles.userHeader}>
                    <Text style={[styles.userEmail, { color: theme.text }]}>{item.email}</Text>
                </View>
                <View style={styles.roleContainer}>
                    <Text style={[styles.userRole, { color: theme.secondary }]}>
                        {item.role === 'superadmin' ? 'Super Admin' : (item.role === 'admin' ? 'Administrador' : 'Colaborador')}
                    </Text>
                    {item.requestedAdmin && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {item.role === 'admin' ? 'Solicitó Super' : 'Solicitó Admin'}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.actionButtonsContainer}>
                {item.profileImageUri && (
                    <TouchableOpacity
                        onPress={() => setSelectedUserImage(item.profileImageUri!)}
                        style={[styles.iconButton, { backgroundColor: theme.secondary, marginRight: 8 }]}
                    >
                        <FontAwesome name="user" size={16} color="white" />
                    </TouchableOpacity>
                )}

                {item.role !== 'superadmin' && (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: item.role === 'admin' ? theme.secondary : theme.primary }]}
                        onPress={() => handleToggleRole(item)}
                    >
                        <Text style={styles.actionButtonText}>
                            {item.role === 'admin' ? 'Gestionar' : 'Ascender'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <FontAwesome name="arrow-left" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Panel de Administración</Text>
            </View>

            <FlatList
                data={allUsers}
                renderItem={renderItem}
                keyExtractor={(item) => item.email}
                contentContainerStyle={styles.listContent}
            />

            <Modal visible={!!selectedUserImage} transparent={true} animationType="fade">
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <TouchableOpacity style={styles.closeModalButton} onPress={() => setSelectedUserImage(null)}>
                            <FontAwesome name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                        {selectedUserImage && (
                            <Image source={{ uri: selectedUserImage }} style={styles.fullImage} resizeMode="contain" />
                        )}
                    </View>
                </View>
            </Modal>
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
    listContent: {
        padding: 20,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 10,
    },
    userInfo: {
        flex: 1,
    },
    userHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    viewProfileButton: {
        marginLeft: 10,
    },
    userEmail: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    roleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userRole: {
        fontSize: 14,
    },
    badge: {
        backgroundColor: '#ffc107',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'black',
    },
    actionButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        height: '70%',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeModalButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        zIndex: 1,
    },
    fullImage: {
        width: '100%',
        height: '100%',
    },
});
