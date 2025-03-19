export interface Notification {
    id: number;
    body: string;
    timestamp: string;
    read: boolean;
}

export function processNotificationMessage(input: string, backgroundColor: string): string {
    const regex = /"([^"]+)"<([^>]+)>/g;

    const defaultColor = { text: "text-blue-500", hover: "hover:text-blue-700" };

    const colorMapping: Record<string, { text: string, hover: string }>
        = {
        red: { text: "text-yellow-200", hover: "hover:text-yellow-400" },
        green: { text: "text-pink-500", hover: "hover:text-pink-700" },
        blue: { text: "text-orange-300", hover: "hover:text-orange-500" },
        orange: { text: "text-teal-300", hover: "hover:text-teal-500" },
        yellow: { text: "text-purple-500", hover: "hover:text-purple-700" },
    };

    const getColorScheme = (bgColor: string) => {
        return colorMapping[bgColor] || defaultColor;
    };

    const { text, hover } = getColorScheme(backgroundColor);

    let ret = input.replace(regex, (match, boardName, boardPath) => {
        return `<a class="${text} ${hover} underline" href="${boardPath}">${boardName}</a>`;
    }
    );
    return ret;
}
