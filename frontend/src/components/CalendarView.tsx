import { useState, useEffect } from 'react'
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { Task } from '../types'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = {
    'en-US': require('date-fns/locale/en-US'),
}

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
})

interface CalendarViewProps {
    tasks: Task[]
}

export default function CalendarView({ tasks }: CalendarViewProps) {
    const [view, setView] = useState<View>('month')

    const events = tasks
        .filter(t => t.due_date)
        .map(task => ({
            id: task.id,
            title: task.title,
            start: new Date(task.due_date!),
            end: new Date(task.due_date!),
            resource: task,
        }))

    return (
        <div className="h-[600px] bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
            <Calendar
                localizer={localizer}
                events={events}
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
