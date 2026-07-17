"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function WriteReviewModal({ propertyTitle }: { propertyTitle: string }) {
  const [rating, setRating] = useState(5)
  const [hovered, setHovered] = useState(0)

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" className="w-full shrink-0 rounded-full sm:w-auto" />}>
        Write a review
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Review {propertyTitle}</DialogTitle>
          <DialogDescription>Only guests with a completed stay can review — this keeps ratings real.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-body-sm font-medium text-graphite tracking-body-sm">Overall rating</Label>
            <div className="flex gap-1" onMouseLeave={() => setHovered(0)}>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  aria-pressed={rating === value}
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHovered(value)}
                  className={`flex size-9 items-center justify-center rounded-full transition-colors ${
                    value <= (hovered || rating) ? "text-primary" : "text-smoke"
                  }`}
                >
                  <Star className="size-5" fill="currentColor" />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="review-text" className="text-body-sm font-medium text-graphite tracking-body-sm">
              Your review
            </Label>
            <Textarea
              id="review-text"
              rows={4}
              placeholder="How was the stay, the host, and the check-in?"
              className="rounded-2xl border-border bg-transparent px-4 py-3 text-body"
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" className="rounded-full" />}>Cancel</DialogClose>
          <DialogClose render={<Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground" />}>
            Submit review
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
