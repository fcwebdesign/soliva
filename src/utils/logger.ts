/**
 * Système de logging centralisé pour le projet
 * Remplace console.log avec contrôle par environnement
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LoggerConfig {
  enabled: boolean;
  level: LogLevel[];
}

class Logger {
  private config: LoggerConfig;

  constructor() {
    this.config = {
      enabled: process.env.NODE_ENV === 'development',
      level: ['info', 'warn', 'error', 'debug'],
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return this.config.enabled && this.config.level.includes(level);
  }

  info(...args: any[]) {
    if (this.shouldLog('info')) {
      console.log('ℹ️', ...args);
    }
  }

  warn(...args: any[]) {
    if (this.shouldLog('warn')) {
      console.warn('⚠️', ...args);
    }
  }

  error(...args: any[]) {
    if (this.shouldLog('error')) {
      console.error('❌', ...args);
    }
  }

  debug(...args: any[]) {
    if (this.shouldLog('debug')) {
      console.log('🔍', ...args);
    }
  }

  // Pour garder la compatibilité avec l'ancien code
  log(...args: any[]) {
    this.info(...args);
  }
}

export const logger = new Logger();
export default logger;

