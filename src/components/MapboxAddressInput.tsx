import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';

interface AddressSuggestion {
  id: string;
  place_name: string;
  center: [number, number];
  context?: Array<{ id: string; text: string }>;
}

interface GooglePlacesAddressInputProps {
  onAddressSelect: (address: AddressSuggestion) => void;
  placeholder?: string;
  value?: string;
  style?: any;
}

// For Snack/dev we will use mock data only. In production, set a real API key.
const GOOGLE_PLACES_API_KEY = ''; // intentionally empty on Snack

export const GooglePlacesAddressInput: React.FC<GooglePlacesAddressInputProps> = ({
  onAddressSelect,
  placeholder,
  value = '',
  style,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (query.length > 2) {
      searchAddresses(query);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const searchAddresses = async (searchQuery: string) => {
    setLoading(true);
    try {
      // For development, use mock data. In production, use Google Places API
      if (__DEV__) {
        // Mock Hong Kong addresses for development
        const mockSuggestions: AddressSuggestion[] = [
          {
            id: '1',
            place_name: `${searchQuery} - Central, Hong Kong`,
            center: [114.1577, 22.2793],
          },
          {
            id: '2',
            place_name: `${searchQuery} - Tsim Sha Tsui, Hong Kong`,
            center: [114.1722, 22.2976],
          },
          {
            id: '3',
            place_name: `${searchQuery} - Causeway Bay, Hong Kong`,
            center: [114.1849, 22.2793],
          },
        ].filter(item =>
          item.place_name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setTimeout(() => {
          setSuggestions(mockSuggestions);
          setShowSuggestions(true);
          setLoading(false);
        }, 500);
        return;
      }

      // Production: Google Places API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          searchQuery
        )}&key=${GOOGLE_PLACES_API_KEY}&components=country:hk&language=en`
      );

      const data = await response.json();

      if (data.predictions) {
        const formattedSuggestions: AddressSuggestion[] = data.predictions.map((prediction: any) => ({
          id: prediction.place_id,
          place_name: prediction.description,
          center: [114.1577, 22.2793], // Default to Hong Kong center, get actual coords from Place Details API
        }));

        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Address search error:', error);
      // Fallback to mock data on error
      setSuggestions([
        {
          id: 'fallback',
          place_name: `${searchQuery} - Hong Kong`,
          center: [114.1577, 22.2793],
        }
      ]);
      setShowSuggestions(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
    setQuery(suggestion.place_name);
    setShowSuggestions(false);
    onAddressSelect(suggestion);
  };

  const renderSuggestion = ({ item }: { item: AddressSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionSelect(item)}
    >
      <Text style={styles.suggestionText}>{item.place_name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder || t('search.enterAddress')}
          placeholderTextColor="#999"
          onFocus={() => query.length > 2 && setShowSuggestions(true)}
        />
        {loading && (
          <ActivityIndicator
            size="small"
            color="#FF6B35"
            style={styles.loadingIndicator}
          />
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.id}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
};

// Export with both names for compatibility
export const MapboxAddressInput = GooglePlacesAddressInput;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  loadingIndicator: {
    marginRight: 12,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderTopWidth: 0,
    maxHeight: 200,
    zIndex: 1001,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
});
