// components/ArticleCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../constants/ThemeContext';

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
}

interface ArticleCardProps {
  article: Article;
  onPress: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onPress }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={onPress} activeOpacity={0.8}>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {article.title}
      </Text>
      <Text style={[styles.summary, { color: colors.textSecondary }]} numberOfLines={3}>
        {article.summary}
      </Text>
      <Text style={[styles.readMore, { color: colors.primary }]}>
        Read More →
      </Text>
    </TouchableOpacity>
  );
};

export default ArticleCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  summary: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  readMore: {
    marginTop: 8,
    color: '#007BFF',
    fontWeight: '600',
  },
});
