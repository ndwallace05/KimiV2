'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Mail, 
  Clock, 
  Paperclip, 
  Brain,
  TrendingUp,
  Eye,
  Archive,
  Reply
} from 'lucide-react'

interface Email {
  id: string
  subject: string
  from: string
  snippet: string
  priority: number
  timestamp: string
  hasAttachment: boolean
  category?: 'urgent' | 'important' | 'normal' | 'low'
  suggestedAction?: 'reply-today' | 'reply-week' | 'delegate' | 'archive'
  aiAnalysis?: {
    priorityLevel: 'High' | 'Medium' | 'Low'
    suggestedAction: string
    reason: string
  }
}

interface EmailStats {
  totalEmails: number
  urgentCount: number
  importantCount: number
  avgResponseTime: number
  topSenders: string[]
}

export function EmailManager() {
  const [emails, setEmails] = useState<Email[]>([])
  const [stats, setStats] = useState<EmailStats>({
    totalEmails: 0,
    urgentCount: 0,
    importantCount: 0,
    avgResponseTime: 0,
    topSenders: []
  })
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    fetchEmails()
  }, [])

  const fetchEmails = async () => {
    try {
      // Simulate fetching emails with AI analysis
      const mockEmails: Email[] = [
        {
          id: '1',
          subject: 'Budget Approval Required - Q1 Planning',
          from: 'finance@company.com',
          snippet: 'Please review and approve the Q1 budget proposal for your department. We need your feedback by EOD tomorrow...',
          priority: 0.95,
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          hasAttachment: true,
          category: 'urgent',
          suggestedAction: 'reply-today',
          aiAnalysis: {
            priorityLevel: 'High',
            suggestedAction: 'Reply today',
            reason: 'Urgent budget approval with deadline'
          }
        },
        {
          id: '2',
          subject: 'Team Meeting Tomorrow - Agenda Review',
          from: 'manager@company.com',
          snippet: 'Don\'t forget about our team sync tomorrow at 10 AM. Please review the attached agenda and come prepared...',
          priority: 0.75,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          hasAttachment: true,
          category: 'important',
          suggestedAction: 'reply-today',
          aiAnalysis: {
            priorityLevel: 'Medium',
            suggestedAction: 'Reply today',
            reason: 'Meeting preparation required'
          }
        },
        {
          id: '3',
          subject: 'Project Update - Phase 2 Completion',
          from: 'client@company.com',
          snippet: 'Here\'s the latest update on the project timeline. Phase 2 is ahead of schedule and we\'re ready for review...',
          priority: 0.65,
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          hasAttachment: false,
          category: 'important',
          suggestedAction: 'reply-week',
          aiAnalysis: {
            priorityLevel: 'Medium',
            suggestedAction: 'Reply this week',
            reason: 'Project update requires attention but not urgent'
          }
        },
        {
          id: '4',
          subject: 'Newsletter: Industry Trends Q4',
          from: 'news@industry.com',
          snippet: 'This week\'s top stories in tech industry trends, market analysis, and upcoming events...',
          priority: 0.25,
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          hasAttachment: false,
          category: 'low',
          suggestedAction: 'archive',
          aiAnalysis: {
            priorityLevel: 'Low',
            suggestedAction: 'Archive',
            reason: 'Newsletter - informational only'
          }
        },
        {
          id: '5',
          subject: 'Follow Up: Design Feedback Needed',
          from: 'designer@company.com',
          snippet: 'Following up on the design mockups I sent last week. Could you please provide your feedback when you have a moment...',
          priority: 0.55,
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          hasAttachment: false,
          category: 'normal',
          suggestedAction: 'reply-week',
          aiAnalysis: {
            priorityLevel: 'Medium',
            suggestedAction: 'Reply this week',
            reason: 'Follow-up on pending feedback'
          }
        }
      ]

      setEmails(mockEmails)
      
      // Calculate stats
      const urgentCount = mockEmails.filter(e => e.category === 'urgent').length
      const importantCount = mockEmails.filter(e => e.category === 'important').length
      const topSenders = mockEmails.reduce((acc, email) => {
        const domain = email.from.split('@')[1]
        acc[domain] = (acc[domain] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      setStats({
        totalEmails: mockEmails.length,
        urgentCount,
        importantCount,
        avgResponseTime: 120, // minutes
        topSenders: Object.entries(topSenders)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([domain]) => domain)
      })
    } catch (error) {
      console.error('Failed to fetch emails:', error)
    }
  }

  const analyzeEmail = async (emailId: string) => {
    setAnalyzing(true)
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setEmails(prev => prev.map(email => 
        email.id === emailId 
          ? { 
              ...email, 
              aiAnalysis: {
                priorityLevel: email.priority > 0.8 ? 'High' : email.priority > 0.6 ? 'Medium' : 'Low',
                suggestedAction: email.priority > 0.8 ? 'Reply today' : email.priority > 0.6 ? 'Reply this week' : 'Archive',
                reason: 'AI analysis based on content, sender, and timing'
              }
            }
          : email
      ))
    } catch (error) {
      console.error('Failed to analyze email:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'important': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'reply-today': return 'bg-red-50 text-red-700 border-red-200'
      case 'reply-week': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'delegate': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'archive': return 'bg-gray-50 text-gray-700 border-gray-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Email Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.totalEmails}</div>
                <div className="text-xs text-muted-foreground">Total Emails</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{stats.urgentCount}</div>
                <div className="text-xs text-muted-foreground">Urgent</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{stats.importantCount}</div>
                <div className="text-xs text-muted-foreground">Important</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.avgResponseTime}m</div>
                <div className="text-xs text-muted-foreground">Avg Response</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis Banner */}
      <Alert className="border-blue-200 bg-blue-50">
        <Brain className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-blue-800">AI-Powered Email Analysis</span>
              <p className="text-sm text-blue-700 mt-1">
                Emails are automatically prioritized and categorized based on content, sender importance, and urgency.
              </p>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => fetchEmails()}
              disabled={analyzing}
            >
              {analyzing ? 'Analyzing...' : 'Refresh Analysis'}
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      {/* Email List */}
      <div className="space-y-4">
        {emails.map((email) => (
          <Card key={email.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="space-y-3">
              {/* Email Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium text-lg">{email.subject}</h3>
                    <Badge className={getCategoryColor(email.category || 'normal')}>
                      {email.category?.toUpperCase() || 'NORMAL'}
                    </Badge>
                    {email.hasAttachment && (
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="font-medium">{email.from}</span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(email.timestamp)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge className={getActionColor(email.suggestedAction || 'archive')}>
                    {email.suggestedAction?.replace('-', ' ').toUpperCase() || 'ARCHIVE'}
                  </Badge>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Priority</div>
                    <div className="text-sm font-medium">
                      {(email.priority * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Content */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {email.snippet}
              </p>

              {/* AI Analysis */}
              {email.aiAnalysis && (
                <Alert className="border-green-200 bg-green-50">
                  <Brain className="h-4 w-4 text-green-600" />
                  <AlertDescription className="space-y-1">
                    <div className="font-medium text-green-800">AI Analysis:</div>
                    <div className="text-sm text-green-700">
                      <strong>Priority:</strong> {email.aiAnalysis.priorityLevel} | 
                      <strong> Action:</strong> {email.aiAnalysis.suggestedAction}
                    </div>
                    <div className="text-sm text-green-700">
                      <strong>Reason:</strong> {email.aiAnalysis.reason}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Reply className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                  <Button size="sm" variant="outline">
                    <Archive className="h-3 w-3 mr-1" />
                    Archive
                  </Button>
                </div>
                
                {!email.aiAnalysis && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => analyzeEmail(email.id)}
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
      </div>

      {/* Top Senders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Top Senders</span>
          </CardTitle>
          <CardDescription>
            Your most frequent email contacts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.topSenders.map((sender, index) => (
              <div key={sender} className="flex items-center space-x-2 p-3 border rounded-lg">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">{sender.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <div className="font-medium">{sender}</div>
                  <div className="text-sm text-muted-foreground">Frequent contact</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}