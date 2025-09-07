"use client";
import React, { useState } from 'react';
import { List } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import SommairePanel from './SommairePanel';

interface MobileSommaireButtonProps {
  className?: string;
}

export default function MobileSommaireButton({ className = "" }: MobileSommaireButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`lg:hidden bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700 ${className}`}
          aria-label="Ouvrir la structure"
        >
          <List className="w-4 h-4 mr-2" />
          Structure
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-64 p-0 bg-gray-900 border-gray-700">
        <SheetHeader className="sr-only">
          <SheetTitle>Structure</SheetTitle>
          <SheetDescription>
            Navigation et gestion des sections de la page
          </SheetDescription>
        </SheetHeader>
        <div className="h-full">
          <SommairePanel className="border-0" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
