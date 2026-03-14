// Storage polyfill for local development
const storage = {
  async get(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? { key, value } : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },
  
  async set(key, value) {
    try {
      localStorage.setItem(key, value);
      return { key, value };
    } catch (error) {
      console.error('Storage set error:', error);
      return null;
    }
  },
  
  async delete(key) {
    try {
      localStorage.removeItem(key);
      return { key, deleted: true };
    } catch (error) {
      console.error('Storage delete error:', error);
      return null;
    }
  },
  
  async list(prefix) {
    try {
      const keys = Object.keys(localStorage).filter(key => !prefix || key.startsWith(prefix));
      return { keys };
    } catch (error) {
      console.error('Storage list error:', error);
      return { keys: [] };
    }
  }
};

// Make sure storage is available globally
if (typeof window !== 'undefined') {
  window.storage = storage;
}

export default storage;