import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;
  private adminSocket: Socket | null = null;

  connectAdmin() {
    if (this.adminSocket?.connected) return;

    this.adminSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    this.adminSocket.on('connect', () => {
      console.log('Admin socket connected');
      this.adminSocket?.emit('register', { type: 'admin' });
    });

    this.adminSocket.on('disconnect', () => {
      console.log('Admin socket disconnected');
    });

    this.adminSocket.on('delivery_online', (data) => {
      console.log('Delivery online:', data);
    });

    this.adminSocket.on('delivery_offline', (data) => {
      console.log('Delivery offline:', data);
    });

    this.adminSocket.on('delivery_status_changed', (data) => {
      console.log('Delivery status changed:', data);
    });

    this.adminSocket.on('new_order', (data) => {
      console.log('New order:', data);
    });

    this.adminSocket.on('order_assigned', (data) => {
      console.log('Order assigned:', data);
    });

    return this.adminSocket;
  }

  disconnectAdmin() {
    if (this.adminSocket) {
      this.adminSocket.disconnect();
      this.adminSocket = null;
    }
  }

  onDeliveryOnline(callback: (data: { userId: number; name: string; lastname: string }) => void) {
    this.adminSocket?.on('delivery_online', callback);
  }

  onDeliveryOffline(callback: (data: { userId: number; name: string; lastname: string }) => void) {
    this.adminSocket?.on('delivery_offline', callback);
  }

  onDeliveryStatusChanged(callback: (data: { deliveryId: number; isOnline: boolean }) => void) {
    this.adminSocket?.on('delivery_status_changed', callback);
  }

  onNewOrder(callback: (data: any) => void) {
    this.adminSocket?.on('new_order', callback);
  }

  onOrderAssigned(callback: (data: { orderId: number; deliveryName: string }) => void) {
    this.adminSocket?.on('order_assigned', callback);
  }

  getSocket() {
    return this.adminSocket;
  }
}

export const socketService = new SocketService();