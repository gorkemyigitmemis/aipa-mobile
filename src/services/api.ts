import axios from 'axios';
import { Platform } from 'react-native';

// Backend URL'si.
// Android Emülatöründen localhost'a erişmek için 10.0.2.2 kullanılır.
// iOS Simülatöründe localhost çalışır.
// Gerçek cihazlarda bilgisayarın ağ üzerindeki yerel IP'si (örn. 192.168.1.x) yazılmalıdır.
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080/api' : 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});
