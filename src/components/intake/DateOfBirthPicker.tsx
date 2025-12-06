import { useState, useEffect, useRef } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateOfBirthPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function DateOfBirthPicker({ value, onChange, className }: DateOfBirthPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"date" | "month" | "year">("date");
  const [displayDate, setDisplayDate] = useState(() => {
    if (value) {
      const [y, m, d] = value.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date(2000, 0, 1);
  });
  
  const [yearRangeStart, setYearRangeStart] = useState(() => {
    const currentYear = new Date().getFullYear();
    return Math.floor((currentYear - 80) / 20) * 20;
  });

  const yearScrollRef = useRef<HTMLDivElement>(null);

  // Update display when value changes
  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split("-").map(Number);
      setDisplayDate(new Date(y, m - 1, d));
    }
  }, [value]);

  const formatDisplayValue = () => {
    if (!value) return "";
    const [y, m, d] = value.split("-");
    return `${d}/${m}/${y}`;
  };

  const handleInputChange = (input: string) => {
    // Allow typing in DD/MM/YYYY format
    const cleaned = input.replace(/\D/g, "");
    let formatted = "";
    
    if (cleaned.length >= 1) formatted = cleaned.slice(0, 2);
    if (cleaned.length >= 3) formatted += "/" + cleaned.slice(2, 4);
    if (cleaned.length >= 5) formatted += "/" + cleaned.slice(4, 8);
    
    // Parse and validate
    if (cleaned.length === 8) {
      const day = parseInt(cleaned.slice(0, 2));
      const month = parseInt(cleaned.slice(2, 4));
      const year = parseInt(cleaned.slice(4, 8));
      
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= new Date().getFullYear()) {
        const isoDate = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
        onChange(isoDate);
      }
    }
  };

  const selectDate = (day: number) => {
    const newDate = new Date(displayDate.getFullYear(), displayDate.getMonth(), day);
    const isoDate = `${newDate.getFullYear()}-${(newDate.getMonth() + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    onChange(isoDate);
    setIsOpen(false);
  };

  const selectMonth = (month: number) => {
    setDisplayDate(new Date(displayDate.getFullYear(), month, 1));
    setView("date");
  };

  const selectYear = (year: number) => {
    setDisplayDate(new Date(year, displayDate.getMonth(), 1));
    setView("month");
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (delta: number) => {
    setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + delta, 1));
  };

  const navigateYearRange = (delta: number) => {
    setYearRangeStart(prev => prev + delta * 20);
  };

  const currentYear = new Date().getFullYear();
  const selectedDay = value ? parseInt(value.split("-")[2]) : null;
  const selectedMonth = value ? parseInt(value.split("-")[1]) - 1 : null;
  const selectedYear = value ? parseInt(value.split("-")[0]) : null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <PopoverTrigger asChild>
        <div className={cn("relative", className)}>
          <Input
            value={formatDisplayValue()}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="DD/MM/YYYY"
            className="rounded-lg pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => setIsOpen(true)}
          >
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 pointer-events-auto" 
        align="start"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="p-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => view === "year" ? navigateYearRange(-1) : navigateMonth(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="font-semibold"
                onClick={() => setView("month")}
              >
                {MONTHS[displayDate.getMonth()]}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="font-semibold"
                onClick={() => setView("year")}
              >
                {displayDate.getFullYear()}
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => view === "year" ? navigateYearRange(1) : navigateMonth(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Date View */}
          {view === "date" && (
            <div className="grid grid-cols-7 gap-1">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div key={day} className="text-center text-xs text-muted-foreground font-medium py-1">
                  {day}
                </div>
              ))}
              {Array.from({ length: getFirstDayOfMonth(displayDate) }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: getDaysInMonth(displayDate) }).map((_, i) => {
                const day = i + 1;
                const isSelected = selectedDay === day && 
                  selectedMonth === displayDate.getMonth() && 
                  selectedYear === displayDate.getFullYear();
                const isToday = day === new Date().getDate() && 
                  displayDate.getMonth() === new Date().getMonth() &&
                  displayDate.getFullYear() === new Date().getFullYear();
                
                return (
                  <Button
                    key={day}
                    type="button"
                    variant={isSelected ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0 font-normal",
                      isToday && !isSelected && "border border-primary",
                      isSelected && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => selectDate(day)}
                  >
                    {day}
                  </Button>
                );
              })}
            </div>
          )}

          {/* Month View */}
          {view === "month" && (
            <div className="grid grid-cols-3 gap-2">
              {MONTHS.map((month, i) => (
                <Button
                  key={month}
                  type="button"
                  variant={selectedMonth === i && selectedYear === displayDate.getFullYear() ? "default" : "ghost"}
                  size="sm"
                  className="h-10"
                  onClick={() => selectMonth(i)}
                >
                  {month.slice(0, 3)}
                </Button>
              ))}
            </div>
          )}

          {/* Year View */}
          {view === "year" && (
            <div 
              ref={yearScrollRef}
              className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto scroll-smooth"
              style={{ scrollbarWidth: "thin" }}
            >
              {Array.from({ length: 20 }).map((_, i) => {
                const year = yearRangeStart + i;
                if (year > currentYear) return null;
                return (
                  <Button
                    key={year}
                    type="button"
                    variant={selectedYear === year ? "default" : "ghost"}
                    size="sm"
                    className="h-10"
                    onClick={() => selectYear(year)}
                  >
                    {year}
                  </Button>
                );
              })}
            </div>
          )}

          {/* Quick Navigation */}
          {view === "year" && (
            <div className="flex gap-2 mt-3 pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => setYearRangeStart(currentYear - 100)}
              >
                1920s
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => setYearRangeStart(currentYear - 60)}
              >
                1960s
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => setYearRangeStart(currentYear - 40)}
              >
                1980s
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => setYearRangeStart(currentYear - 20)}
              >
                2000s
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
