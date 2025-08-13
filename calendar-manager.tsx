'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Brain,
  TrendingUp,
  Plus,
  Target,
  Zap,
  Users
} from 'lucide-react'

interface Event {
  id: string
  title: string
  start: string
  end: string
  location?: string
  isFocusBlock: boolean
  category?: 'meeting' | 'focus-time' | 'appointment' | 'personal'
  attendees?: number
  preparationNeeded?: boolean
  optimalPrepTime?: number
  aiInsights?: {
    timeUntilEvent: string
    preparationStatus: 'ready' | 'needs-prep' | 'overdue'
    suggestedActions: string[]
    productivityScore: number
  }
}

interface CalendarStats {
  totalEvents: number
  meetingsToday: number
  focusTime: number
  avgMeetingDuration: number
  productivityScore: number
}

interface DaySchedule {
  date: string
  events: Event[]
  totalFocusTime: number
  meetingCount: number
  optimalTimes: string[]
}

export function CalendarManager() {
  const [events, setEvents] = useState<Event[]>([])
  const [stats, setStats] = useState<CalendarStats>({
    totalEvents: 0,
    meetingsToday: 0,
    focusTime: 0,
    avgMeetingDuration: 0,
    productivityScore: 0
  })
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>([])
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      // Simulate fetching calendar events with AI insights
      const now = new Date()
      const mockEvents: Event[] = [
        {
          id: '1',
          title: 'Daily Standup',
          start: new Date(now.getTime() + 1 * 60 * 60 * 1000).toISOString(),
          end: new Date(now.getTime() + 1.5 * 60 * 60 * 1000).toISOString(),
          category: 'meeting',
          attendees: 8,
          preparationNeeded: false,
          aiInsights: {
            timeUntilEvent: '1 hour',
            preparationStatus: 'ready',
            suggestedActions: ['Review daily goals', 'Check blockers'],
            productivityScore: 0.8
          }
        },
        {
          id: '2',
          title: 'Focus Time - Deep Work',
          start: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(),
          end: new Date(now.getTime() + 5 * 60 * 60 * 1000).toISOString(),
          category: 'focus-time',
          isFocusBlock: true,
          aiInsights: {
            timeUntilEvent: '3 hours',
            preparationStatus: 'ready',
            suggestedActions: ['Close email', 'Turn on Do Not Disturb'],
            productivityScore: 0.95
          }
        },
        {
          id: '3',
          title: 'Client Presentation',
          start: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
          end: new Date(now.getTime() + 7 * 60 * 60 * 1000).toISOString(),
          location: 'Conference Room A',
          category: 'meeting',
          attendees: 5,
          preparationNeeded: true,
          optimalPrepTime: 30,
          aiInsights: {
            timeUntilEvent: '6 hours',
            preparationStatus: 'needs-prep',
            suggestedActions: ['Review presentation slides', 'Prepare talking points', 'Test demo'],
            productivityScore: 0.9
          }
        },
        {
          id: '4',
          title: 'Team Lunch',
          start: new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString(),
          end: new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString(),
          location: 'Cafeteria',
          category: 'personal',
          attendees: 4,
          aiInsights: {
            timeUntilEvent: '8 hours',
            preparationStatus: 'ready',
            suggestedActions: [],
            productivityScore: 0.6
          }
        },
        {
          id: '5',
          title: '1:1 with Manager',
          start: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          end: new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString(),
          category: 'meeting',
          attendees: 2,
          preparationNeeded: true,
          optimalPrepTime: 15,
          aiInsights: {
            timeUntilEvent: '1 day',
            preparationStatus: 'needs-prep',
            suggestedActions: ['Review achievements', 'Prepare discussion points'],
            productivityScore: 0.85
          }
        }
      ]

      setEvents(mockEvents)
      
      // Calculate stats
      const today = now.toDateString()
      const todayEvents = mockEvents.filter(e => new Date(e.start).toDateString() === today)
      const focusTimeEvents = mockEvents.filter(e => e.isFocusBlock)
      const totalFocusTime = focusTimeEvents.reduce((acc, event) => {
        const duration = (new Date(event.end).getTime() - new Date(event.start).getTime()) / (1000 * 60 * 60)
        return acc + duration
      }, 0)
      
      const meetingEvents = mockEvents.filter(e => e.category === 'meeting')
      const avgMeetingDuration = meetingEvents.length > 0 
        ? meetingEvents.reduce((acc, event) => {
            const duration = (new Date(event.end).getTime() - new Date(event.start).getTime()) / (1000 * 60)
            return acc + duration
          }, 0) / meetingEvents.length
        : 0

      setStats({
        totalEvents: mockEvents.length,
        meetingsToday: todayEvents.filter(e => e.category === 'meeting').length,
        focusTime: Math.round(totalFocusTime * 10) / 10,
        avgMeetingDuration: Math.round(avgMeetingDuration),
        productivityScore: 0.82 // Calculated based on various factors
      })

      // Generate weekly schedule
      const weeklySchedule: DaySchedule[] = []
      for (let i = 0; i < 7; i++) {
        const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000)
        const dayEvents = mockEvents.filter(e => 
          new Date(e.start).toDateString() === date.toDateString()
        )
        const dayFocusTime = dayEvents
          .filter(e => e.isFocusBlock)
          .reduce((acc, event) => {
            const duration = (new Date(event.end).getTime() - new Date(event.start).getTime()) / (1000 * 60 * 60)
            return acc + duration
          }, 0)

        weeklySchedule.push({
          date: date.toDateString(),
          events: dayEvents,
          totalFocusTime: Math.round(dayFocusTime * 10) / 10,
          meetingCount: dayEvents.filter(e => e.category === 'meeting').length,
          optimalTimes: i === 0 ? ['9:00 AM', '2:00 PM'] : ['10:00 AM', '3:00 PM'] // Simulated optimal times
        })
      }
      setWeeklySchedule(weeklySchedule)
    } catch (error) {
      console.error('Failed to fetch events:', error)
    }
  }

  const analyzeEvent = async (eventId: string) => {
    setAnalyzing(true)
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { 
              ...event, 
              aiInsights: {
                timeUntilEvent: `${Math.floor(Math.random() * 24) + 1} hours`,
                preparationStatus: Math.random() > 0.5 ? 'ready' : 'needs-prep',
                suggestedActions: [
                  'Review preparation materials',
                  'Check attendee availability',
                  'Prepare talking points'
                ].slice(0, Math.floor(Math.random() * 3) + 1),
                productivityScore: Math.random() * 0.4 + 0.6
              }
            }
          : event
      ))
    } catch (error) {
      console.error('Failed to analyze event:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'meeting': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'focus-time': return 'bg-green-100 text-green-800 border-green-200'
      case 'appointment': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'personal': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPreparationColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800'
      case 'needs-prep': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    
    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const getDuration = (start: string, end: string) => {
    const duration = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60)
    if (duration < 60) return `${Math.round(duration)}m`
    return `${Math.floor(duration / 60)}h ${Math.round(duration % 60)}m`
  }

  return (
    <div className="space-y-6">
      {/* Calendar Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.totalEvents}</div>
                <div className="text-xs text-muted-foreground">Total Events</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{stats.meetingsToday}</div>
                <div className="text-xs text-muted-foreground">Meetings Today</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.focusTime}h</div>
                <div className="text-xs text-muted-foreground">Focus Time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{stats.avgMeetingDuration}m</div>
                <div className="text-xs text-muted-foreground">Avg Meeting</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{(stats.productivityScore * 100).toFixed(0)}%</div>
                <div className="text-xs text-muted-foreground">Productivity</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Banner */}
      <Alert className="border-purple-200 bg-purple-50">
        <Brain className="h-4 w-4 text-purple-600" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-purple-800">Smart Calendar Insights</span>
              <p className="text-sm text-purple-700 mt-1">
                AI analyzes your schedule to optimize focus time, suggest preparation, and improve productivity.
              </p>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => fetchEvents()}
              disabled={analyzing}
            >
              {analyzing ? 'Analyzing...' : 'Refresh Insights'}
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Today's Schedule</span>
          </CardTitle>
          <CardDescription>
            Your events and AI-powered recommendations for today
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {events
            .filter(event => new Date(event.start).toDateString() === new Date().toDateString())
            .map((event) => (
              <Card key={event.id} className="p-4 border-l-4 border-l-blue-500">
                <div className="space-y-3">
                  {/* Event Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-lg">{event.title}</h3>
                        <Badge className={getCategoryColor(event.category || 'meeting')}>
                          {event.category?.replace('-', ' ').toUpperCase() || 'MEETING'}
                        </Badge>
                        {event.isFocusBlock && (
                          <Badge variant="outline">Focus Time</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(event.start)} - {formatTime(event.end)} ({getDuration(event.start, event.end)})
                        </span>
                        {event.location && (
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {event.location}
                          </span>
                        )}
                        {event.attendees && (
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {event.attendees} attendees
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">In</div>
                      <div className="text-sm font-medium">
                        {event.aiInsights?.timeUntilEvent || 'Calculating...'}
                      </div>
                    </div>
                  </div>

                  {/* AI Insights */}
                  {event.aiInsights && (
                    <Alert className={event.aiInsights.preparationStatus === 'needs-prep' 
                      ? "border-yellow-200 bg-yellow-50" 
                      : "border-green-200 bg-green-50"
                    }>
                      <Brain className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-yellow-800">
                            Preparation Status: 
                            <Badge className={`ml-2 ${getPreparationColor(event.aiInsights.preparationStatus)}`}>
                              {event.aiInsights.preparationStatus.replace('-', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-sm text-yellow-700">
                            Productivity Score: {(event.aiInsights.productivityScore * 100).toFixed(0)}%
                          </div>
                        </div>
                        
                        {event.aiInsights.suggestedActions.length > 0 && (
                          <div>
                            <div className="text-sm font-medium text-yellow-800 mb-1">Suggested Actions:</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                              {event.aiInsights.suggestedActions.map((action, index) => (
                                <div key={index} className="text-sm text-yellow-700 flex items-center">
                                  <Target className="h-3 w-3 mr-1" />
                                  {action}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Plus className="h-3 w-3 mr-1" />
                        Join
                      </Button>
                      {event.preparationNeeded && (
                        <Button size="sm" variant="outline">
                          <Target className="h-3 w-3 mr-1" />
                          Prepare
                        </Button>
                      )}
                    </div>
                    
                    {!event.aiInsights && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => analyzeEvent(event.id)}
                        disabled={analyzing}
                      >
                        <Brain className="h-3 w-3 mr-1" />
                        {analyzing ? 'Analyzing...' : 'Analyze'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          
          {events.filter(event => new Date(event.start).toDateString() === new Date().toDateString()).length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No events scheduled for today</h3>
              <p className="text-muted-foreground">
                Enjoy your free time or consider scheduling some focus blocks.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Weekly Overview</span>
          </CardTitle>
          <CardDescription>
            Your schedule and optimal times for the week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {weeklySchedule.map((day, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="text-center mb-2">
                  <div className="font-medium">{formatDate(day.date)}</div>
                  <div className="text-sm text-muted-foreground">
                    {day.meetingCount} meetings
                  </div>
                  {day.totalFocusTime > 0 && (
                    <div className="text-sm text-green-600">
                      {day.totalFocusTime}h focus
                    </div>
                  )}
                </div>
                
                {day.optimalTimes.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <div className="text-xs text-muted-foreground mb-1">Optimal times:</div>
                    {day.optimalTimes.map((time, timeIndex) => (
                      <div key={timeIndex} className="text-xs text-blue-600">
                        {time}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>
            Events scheduled for the next few days
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {events
            .filter(event => new Date(event.start) > new Date())
            .slice(0, 5)
            .map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium">{event.title}</h4>
                    <Badge className={getCategoryColor(event.category || 'meeting')}>
                      {event.category?.replace('-', ' ').toUpperCase() || 'MEETING'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(event.start)}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(event.start)}
                    </span>
                    {event.location && (
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="text-sm font-medium">{getDuration(event.start, event.end)}</div>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}