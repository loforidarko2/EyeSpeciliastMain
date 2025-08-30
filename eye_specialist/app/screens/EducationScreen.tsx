import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../constants/types';
import ArticleCard from '../../components/ArticleCard';
import { useTheme } from '../../constants/ThemeContext'; // ✅ useTheme import

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Education'>;

interface Article {
  id: string;
  title: string;
  summary: string;
  category: string;
  content: string;
}

const allArticles: Article[] = [
  {
    id: '1',
    title: 'Understanding Glaucoma',
    summary: 'Learn the basics about glaucoma, a leading cause of blindness worldwide.',
    category: 'diseases',
    content: 'Full article content about glaucoma...',
  },
  {
    id: '2',
    title: 'Preventing Digital Eye Strain',
    summary: 'Tips and exercises to reduce digital eye fatigue from screens.',
    category: 'prevention',
    content: 'Full article content about eye strain...',
  },
];

const categories = [
  { id: 'diseases', name: 'Diseases', icon: 'eye', color: '#FF6B6B' },
  { id: 'prevention', name: 'Prevention', icon: 'shield-alt', color: '#28C76F' },
  { id: 'nutrition', name: 'Nutrition', icon: 'apple-alt', color: '#007BFF' },
  { id: 'exercises', name: 'Exercises', icon: 'dumbbell', color: '#6F42C1' },
];

export default function EducationScreen(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp>();

  const { colors } = useTheme(); // ✅ use custom theme

  const filteredArticles = allArticles.filter((article) => {
    const matchesCategory = selectedCategory ? article.category === selectedCategory : true;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.header, { color: colors.text }]}>Eye Health Education</Text>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color={colors.subtle} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search health topics..."
            placeholderTextColor={colors.subtle}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories */}
        <Text style={[styles.sectionHeader, { color: colors.text }]}>Browse by Category</Text>
        <View style={styles.categories}>
          {categories.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  { backgroundColor: isSelected ? category.color : colors.card },
                ]}
                onPress={() => setSelectedCategory((prev) => (prev === category.id ? null : category.id))}
              >
                <FontAwesome5
                  name={category.icon}
                  size={20}
                  color={isSelected ? 'white' : category.color}
                  style={{ marginBottom: 6 }}
                />
                <Text style={{ color: isSelected ? 'white' : colors.text, fontWeight: '600' }}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Articles */}
        <Text style={[styles.sectionHeader, { color: colors.text }]}>
          {selectedCategory
            ? `${selectedCategory[0].toUpperCase()}${selectedCategory.slice(1)} Articles`
            : 'Recent Articles'}
        </Text>

        {filteredArticles.length === 0 ? (
          <Text style={{ padding: 10, color: colors.subtle }}>No articles found.</Text>
        ) : (
          filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onPress={() => navigation.navigate('ArticleDetails', { article })}
            />
          ))
        )}

        <Text style={[styles.footer, { color: colors.subtle }]}>Eye Specialist v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 14,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
  },
  footer: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 12,
  },
});
