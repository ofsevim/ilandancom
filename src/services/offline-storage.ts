// Offline storage for when all network requests are blocked
class OfflineStorage {
  private storageKey = 'ilandan_offline_updates';

  async saveUpdate(id: string, data: any): Promise<void> {
    try {
      const updates = this.getPendingUpdates();
      updates[id] = {
        ...data,
        timestamp: Date.now(),
        status: 'pending'
      };
      localStorage.setItem(this.storageKey, JSON.stringify(updates));
      console.log('Update saved to offline storage:', id);
    } catch (error) {
      console.error('Failed to save offline update:', error);
    }
  }

  getPendingUpdates(): Record<string, any> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to get pending updates:', error);
      return {};
    }
  }

  markUpdateComplete(id: string): void {
    try {
      const updates = this.getPendingUpdates();
      if (updates[id]) {
        updates[id].status = 'completed';
        updates[id].completedAt = Date.now();
        localStorage.setItem(this.storageKey, JSON.stringify(updates));
      }
    } catch (error) {
      console.error('Failed to mark update complete:', error);
    }
  }

  clearCompletedUpdates(): void {
    try {
      const updates = this.getPendingUpdates();
      const pendingUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, update]: [string, any]) => 
          update.status !== 'completed'
        )
      );
      localStorage.setItem(this.storageKey, JSON.stringify(pendingUpdates));
    } catch (error) {
      console.error('Failed to clear completed updates:', error);
    }
  }

  async retryPendingUpdates(): Promise<void> {
    const updates = this.getPendingUpdates();
    const pendingIds = Object.keys(updates).filter(id => 
      updates[id].status === 'pending'
    );

    for (const id of pendingIds) {
      try {
        // Try to sync with server when connection is available
        console.log('Retrying update for:', id);
        // This would be called when network is available
      } catch (error) {
        console.error('Failed to retry update:', id, error);
      }
    }
  }
}

export const offlineStorage = new OfflineStorage();
