'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/rich-text-editor'
import { updateLogbookEntryAction, deleteLogbookEntryAction } from './actions'

interface EditLogbookFormProps {
  groupId: string
  entryId: string
  initialTitle: string
  initialContent: string
  initialMeetingDate: string | null
}

export function EditLogbookForm({ 
  groupId, 
  entryId, 
  initialTitle, 
  initialContent, 
  initialMeetingDate 
}: EditLogbookFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [meetingDate, setMeetingDate] = useState(initialMeetingDate || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formData = new FormData()
    formData.append('groupId', groupId)
    formData.append('entryId', entryId)
    formData.append('title', title)
    formData.append('content', content)
    formData.append('meetingDate', meetingDate)
    
    await updateLogbookEntryAction(formData)
    setIsSubmitting(false)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this logbook entry? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    
    const formData = new FormData()
    formData.append('groupId', groupId)
    formData.append('entryId', entryId)
    
    await deleteLogbookEntryAction(formData)
    setIsDeleting(false)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleUpdate} className="space-y-6">
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
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Write about the meeting discussion, member progress updates, challenges, victories, and next steps..."
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={isSubmitting || !title.trim() || !content.trim()}>
            {isSubmitting ? 'Updating...' : 'Update Entry'}
          </Button>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </div>
      </form>

      {/* Delete Section */}
      <div className="border-t pt-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-medium text-red-900 mb-2">Delete Entry</h3>
          <p className="text-sm text-red-700 mb-4">
            Permanently delete this logbook entry. This action cannot be undone 
            and will remove it for all group members.
          </p>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Entry'}
          </Button>
        </div>
      </div>
    </div>
  )
}