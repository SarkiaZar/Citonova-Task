import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();

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
                <View style={[styles.avatarContainer, { borderColor: theme.primary }]}>
                    <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary }]}>
                        <Text style={styles.avatarText}>
                            {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                        </Text>
                    </View>
                </View>
                <Text style={[styles.email, { color: theme.text }]}>{user?.email}</Text>
                <Text style={[styles.role, { color: theme.secondary }]}>{getRoleName(user?.role)}</Text>
            </View>

            <View style={styles.actions}>
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
