import { useState } from 'react' // Import useState
// Simple list view of tasks sorted by date for now, acting as a calendar agenda
// In a full implementation, could use 'react-calendar' or similar

export default function CalendarView({ tasks }) {
    const tasksWithDueDates = tasks
        .filter(t => t.due_date)
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))

    return (
        <div className="calendar-view">
            <h3>Upcoming Deadlines</h3>
            {tasksWithDueDates.length === 0 ? (
                <p>No upcoming tasks with due dates.</p>
            ) : (
                <div className="task-list">
                    {tasksWithDueDates.map(task => (
                        <div key={task.id} className="task-card">
                            <div className="task-content">
                                <h4>{task.title}</h4>
                                <p style={{ fontSize: '0.8rem', color: '#888' }}>
                                    Due: {new Date(task.due_date).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
