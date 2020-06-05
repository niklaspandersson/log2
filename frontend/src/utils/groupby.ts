export function groupBy<T>(arr:T[], prop:string) {
    return arr.reduce((acc, a) => {
        const key = (a as any)[prop] as string;
        if(!acc.has(key))
            acc.set(key, []);
        
        acc.get(key)!.push(a);

        return acc;
    }, new Map<string, T[]>())
}