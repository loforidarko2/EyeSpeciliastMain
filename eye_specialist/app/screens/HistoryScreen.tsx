import React, { useState, useEffect } from 'react';
import {View,Text,FlatList,StyleSheet,ActivityIndicator,Image,ListRenderItem,SafeAreaView} from 'react-native';
import { auth, db } from '../../configs/firebaseConfig';
import { Feather } from '@expo/vector-icons';

// Type for a single history entry
interface HistoryItem {
  id: string;
  userId: string;
  prediction: string;
  confidence: number;
  createdAt?: string;
  imageUrl?: string;
}

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const unsubscribe = db
      .collection('history')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        snapshot => {
          const items: HistoryItem[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...(data as Omit<HistoryItem, 'id'>),
              createdAt: data.createdAt?.toDate().toLocaleString(),
            };
          });
          setHistory(items);
          setLoading(false);
        },
        error => {
          console.error('Snapshot error:', error);
          setLoading(false);
        }
      );

    return unsubscribe;
  }, []);

  const getColor = (prediction: string): string => {
    if (prediction === 'normal') return '#34a853';
    if (prediction === 'cataract') return '#fbbc04';
    if (prediction === 'glaucoma') return '#ea4335';
    return '#9ca3af';
  };

  const renderItem: ListRenderItem<HistoryItem> = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <View
          style={[styles.iconCircle, { backgroundColor: getColor(item.prediction) }]}
        >
          <Feather
            name={item.prediction === 'normal' ? 'check-circle' : 'alert-triangle'}
            size={20}
            color="#fff"
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.predictionText}>
            {item.prediction === 'normal'
              ? 'Normal Eye'
              : `${item.prediction} Detected`}
          </Text>
          <Text style={styles.date}>{item.createdAt}</Text>
        </View>
        <Text style={[styles.confidence, { color: getColor(item.prediction) }]}>
          {Math.round(item.confidence * 100)}%
        </Text>
      </View>
      {item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#1a73e8" />
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="eye-off" size={40} color="#999" />
              <Text style={styles.emptyText}>No scan history found</Text>
            </View>
          }
        />
      )}
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  predictionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  date: {
    fontSize: 12,
    color: '#6b7280',
  },
  confidence: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 180,
    marginTop: 8,
    borderRadius: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
