import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

interface Suggestion {
  id: string
  type: 'MEETING_PREP' | 'TASK_REMINDER' | 'EMAIL_FOLLOWUP' | 'SCHEDULE_OPTIMIZATION'
  content: string
  priority: number
  explanation: string
}

// GET /api/suggestions - Generate AI-powered suggestions
export async function GET() {
  try {
    // In a real implementation, this would analyze user data and generate personalized suggestions
    // For now, we'll return sample suggestions
    
    const suggestions: Suggestion[] = [
      {
        id: '1',
        type: 'MEETING_PREP',
        content: 'Prepare for "Team Standup" in 1 hour',
        priority: 0.8,
        explanation: 'Based on your meeting preparation patterns'
      },
      {
        id: '2',
        type: 'TASK_REMINDER',
        content: 'Complete "Prepare quarterly presentation" (due in 2 days)',
        priority: 0.9,
        explanation: 'This task typically takes 4 hours and is high priority'
      },
      {
        id: '3',
        type: 'SCHEDULE_OPTIMIZATION',
        content: 'Consider scheduling important meetings now - it\'s your most productive time',
        priority: 0.6,
        explanation: 'Your data shows you\'re most effective in meetings at this time of day'
      }
    ]

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error('Failed to generate suggestions:', error)
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 })
  }
}

// POST /api/suggestions/enhance - Enhance task with AI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskTitle } = body

    if (!taskTitle) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 })
    }

    try {
      const zai = await ZAI.create()

      const prompt = `
You are a productivity expert. Transform this task into an actionable plan:
TASK: "${taskTitle}"
Provide:
1. A refined task title (clear, actionable)
2. Estimated effort (1-5, where 5 is most effort)
3. Subtasks (if complex)
4. Optimal placement in schedule
5. Potential blockers
Respond in JSON format:
{
  "refinedTitle": "...",
  "effort": 1-5,
  "subtasks": ["..."],
  "suggestedTime": "when to do this",
  "blockers": ["..."]
}
      `.trim()

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful productivity assistant that provides structured, actionable task breakdowns.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 250,
        temperature: 0.7
      })

      const responseContent = completion.choices[0]?.message?.content
      if (!responseContent) {
        throw new Error('No response from AI')
      }

      // Parse the JSON response
      const enhancedTask = JSON.parse(responseContent)
      
      return NextResponse.json(enhancedTask)
    } catch (aiError) {
      console.error('AI enhancement failed:', aiError)
      
      // Fallback to basic enhancement
      const fallbackTask = {
        refinedTitle: taskTitle,
        effort: 3,
        subtasks: ['Research requirements', 'Implementation', 'Testing'],
        suggestedTime: 'When you have time',
        blockers: []
      }
      
      return NextResponse.json(fallbackTask)
    }
  } catch (error) {
    console.error('Failed to enhance task:', error)
    return NextResponse.json({ error: 'Failed to enhance task' }, { status: 500 })
  }
}