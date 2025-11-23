import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Location {
    id: string;
    name: string;
    mapsUrl?: string; // New field
}

interface LocationContextType {
    locations: Location[];
    addLocation: (name: string, mapsUrl?: string) => void;
    removeLocation: (id: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
    const [locations, setLocations] = useState<Location[]>([]);

    useEffect(() => {
        loadLocations();
    }, []);

    const loadLocations = async () => {
        try {
            const storedLocations = await AsyncStorage.getItem('locations');
            if (storedLocations) {
                setLocations(JSON.parse(storedLocations));
            }
        } catch (error) {
            console.error('Failed to load locations', error);
        }
    };

    const saveLocations = async (newLocations: Location[]) => {
        try {
            await AsyncStorage.setItem('locations', JSON.stringify(newLocations));
        } catch (error) {
            console.error('Failed to save locations', error);
        }
    };

    const addLocation = (name: string, mapsUrl?: string) => {
        const newLocation: Location = {
            id: Date.now().toString(),
            name,
            mapsUrl, // Add mapsUrl
        };
        const updatedLocations = [...locations, newLocation];
        setLocations(updatedLocations);
        saveLocations(updatedLocations);
    };

    const removeLocation = (id: string) => {
        const updatedLocations = locations.filter(loc => loc.id !== id);
        setLocations(updatedLocations);
        saveLocations(updatedLocations);
    };

    return (
        <LocationContext.Provider value={{ locations, addLocation, removeLocation }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocations = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocations must be used within a LocationProvider');
    }
    return context;
};
