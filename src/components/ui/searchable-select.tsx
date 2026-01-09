"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/shadcn/utils";

interface SearchableSelectOption {
  value: string;
  label: string;
  subtitle?: string;
  icon?: ReactNode;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "No se encontraron resultados",
  className,
}: SearchableSelectProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase()) ||
    option.subtitle?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-11 px-3 flex items-center justify-between border-2 border-gray-300 rounded-md bg-white hover:border-[#600096] focus:border-[#600096] focus:ring-2 focus:ring-purple-200 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm">
          {selectedOption?.icon}
          <span className={cn("truncate", !selectedOption && "text-gray-500")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 border-gray-300"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-[200px] overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-purple-50 transition-colors flex items-center gap-2"
                >
                  {option.icon}
                  <div>
                    <p className="font-medium text-sm">{option.label}</p>
                    {option.subtitle && (
                      <p className="text-xs text-gray-500">{option.subtitle}</p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
