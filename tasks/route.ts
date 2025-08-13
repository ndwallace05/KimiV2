import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface Task {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in-progress' | 'completed'
  dueDate?: string
  estimatedEffort?: number
  subtasks?: string[]
  optimalTime?: string
  blockers?: string[]
  createdAt: string
  updatedAt: string
}

// GET /api/tasks - Fetch all tasks
export async function GET() {
  try {
    const tasks = await db.task.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, priority, dueDate } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Simulate AI enhancement (in a real app, this would call the AI service)
    const enhancedTask = {
      title,
      description,
      priority: priority || 'medium',
      status: 'todo' as const,
      dueDate,
      estimatedEffort: Math.floor(Math.random() * 5) + 1, // Random effort for demo
      subtasks: ['Research requirements', 'Implementation', 'Testing'],
      optimalTime: ['Morning', 'Afternoon', 'Evening'][Math.floor(Math.random() * 3)],
      blockers: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const task = await db.task.create({
      data: enhancedTask
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Failed to create task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}