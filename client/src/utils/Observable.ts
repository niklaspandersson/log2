export default class Observable<T> {
    constructor(obj:T) {
      this.object = obj;
    }
  
    protected object: T;
    private listeners:Array<((value:T) => void)> = [];
  
    public get value() { return this.object; }
    public set value(val:T) { this.object = val; this.notifyChange(); }

    addListener = (changeHandler:(value:T) => void) => {
      this.listeners.push(changeHandler);
    }
    removeListener = (changeHandler:(value:T) => void) => {
      this.listeners.splice(this.listeners.indexOf(changeHandler), 1);
    }
    removeAllListeners() {
      this.listeners = [];
    }
  
    protected notifyChange() {
      this.listeners.forEach(callback => callback(this.object));
    }
  }