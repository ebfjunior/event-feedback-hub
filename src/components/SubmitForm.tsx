'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { createFeedback } from '@/lib/api';
import type { EventListItem } from '@/types/api';
import { Star } from 'lucide-react';

const FormSchema = z.object({
  event_id: z.string().uuid({ message: 'Choose an event' }),
  rating: z.number().min(1).max(5),
  text: z.string().min(1).max(1000),
  anonymous: z.boolean().default(true),
});

export type SubmitFormProps = {
  events: EventListItem[];
  onCreated?: (feedback: { id: string; event_id: string; event_name: string; rating: number; text: string; created_at: string }) => void;
  className?: string;
};

export function SubmitForm({ events, onCreated, className }: SubmitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const { register, handleSubmit, setValue, watch, formState, reset } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { rating: 5, text: '', anonymous: true },
  });
  const rating = watch('rating');

  async function onSubmit(values: z.infer<typeof FormSchema>): Promise<void> {
    setIsSubmitting(true);
    try {
      const created = await createFeedback({ event_id: values.event_id, rating: values.rating, text: values.text });
      onCreated?.(created);
      reset({ rating: 5, text: '', anonymous: true, event_id: values.event_id });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('rounded-lg border bg-card p-4 shadow', className)}>
      <div className="mb-3 font-medium text-sm">Submit Your Feedback</div>
      <div className="mb-3 space-y-1.5">
        <Label>Select Event</Label>
        <Select onValueChange={(v) => setValue('event_id', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Choose an event" />
          </SelectTrigger>
          <SelectContent>
            {events.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formState.errors.event_id && (
          <div className="text-xs text-red-500">{formState.errors.event_id.message}</div>
        )}
      </div>

      <div className="mb-3 space-y-1.5">
        <Label>Your Rating</Label>
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => {
            const value = i + 1;
            const active = (hoverRating ?? rating) >= value;
            return (
              <button
                type="button"
                key={`icon-${value}`}
                aria-label={`${value} star`}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(null)}
                onClick={() => setValue('rating', value)}
                className="transition-colors"
              >
                <Star className={cn('h-6 w-6', active ? 'fill-yellow-400 stroke-yellow-400' : 'stroke-muted-foreground')} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-3 space-y-1.5">
        <Label>Your Feedback</Label>
        <Textarea rows={4} placeholder="Share your thoughts about the event..." {...register('text')} />
        {formState.errors.text && <div className="text-xs text-red-500">{formState.errors.text.message}</div>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
      </Button>
    </form>
  );
}
