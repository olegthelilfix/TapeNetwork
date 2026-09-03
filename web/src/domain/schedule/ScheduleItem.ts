export type ScheduleItem = {
    readonly timeEt: string;
    readonly showName: string | null;
    readonly showSlug: string | null;
    readonly hostsLabel: string | null;
    readonly isLive: boolean;
};

export const createScheduleItem = (input: ScheduleItem): ScheduleItem => {
    return input;
};
