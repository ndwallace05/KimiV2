'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  Plus,
  Brain,
  Target,
  Zap
} from 'lucide-react'

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

interface EnhancedTask {
  refinedTitle: string
  effort: number
  subtasks: string[]
  suggestedTime: string
  blockers: string[]
}

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(false)
  const [enhancing, setEnhancing] = useState(false)
  const [enhancedTask, setEnhancedTask] = useState<EnhancedTask | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    }
  }

  const enhanceTask = async (taskTitle: string) => {
    setEnhancing(true)
    try {
      const response = await fetch('/api/suggestions/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskTitle })
      })

      if (response.ok) {
        const data = await response.json()
        setEnhancedTask(data)
      }
    } catch (error) {
      console.error('Failed to enhance task:', error)
    } finally {
      setEnhancing(false)
    }
  }

  const addTask = async () => {
    if (!newTask.trim()) return

    setLoading(true)
    try {
      // First enhance the task with AI
      await enhanceTask(newTask)
      
      // Then create the task
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: enhancedTask?.refinedTitle || newTask,
          description: '',
          priority: 'medium',
          estimatedEffort: enhancedTask?.effort,
          subtasks: enhancedTask?.subtasks,
          optimalTime: enhancedTask?.suggestedTime,
          blockers: enhancedTask?.blockers
        })
      })

      if (response.ok) {
        await fetchTasks()
        setNewTask('')
        setEnhancedTask(null)
      }
    } catch (error) {
      console.error('Failed to add task:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        await fetchTasks()
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchTasks()
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'todo': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const completedTasks = tasks.filter(task => task.status === 'completed').length
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Task Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckSquare className="h-5 w-5" />
            <span>Task Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Completion Rate</span>
              <span className="text-sm font-medium">{completionRate.toFixed(0)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{completedTasks} completed</span>
              <span>{totalTasks - completedTasks} remaining</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Task */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add New Task</span>
          </CardTitle>
          <CardDescription>
            Create a new task with AI-powered enhancement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="What do you need to accomplish?"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
            />
            <Button 
              onClick={addTask} 
              disabled={loading || !newTask.trim()}
              className="flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Brain className="h-4 w-4 animate-pulse" />
                  <span>Enhancing...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Add Task</span>
                </>
              )}
            </Button>
          </div>

          {/* AI Enhancement Preview */}
          {enhancing && (
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertDescription>
                AI is analyzing your task and suggesting improvements...
              </AlertDescription>
            </Alert>
          )}

          {enhancedTask && (
            <Alert className="border-blue-200 bg-blue-50">
              <Target className="h-4 w-4 text-blue-600" />
              <AlertDescription className="space-y-2">
                <div className="font-medium text-blue-800">AI-Enhanced Task:</div>
                <div className="text-sm space-y-1">
                  <div><strong>Title:</strong> {enhancedTask.refinedTitle}</div>
                  <div><strong>Effort:</strong> {enhancedTask.effort}/5</div>
                  <div><strong>Best Time:</strong> {enhancedTask.suggestedTime}</div>
                  {enhancedTask.subtasks.length > 0 && (
                    <div>
                      <strong>Subtasks:</strong>
                      <ul className="list-disc list-inside ml-2">
                        {enhancedTask.subtasks.map((subtask, index) => (
                          <li key={index} className="text-sm">{subtask}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium">{task.title}</h3>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status.replace('-', ' ')}
                  </Badge>
                </div>
                
                {task.description && (
                  <p className="text-sm text-muted-foreground">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  {task.dueDate && (
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Due: {formatDate(task.dueDate)}
                    </span>
                  )}
                  {task.estimatedEffort && (
                    <span className="flex items-center">
                      <Zap className="h-3 w-3 mr-1" />
                      {task.estimatedEffort}h estimated
                    </span>
                  )}
                  {task.optimalTime && (
                    <span>Best time: {task.optimalTime}</span>
                  )}
                </div>

                {task.subtasks && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Subtasks:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                      {JSON.parse(task.subtasks || '[]').map((subtask: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <div className="w-3 h-3 border rounded" />
                          <span>{subtask}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {task.blockers && JSON.parse(task.blockers || '[]').length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-orange-600">Blockers:</p>
                    <div className="space-y-1">
                      {JSON.parse(task.blockers || '[]').map((blocker: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-orange-600">
                          <AlertCircle className="h-3 w-3" />
                          <span>{blocker}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 ml-4">
                {task.status !== 'completed' && (
                  <Button 
                    size="sm" 
                    onClick={() => updateTaskStatus(task.id, 'completed')}
                    className="flex items-center space-x-1"
                  >
                    <CheckSquare className="h-3 w-3" />
                    <span>Complete</span>
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => deleteTask(task.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {tasks.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first task to get started with AI-powered productivity enhancement.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}