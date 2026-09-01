import { Response } from 'express';
import { logger } from '../../utils/logger';

interface SSEClient {
  id: string;
  userId: string;
  roles: string[];
  res: Response;
}

export class SSEManager {
  private static instance: SSEManager;
  private clients: Map<string, Set<SSEClient>> = new Map(); // userId -> Set<SSEClient>
  private heartbeatInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startHeartbeat();
  }

  public static getInstance(): SSEManager {
    if (!SSEManager.instance) {
      SSEManager.instance = new SSEManager();
    }
    return SSEManager.instance;
  }

  /**
   * Register a new client connection for a given user
   */
  public addClient(userId: string, roles: string[], res: Response): string {
    const clientId = `${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const client: SSEClient = { id: clientId, userId, roles, res };

    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId)!.add(client);

    logger.info(`[SSEManager] Client connected: ${clientId} for user ${userId}. Total active user connections: ${this.clients.size}`);

    // Send initial connection establishment event
    this.sendRawEvent(res, 'connected', {
      clientId,
      userId,
      timestamp: new Date().toISOString(),
      message: 'Real-time event stream connected.',
    });

    // Cleanup on client disconnect
    res.on('close', () => {
      this.removeClient(userId, clientId);
    });

    return clientId;
  }

  /**
   * Remove a client connection
   */
  public removeClient(userId: string, clientId: string): void {
    const userClients = this.clients.get(userId);
    if (userClients) {
      for (const client of userClients) {
        if (client.id === clientId) {
          userClients.delete(client);
          break;
        }
      }
      if (userClients.size === 0) {
        this.clients.delete(userId);
      }
    }
    logger.info(`[SSEManager] Client disconnected: ${clientId}. Remaining connections for user: ${userClients?.size || 0}`);
  }

  /**
   * Broadcast an event to all active connections for a specific user
   */
  public broadcastToUser(userId: string, eventType: string, data: any): void {
    const userClients = this.clients.get(userId);
    if (!userClients || userClients.size === 0) return;

    for (const client of userClients) {
      this.sendRawEvent(client.res, eventType, data);
    }
  }

  /**
   * Broadcast an event to all connected users who possess a specific role (e.g. 'admin' or 'seller')
   */
  public broadcastToRole(role: string, eventType: string, data: any): void {
    for (const [, userClients] of this.clients.entries()) {
      for (const client of userClients) {
        if (client.roles.includes(role)) {
          this.sendRawEvent(client.res, eventType, data);
        }
      }
    }
  }

  /**
   * Format and send raw SSE payload
   */
  private sendRawEvent(res: Response, eventType: string, data: any): void {
    try {
      res.write(`event: ${eventType}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (err) {
      logger.warn(`[SSEManager] Error writing to stream:`, err);
    }
  }

  /**
   * Heartbeat to prevent reverse proxy (Nginx/Cloudflare) connection timeouts (every 25s)
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) return;

    this.heartbeatInterval = setInterval(() => {
      for (const [, userClients] of this.clients.entries()) {
        for (const client of userClients) {
          try {
            client.res.write(`: heartbeat ${Date.now()}\n\n`);
          } catch {
            // Ignored, client will be cleaned up on close
          }
        }
      }
    }, 25000);

    // Ensure interval doesn't prevent Node process exit
    if (this.heartbeatInterval.unref) {
      this.heartbeatInterval.unref();
    }
  }
}

export const sseManager = SSEManager.getInstance();
