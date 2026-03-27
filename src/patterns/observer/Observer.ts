/**
 * Observer Pattern - Interfaces
 * Used for UI updates (health bars) subscribing to game events
 */

/**
 * Observer interface - receives updates from subjects
 */
export interface IObserver<T> {
    update(data: T): void;
}

/**
 * Subject interface - notifies observers of changes
 */
export interface ISubject<T> {
    attach(observer: IObserver<T>): void;
    detach(observer: IObserver<T>): void;
    notify(data: T): void;
}

/**
 * Base Subject class with observer management
 */
export abstract class Subject<T> implements ISubject<T> {
    private observers: Set<IObserver<T>> = new Set();

    attach(observer: IObserver<T>): void {
        this.observers.add(observer);
    }

    detach(observer: IObserver<T>): void {
        this.observers.delete(observer);
    }

    notify(data: T): void {
        this.observers.forEach(observer => observer.update(data));
    }

    protected getObserverCount(): number {
        return this.observers.size;
    }
}
