import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, View, Alert, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function ProfileScreen() {
    const { user, logout, requestAdminAccess, updateProfileImage } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();

    const handleRequestAdmin = () => {
        Alert.alert(
            'Solicitar Acceso',
            '¿Deseas solicitar permisos de Administrador?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Solicitar',
                    onPress: () => {
                        requestAdminAccess();
                        Alert.alert('Solicitud Enviada', 'El Superadmin revisará tu solicitud.');
                    }
                }
            ]
        );
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled && user) {
            updateProfileImage(user.email, result.assets[0].uri);
        }
    };

    const getRoleName = (role?: string) => {
        switch (role) {
            case 'superadmin': return 'Super Administrador';
            case 'admin': return 'Administrador';
            case 'collaborator': return 'Colaborador';
            default: return 'Usuario';
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={pickImage} style={[styles.avatarContainer, { borderColor: theme.primary }]}>
                    {user?.profileImageUri ? (
                        <Image source={{ uri: user.profileImageUri }} style={styles.avatarImage} />
                    ) : (
                        <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary }]}>
                            <Text style={styles.avatarText}>
                                {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                            </Text>
                        </View>
                    )}
                    <View style={[styles.editIcon, { backgroundColor: theme.secondary }]}>
                        <FontAwesome name="pencil" size={12} color="white" />
                    </View>
                </TouchableOpacity>
                <Text style={[styles.email, { color: theme.text }]}>{user?.email}</Text>
                <Text style={[styles.role, { color: theme.secondary }]}>{getRoleName(user?.role)}</Text>
            </View>

            <View style={styles.actions}>
                {user?.role === 'superadmin' && (
                    <>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.primary, marginBottom: 15 }]}
                            onPress={() => router.push('/admin_panel')}
                        >
                            <FontAwesome name="users" size={20} color="white" />
                            <Text style={styles.actionButtonText}>Panel de Administración</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.primary, marginBottom: 15 }]}
                            onPress={() => router.push('/locations')}
                        >
                            <FontAwesome name="map-marker" size={20} color="white" />
                            <Text style={styles.actionButtonText}>Gestionar Ubicaciones</Text>
                        </TouchableOpacity>
                    </>
                )}

                {user?.role === 'collaborator' && (
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            { backgroundColor: user.requestedAdmin ? theme.secondary : theme.primary, marginBottom: 15, opacity: user.requestedAdmin ? 0.7 : 1 }
                        ]}
                        onPress={handleRequestAdmin}
                        disabled={user.requestedAdmin}
                    >
                        <FontAwesome name="shield" size={20} color="white" />
                        <Text style={styles.actionButtonText}>
                            {user.requestedAdmin ? 'Solicitud Pendiente' : 'Solicitar ser Administrador'}
                        </Text>
                    </TouchableOpacity>
                )}

                {user?.role === 'admin' && (
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            { backgroundColor: user.requestedAdmin ? theme.secondary : theme.primary, marginBottom: 15, opacity: user.requestedAdmin ? 0.7 : 1 }
                        ]}
                        onPress={() => {
                            Alert.alert(
                                'Solicitar Acceso',
                                '¿Deseas solicitar permisos de Super Administrador?',
                                [
                                    { text: 'Cancelar', style: 'cancel' },
                                    {
                                        text: 'Solicitar',
                                        onPress: () => {
                                            requestAdminAccess();
                                            Alert.alert('Solicitud Enviada', 'El Superadmin revisará tu solicitud.');
                                        }
                                    }
                                ]
                            );
                        }}
                        disabled={user.requestedAdmin}
                    >
                        <FontAwesome name="shield" size={20} color="white" />
                        <Text style={styles.actionButtonText}>
                            {user.requestedAdmin ? 'Solicitud Pendiente' : 'Solicitar ser Superadmin'}
                        </Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.background, borderColor: theme.error, borderWidth: 1 }]}
                    onPress={logout}
                >
                    <FontAwesome name="sign-out" size={20} color={theme.error} />
                    <Text style={[styles.actionButtonText, { color: theme.error }]}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginTop: 50,
        marginBottom: 50,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
        position: 'relative',
        borderWidth: 2,
        padding: 2,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: 'white',
        fontSize: 40,
        fontWeight: 'bold',
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    email: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    role: {
        fontSize: 16,
    },
    actions: {
        flex: 1,
        justifyContent: 'flex-end',
        marginBottom: 30,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 10,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});
