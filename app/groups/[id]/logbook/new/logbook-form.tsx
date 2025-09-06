'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/rich-text-editor'
import { createLogbookEntryAction } from './actions'

interface LogbookFormProps {
  groupId: string
}

export function LogbookForm({ groupId }: LogbookFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [meetingDate, setMeetingDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formData = new FormData()
    formData.append('groupId', groupId)
    formData.append('title', title)
    formData.append('content', content)
    formData.append('meetingDate', meetingDate)
    
    await createLogbookEntryAction(formData)
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Entry Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Monthly Meeting - January 2024"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="meetingDate">Meeting Date</Label>
          <Input
            id="meetingDate"
            type="date"
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Meeting Summary & Progress *</Label>
        <p className="text-sm text-gray-600">
          Document what was discussed, member progress updates, challenges faced, 
          and action items for the next meeting.
        </p>
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Write about the meeting discussion, member progress updates, challenges, victories, and next steps..."
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isSubmitting || !title.trim() || !content.trim()}>
          {isSubmitting ? 'Creating...' : 'Create Entry'}
        </Button>
        <Button type="button" variant="outline">
          Save Draft
        </Button>
      </div>
    </form>
  )
}