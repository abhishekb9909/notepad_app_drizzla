import { useState } from 'react'
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale/en-US'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = {
    'en-US': enUS,
}

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
})

interface CalendarViewProps {
    events: any[]
}

export default function CalendarView({ events }: CalendarViewProps) {
    const [view, setView] = useState<View>('month')

    const formattedEvents = events.map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
    }))

    return (
        <div className="h-[600px] bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
            <Calendar
                localizer={localizer}
                events={formattedEvents}
                startAccessor="start"
                endAccessor="end"
                view={view}
                onView={(newView) => setView(newView)}
                style={{ height: '100%' }}
                className="text-white"
            />
        </div>
    )
}
