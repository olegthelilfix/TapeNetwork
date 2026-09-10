import "server-only";

import { HEATMAP_TRADING_HOURS_ID } from "@/domain/heatmap";

export type ScheduleRequest = {
    readonly schedules: readonly string[];
    readonly start: number;
    readonly stop: number;
    readonly tz?: string;
};

type ScheduleSessionType = "NO_TRADING" | "PRE_MARKET" | "REGULAR" | "AFTER_MARKET";

type ScheduleSession = {
    readonly startTime: string;
    readonly endTime: string;
    readonly type: ScheduleSessionType;
};

type ScheduleDay = {
    readonly id: string;
    readonly isHoliday: "true" | "false";
    readonly isShort: "true" | "false";
    readonly sessions: readonly ScheduleSession[];
};

export type ScheduleResponse = readonly Record<
    string,
    { readonly schedule: { readonly name: string; readonly timeZone: string; readonly days: readonly ScheduleDay[] } }
>[];

const MS_PER_DAY = 86_400_000;
// Fixed EST offset — a mock doesn't need real DST transitions, only the
// "YYYY-MM-DD HH:mm:ss+ZZ" shape the widget's dayjs parser expects.
const SESSION_OFFSET = "-05:00";

const formatSessionTime = (dateId: string, time: string): string => `${dateId} ${time}${SESSION_OFFSET}`;

const buildDay = (dateId: string, isWeekend: boolean): ScheduleDay => {
    if (isWeekend) {
        return {
            id: dateId,
            isHoliday: "true",
            isShort: "false",
            sessions: [
                {
                    startTime: formatSessionTime(dateId, "00:00:00"),
                    endTime: formatSessionTime(dateId, "23:59:59"),
                    type: "NO_TRADING",
                },
            ],
        };
    }

    return {
        id: dateId,
        isHoliday: "false",
        isShort: "false",
        sessions: [
            { startTime: formatSessionTime(dateId, "04:00:00"), endTime: formatSessionTime(dateId, "09:30:00"), type: "PRE_MARKET" },
            { startTime: formatSessionTime(dateId, "09:30:00"), endTime: formatSessionTime(dateId, "16:00:00"), type: "REGULAR" },
            { startTime: formatSessionTime(dateId, "16:00:00"), endTime: formatSessionTime(dateId, "20:00:00"), type: "AFTER_MARKET" },
        ],
    };
};

const buildDays = (start: number, stop: number): ScheduleDay[] => {
    const firstDay = Math.floor(start / MS_PER_DAY) * MS_PER_DAY;
    const lastDay = Math.ceil(stop / MS_PER_DAY) * MS_PER_DAY;
    const days: ScheduleDay[] = [];

    for (let day = firstDay; day <= lastDay; day += MS_PER_DAY) {
        const date = new Date(day);
        const dateId = date.toISOString().slice(0, 10);
        const isWeekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;
        days.push(buildDay(dateId, isWeekend));
    }

    return days;
};

export const buildScheduleResponse = (request: ScheduleRequest): ScheduleResponse => {
    const days = buildDays(request.start, request.stop);

    return request.schedules.map((scheduleId) => ({
        [scheduleId]: {
            schedule: {
                name: scheduleId === HEATMAP_TRADING_HOURS_ID ? "US Equity Regular Trading Hours" : scheduleId,
                timeZone: "America/New_York",
                days,
            },
        },
    }));
};
