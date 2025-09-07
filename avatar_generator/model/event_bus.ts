type EventHandler = (...args: any[]) => void;

class EventBus {
  static events: { [key: string]: EventHandler[] } = {};

  // 订阅事件
  static on(event: string, handler: EventHandler): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(handler);
  }

  // 取消订阅事件
  static off(event: string, handler: EventHandler): void {
    if (!this.events[event]) return;
    
    this.events[event] = this.events[event].filter(h => h !== handler);
  }

  // 触发事件
  static emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;
    
    this.events[event].forEach(handler => handler(...args));
  }
}

const EventDrawEnterRoom = "draw_enter_room";

export {
  EventBus,
  EventHandler,
  EventDrawEnterRoom
}