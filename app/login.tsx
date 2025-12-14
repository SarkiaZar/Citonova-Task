import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../services/api';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../components/useColorScheme';

export default function LoginScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, register, isLoading } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Por favor ingrese email y contraseña');
            return;
        }

        if (isLogin) {
            const result = await login(email, password);
            if (result.success) {
                router.replace('/(tabs)');
            } else {
                Alert.alert('Error', result.error || 'Credenciales incorrectas o error de conexión');
            }
        } else {
            const result = await register(email, password);
            if (result.success) {
                router.replace('/(tabs)');
            } else {
                Alert.alert('Error', result.error || 'El usuario ya existe o error de conexión');
            }
        }
    };

    const testConnectivity = async () => {
        try {
            Alert.alert('Probando conexión', `Intentando conectar a ${API_URL}...`);
            const response = await fetch(`${API_URL}/docs`, { method: 'HEAD' });
            Alert.alert('Éxito', `Conexión exitosa: ${response.status}`);
        } catch (error: any) {
            Alert.alert('Error de conexión', `No se pudo conectar: ${error.message}`);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.logoContainer}>
                    <Image
                        source={colorScheme === 'dark'
                            ? require('../assets/images/logo-login.png')
                            : require('../assets/images/logo-login-white.png')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.formContainer}>
                    <Text style={[styles.headerText, { color: theme.text }]}>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</Text>

                    <Text style={[styles.label, { color: theme.text }]}>Email</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                        placeholder="ejemplo@citonova.com"
                        placeholderTextColor={theme.secondary}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <Text style={[styles.label, { color: theme.text }]}>Contraseña</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                        placeholder="••••••"
                        placeholderTextColor={theme.secondary}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.primary, opacity: isLoading ? 0.7 : 1 }]}
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>{isLogin ? 'Entrar' : 'Registrarse'}</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.switchButton} onPress={() => setIsLogin(!isLogin)}>
                        <Text style={[styles.switchText, { color: theme.primary }]}>
                            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                        </Text>
                    </TouchableOpacity>

                    <View style={{ marginTop: 30, alignItems: 'center' }}>
                        <Text style={{ color: theme.secondary, fontSize: 10 }}>API: {API_URL}</Text>
                        <TouchableOpacity onPress={testConnectivity} style={{ marginTop: 10, padding: 5 }}>
                            <Text style={{ color: theme.primary, fontSize: 12 }}>Probar Conexión</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logoImage: {
        width: 300,
        height: 300,
        marginBottom: 20,
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    formContainer: {
        width: '100%',
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        fontSize: 16,
    },
    button: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    switchButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    switchText: {
        fontSize: 14,
    },
});
