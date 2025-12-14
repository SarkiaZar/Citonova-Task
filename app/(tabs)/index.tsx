import React, { useState, useCallback } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Text, View, SafeAreaView, Image, Linking, Platform, RefreshControl, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { useTasks, Task } from '@/context/TaskContext';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import TaskModal from '@/components/TaskModal';

export default function HomeScreen() {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskStatus, refreshTasks, isLoading } = useTasks();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshTasks();
    setRefreshing(false);
  }, [refreshTasks]);

  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleSaveTask = async (title: string, location: { latitude: number; longitude: number }, imageUri?: string) => {
    if (selectedTask) {
      await updateTask(selectedTask.id, { title, location, photoUri: imageUri });
    } else {
      await addTask(title, location, imageUri);
    }
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
    setModalVisible(false);
    setSelectedTask(null);
  };

  const openMap = (latitude: number, longitude: number) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}`,
    });
    if (url) Linking.openURL(url);
  };

  // Sort tasks: Newest first (using createdAt if available, or just reverse list)
  const sortedTasks = [...(tasks || [])].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  const renderItem = ({ item }: { item: Task }) => (
    <TouchableOpacity onPress={() => handleTaskPress(item)} style={[styles.taskItem, { backgroundColor: theme.background, borderColor: theme.border }]}>
      {item.photoUri && (
        <Image source={{ uri: item.photoUri }} style={styles.taskImage} />
      )}
      <View style={styles.taskContent}>
        <View style={styles.taskHeader}>
          <Text style={[styles.taskTitle, { color: theme.text }]}>{item.title}</Text>
          <TouchableOpacity onPress={() => toggleTaskStatus(item.id)}>
            <FontAwesome
              name={item.completed ? 'check-circle' : 'circle-o'}
              size={24}
              color={item.completed ? theme.success : theme.secondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.taskFooter}>
          <View style={styles.metaContainer}>
            <Text style={[styles.taskDate, { color: theme.secondary }]}>
              <FontAwesome name="calendar" size={12} /> {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
            </Text>
            {item.location && (
              <TouchableOpacity onPress={() => openMap(item.location.latitude, item.location.longitude)} style={styles.locationButton}>
                <Text style={[styles.taskLocation, { color: theme.tint }]}>
                  <FontAwesome name="map-marker" size={12} /> Ver Mapa
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Mis Tareas</Text>
        <TouchableOpacity onPress={() => { setSelectedTask(null); setModalVisible(true); }} style={[styles.addButton, { backgroundColor: theme.primary }]}>
          <FontAwesome name="plus" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {isLoading && !refreshing ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={sortedTasks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.secondary }]}>No tienes tareas pendientes.</Text>
            </View>
          }
        />
      )}

      <TaskModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedTask(null);
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        initialTask={selectedTask}
        isReadOnly={false} // API doesn't seem to have roles for tasks, so everyone can edit their own tasks
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
  },
  taskItem: {
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskImage: {
    width: '100%',
    height: 150,
  },
  taskContent: {
    padding: 15,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDate: {
    fontSize: 12,
    marginRight: 12,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskLocation: {
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
  },
});
