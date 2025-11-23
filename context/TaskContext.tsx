import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

export interface Task {
    id: string;
    userId: string;
    assignedTo?: string; // New field
    title: string;
    description?: string;
    location?: string;
    imageUri?: string;
    status: 'pending' | 'completed';
    date: string;
    note?: string; // New field for execution notes
    completionImageUri?: string; // New field for completion photo
}

interface TaskContextType {
    tasks: Task[];
    addTask: (title: string, description?: string, location?: string, imageUri?: string, assignedTo?: string, note?: string, completionImageUri?: string) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    toggleTaskStatus: (id: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const storedTasks = await AsyncStorage.getItem('tasks');
            if (storedTasks) {
                setAllTasks(JSON.parse(storedTasks));
            }
        } catch (error) {
            console.error('Failed to load tasks', error);
        }
    };

    const saveTasks = async (newTasks: Task[]) => {
        try {
            await AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
        } catch (error) {
            console.error('Failed to save tasks', error);
        }
    };

    // Filter tasks: Created by user OR Assigned to user
    const tasks = allTasks.filter(task => task.userId === user?.email || task.assignedTo === user?.email);

    const addTask = (title: string, description?: string, location?: string, imageUri?: string, assignedTo?: string, note?: string, completionImageUri?: string) => {
        if (!user?.email) return;

        const newTask: Task = {
            id: Date.now().toString(),
            userId: user.email,
            assignedTo, // Add assignment
            title,
            description,
            location,
            imageUri,
            status: 'pending',
            date: new Date().toLocaleDateString(),
            note,
            completionImageUri,
        };
        const updatedTasks = [...allTasks, newTask];
        setAllTasks(updatedTasks);
        saveTasks(updatedTasks);
    };

    const updateTask = (id: string, updates: Partial<Task>) => {
        const updatedTasks = allTasks.map((task) => (task.id === id ? { ...task, ...updates } : task));
        setAllTasks(updatedTasks);
        saveTasks(updatedTasks);
    };

    const deleteTask = (id: string) => {
        const updatedTasks = allTasks.filter((task) => task.id !== id);
        setAllTasks(updatedTasks);
        saveTasks(updatedTasks);
    };

    const toggleTaskStatus = (id: string) => {
        const updatedTasks = allTasks.map((task) => {
            if (task.id === id) {
                const newStatus: 'pending' | 'completed' = task.status === 'pending' ? 'completed' : 'pending';
                return { ...task, status: newStatus };
            }
            return task;
        });
        setAllTasks(updatedTasks);
        saveTasks(updatedTasks);
    };

    return (
        <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask, toggleTaskStatus }}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
};
