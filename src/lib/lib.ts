
export function asArray<T>(any : T | T[]) : T[]  {
    return Array.isArray(any) ? any : [any];
}