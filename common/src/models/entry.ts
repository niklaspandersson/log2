export type Entry = {
    id?: number;
    user_id: number;
    title?: string;
    text: string;

    date: Date|string;
    created?: Date;
    updated?: Date;
}