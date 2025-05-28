'use client';

import { Smile } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Dynamically import emoji picker to avoid SSR issues
const Picker = dynamic(() => import('@emoji-mart/react'), { ssr: false });

interface EmojiPickerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEmojiSelect: (emoji: any) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function EmojiPicker({
  onEmojiSelect,
  isOpen,
  onToggle,
}: EmojiPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        if (isOpen) {
          onToggle();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  return (
    <Popover open={isOpen} onOpenChange={onToggle}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className="hover:bg-accent absolute top-1/2 right-2 -translate-y-1/2 transform rounded-full p-1"
        >
          <Smile className="text-muted-foreground h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border-0 p-0 shadow-xl"
        side="top"
        align="end"
        ref={pickerRef}
      >
        <div className="overflow-hidden rounded-lg">
          <Picker
            data={async () => {
              const response = await import('@emoji-mart/data');
              return response.default;
            }}
            onEmojiSelect={onEmojiSelect}
            theme="auto"
            set="native"
            previewPosition="none"
            skinTonePosition="none"
            maxFrequentRows={2}
            perLine={8}
            emojiSize={20}
            emojiButtonSize={28}
            categories={[
              'frequent',
              'people',
              'nature',
              'foods',
              'activity',
              'places',
              'objects',
              'symbols',
              'flags',
            ]}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
