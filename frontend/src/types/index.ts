export interface Task {
    id: string
    user_id: string
    title: string
    content?: string
    is_done: boolean
    due_date?: string
    created_at: string
}

export interface TaskCreate {
    title: string
    content?: string
    is_done?: boolean
    due_date?: string
}

export interface TaskUpdate {
    title?: string
    content?: string
    is_done?: boolean
    due_date?: string
}
