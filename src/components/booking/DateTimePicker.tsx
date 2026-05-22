"use client";
// ============================================================
// DateTimePicker — Step 2: calendar date + available time slots
// Blocks past dates, Sundays (closed), and already-booked slots
// ============================================================
import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { generateTimeSlots, formatTime } from "@/lib/utils";

interface DateTimePickerProps {
  serviceId: string;
  selectedDate: string;
  selectedTime: string;
  onSelect: (date: string, time: string) => void;
}

const TIME_SLOTS = generateTimeSlots(); // ["09:00","10:00",...,"17:00"]

export default function DateTimePicker({ serviceId, selectedDate, selectedTime, onSelect }: DateTimePickerProps) {
  const supabase = createSupabaseBrowserClient();
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch booked slots whenever selected date changes
  useEffect(() => {
    if (!selectedDate) return;
    async function fetchBooked() {
      setLoadingSlots(true);
      const { data } = await supabase
        .from("appointments")
        .select("appointment_time")
        .eq("appointment_date", selectedDate)
        .not("status", "eq", "cancelled");
      setBookedSlots((data || []).map((r: { appointment_time: string }) => r.appointment_time.slice(0, 5)));
      setLoadingSlots(false);
    }
    fetchBooked();
  }, [selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build calendar days for current view month
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(viewMonth.year, viewMonth.month, 1);
  const lastDay = new Date(viewMonth.year, viewMonth.month + 1, 0);
  const startPad = firstDay.getDay(); // 0=Sun
  const daysInMonth = lastDay.getDate();

  function toDateStr(d: Date): string {
    return d.toISOString().split("T")[0];
  }

  function isDisabled(day: number): boolean {
    const date = new Date(viewMonth.year, viewMonth.month, day);
    if (date < today) return true; // Past date
    if (date.getDay() === 0) return true; // Sunday — closed
    return false;
  }

  function selectDate(day: number) {
    if (isDisabled(day)) return;
    const date = new Date(viewMonth.year, viewMonth.month, day);
    onSelect(toDateStr(date), ""); // Reset time when date changes
  }

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayLabels = ["Su","Mo","Tu","We","Th","Fr","Sa"];

  // Prev/next month navigation
  function prevMonth() {
    setViewMonth(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    );
  }
  function nextMonth() {
    setViewMonth(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl text-brand-white">Choose Date & Time</h2>
        <p className="text-brand-muted text-sm mt-1">We&apos;re open Monday – Saturday, 9AM – 6PM</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <div className="card p-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1 text-brand-muted hover:text-brand-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="font-heading text-brand-white text-sm font-semibold">
              {monthNames[viewMonth.month]} {viewMonth.year}
            </span>
            <button onClick={nextMonth} className="p-1 text-brand-muted hover:text-brand-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 mb-2">
            {dayLabels.map((d, idx) => (
              <div key={`dl-${idx}`} className={`text-center text-xs font-bold py-1 ${d === "Su" ? "text-brand-rose/60" : "text-brand-muted"}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {/* Empty padding cells */}
            {Array.from({ length: startPad }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const disabled = isDisabled(day);
              const dateStr = toDateStr(new Date(viewMonth.year, viewMonth.month, day));
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === toDateStr(today);

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => selectDate(day)}
                  disabled={disabled}
                  className={`aspect-square flex items-center justify-center text-sm rounded transition-all ${
                    disabled
                      ? "text-brand-mid cursor-not-allowed"
                      : isSelected
                      ? "bg-brand-burgundy text-white font-bold"
                      : isToday
                      ? "border border-brand-burgundy text-brand-white hover:bg-brand-burgundy/20"
                      : "text-brand-light hover:bg-brand-dark2"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-brand-mid text-xs text-brand-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-brand-burgundy" /> Selected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border border-brand-burgundy" /> Today
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-brand-mid" /> Unavailable
            </span>
          </div>
        </div>

        {/* Time slots */}
        <div>
          {!selectedDate ? (
            <div className="card p-6 flex items-center justify-center h-full">
              <p className="text-brand-muted text-sm text-center">
                Please select a date first to see available time slots
              </p>
            </div>
          ) : loadingSlots ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={`ts-skel-${i}`} className="h-10 bg-brand-dark2 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-brand-gold mb-3">
                Available slots
              </p>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((slot, idx) => {
                  const isBooked = bookedSlots.includes(slot);
                  const isSelected = slot === selectedTime;
                  return (
                    <button
                      key={`slot-${slot}-${idx}`}
                      onClick={() => !isBooked && onSelect(selectedDate, slot)}
                      disabled={isBooked}
                      className={`py-2.5 px-3 rounded text-sm font-medium text-center transition-all duration-200 ${
                        isBooked
                          ? "bg-brand-dark border border-brand-mid text-brand-mid cursor-not-allowed line-through"
                          : isSelected
                          ? "bg-brand-burgundy border-2 border-brand-burgundy text-white"
                          : "bg-brand-dark border border-brand-mid text-brand-light hover:border-brand-burgundy hover:text-brand-white"
                      }`}
                    >
                      {formatTime(slot)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
