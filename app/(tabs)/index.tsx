import React, { useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Text, View, SafeAreaView, Image, Linking, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { useTasks, Task } from '@/context/TaskContext';
import { useAuth } from '@/context/AuthContext';
import { useLocations } from '@/context/LocationContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import TaskModal from '@/components/TaskModal';

export default function HomeScreen() {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskStatus } = useTasks();
  const { user } = useAuth();
  const { locations } = useLocations();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleSaveTask = (title: string, description: string, location: string, imageUri: string, assignedTo?: string, note?: string, completionImageUri?: string) => {
    if (selectedTask) {
      updateTask(selectedTask.id, { title, description, location, imageUri, assignedTo, note, completionImageUri });
    } else {
      addTask(title, description, location, imageUri, assignedTo, note, completionImageUri);
    }
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
    setModalVisible(false);
    setSelectedTask(null);
  };

  const openMap = (locationName: string) => {
    if (!locationName) return;

    const savedLocation = locations.find(l => l.name === locationName);
    if (savedLocation?.mapsUrl) {
      Linking.openURL(savedLocation.mapsUrl);
      return;
    }

    const query = encodeURIComponent(locationName);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
    });
    if (url) Linking.openURL(url);
  };

  // Sort tasks: Newest first
  const sortedTasks = [...tasks].sort((a, b) => {
    return Number(b.id) - Number(a.id);
  });

  const renderItem = ({ item }: { item: Task }) => (
    <TouchableOpacity onPress={() => handleTaskPress(item)} style={[styles.taskItem, { backgroundColor: theme.background, borderColor: theme.border }]}>
      {item.imageUri && (
        <Image source={{ uri: item.imageUri }} style={styles.taskImage} />
      )}
      <View style={styles.taskContent}>
        <View style={styles.taskHeader}>
          <Text style={[styles.taskTitle, { color: theme.text }]}>{item.title}</Text>
          <TouchableOpacity onPress={() => toggleTaskStatus(item.id)}>
            <FontAwesome
              name={item.status === 'completed' ? 'check-circle' : 'circle-o'}
              size={24}
              color={item.status === 'completed' ? theme.success : theme.secondary}
            />
          </TouchableOpacity>
        </View>

        {item.description ? (
          <Text style={[styles.taskDescription, { color: theme.secondary }]} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        <View style={styles.taskFooter}>
          <View style={styles.metaContainer}>
            <Text style={[styles.taskDate, { color: theme.secondary }]}>
              <FontAwesome name="calendar" size={12} /> {item.date}
            </Text>
            {item.location && (
              <TouchableOpacity onPress={() => openMap(item.location!)} style={styles.locationButton}>
                <Text style={[styles.taskLocation, { color: theme.tint }]}>
                  <FontAwesome name="map-marker" size={12} /> {item.location}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {item.assignedTo && (
            <View style={[styles.assigneeBadge, { backgroundColor: theme.secondary }]}>
              <Text style={styles.assigneeText}>Asignado a: {item.assignedTo.split('@')[0]}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Mis Tareas</Text>
        {user?.role !== 'collaborator' && (
          <TouchableOpacity onPress={() => { setSelectedTask(null); setModalVisible(true); }} style={[styles.addButton, { backgroundColor: theme.primary }]}>
            <FontAwesome name="plus" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={sortedTasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.secondary }]}>No tienes tareas pendientes.</Text>
          </View>
        }
      />

      <TaskModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedTask(null);
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        initialTask={selectedTask}
        isReadOnly={user?.role === 'collaborator'}
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
  taskDescription: {
    fontSize: 14,
    marginBottom: 12,
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
  assigneeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  assigneeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
  },
});
