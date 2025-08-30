import { auth, db } from '../configs/firebaseConfig';
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationData {
  title: string;
  message: string;
  type: 'scan_reminder' | 'health_tip' | 'result_ready' | 'system' | 'appointment';
  actionUrl?: string;
  userId: string;
}

class NotificationService {
  private static instance: NotificationService;

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Create a new notification for a user
   */
  async createNotification(notificationData: NotificationData): Promise<void> {
    try {
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        ...notificationData,
        isRead: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Create multiple notifications at once
   */
  async createBulkNotifications(notifications: NotificationData[]): Promise<void> {
    try {
      const promises = notifications.map(notification => this.createNotification(notification));
      await Promise.all(promises);
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw error;
    }
  }

  /**
   * Send a scan reminder notification
   */
  async sendScanReminder(userId: string): Promise<void> {
    const notification: NotificationData = {
      title: 'Time for Your Eye Scan',
      message: 'It\'s been a while since your last scan. Regular monitoring helps maintain good eye health.',
      type: 'scan_reminder',
      userId,
    };
    await this.createNotification(notification);
  }

  /**
   * Send a health tip notification
   */
  async sendHealthTip(userId: string, tip: string): Promise<void> {
    const notification: NotificationData = {
      title: 'Daily Eye Health Tip',
      message: tip,
      type: 'health_tip',
      userId,
    };
    await this.createNotification(notification);
  }

  /**
   * Send a result ready notification
   */
  async sendResultReady(userId: string, scanId: string): Promise<void> {
    const notification: NotificationData = {
      title: 'Scan Results Ready',
      message: 'Your eye scan analysis is complete. Tap to view your results.',
      type: 'result_ready',
      actionUrl: `/result/${scanId}`,
      userId,
    };
    await this.createNotification(notification);
  }

  /**
   * Send a system notification
   */
  async sendSystemNotification(userId: string, title: string, message: string): Promise<void> {
    const notification: NotificationData = {
      title,
      message,
      type: 'system',
      userId,
    };
    await this.createNotification(notification);
  }

  /**
   * Check user preferences and send notification if allowed
   */
  async sendNotificationWithPreferences(
    userId: string,
    notificationType: 'scanReminders' | 'healthTips' | 'resultAlerts' | 'systemUpdates',
    notificationData: NotificationData
  ): Promise<void> {
    try {
      // Check user preferences
      const preferences = await this.getUserNotificationPreferences(userId);
      
      if (preferences.notifications[notificationType]) {
        await this.createNotification(notificationData);
      }
    } catch (error) {
      console.error('Error sending notification with preferences:', error);
    }
  }

  /**
   * Get user notification preferences
   */
  private async getUserNotificationPreferences(userId: string): Promise<any> {
    try {
      const userDocRef = doc(db, 'userPreferences', userId);
      const userDoc = await getDocs(query(collection(db, 'userPreferences'), where('__name__', '==', userId)));
      
      if (!userDoc.empty) {
        return userDoc.docs[0].data();
      }
      
      // Return default preferences if not found
      return {
        notifications: {
          scanReminders: true,
          healthTips: true,
          resultAlerts: true,
          systemUpdates: true,
        }
      };
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return {
        notifications: {
          scanReminders: true,
          healthTips: true,
          resultAlerts: true,
          systemUpdates: true,
        }
      };
    }
  }

  /**
   * Schedule daily health tips (this would typically be called from a background service)
   */
  async scheduleDailyHealthTips(): Promise<void> {
    const healthTips = [
      "Remember to blink regularly when using digital devices to keep your eyes moist.",
      "Take a 20-second break every 20 minutes to look at something 20 feet away.",
      "Eat foods rich in omega-3 fatty acids, like fish, to support eye health.",
      "Wear sunglasses with UV protection when outdoors to protect your eyes.",
      "Stay hydrated - drinking enough water helps maintain eye moisture.",
      "Get regular eye exams even if you don't notice any problems.",
      "Adjust your screen brightness to match your surroundings to reduce eye strain.",
      "Use artificial tears if your eyes feel dry, especially in air-conditioned environments.",
    ];

    if (!auth.currentUser) return;

    const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];
    await this.sendNotificationWithPreferences(
      auth.currentUser.uid,
      'healthTips',
      {
        title: 'Daily Eye Health Tip',
        message: randomTip,
        type: 'health_tip',
        userId: auth.currentUser.uid,
      }
    );
  }

  /**
   * Create sample notifications for demonstration
   */
  async createSampleNotifications(userId: string): Promise<void> {
    const sampleNotifications: NotificationData[] = [
      {
        title: 'Welcome to Eye Specialist!',
        message: 'Thank you for joining us. Start by taking your first eye scan to establish a baseline.',
        type: 'system',
        userId,
      },
      {
        title: 'Daily Eye Health Tip',
        message: 'Remember to take breaks from screen time every 20 minutes to reduce eye strain.',
        type: 'health_tip',
        userId,
      },
      {
        title: 'Scan Reminder',
        message: 'It\'s been 7 days since your last scan. Regular monitoring helps track your eye health.',
        type: 'scan_reminder',
        userId,
      },
      {
        title: 'App Update Available',
        message: 'A new version of Eye Specialist is available with improved analysis accuracy.',
        type: 'system',
        userId,
      },
    ];

    await this.createBulkNotifications(sampleNotifications);
  }

  /**
   * Clear all notifications for a user
   */
  async clearAllNotifications(userId: string): Promise<void> {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(notificationsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const deletePromises = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, { isRead: true })
      );
      
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error clearing notifications:', error);
      throw error;
    }
  }
}

export default NotificationService;
