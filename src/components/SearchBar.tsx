import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";

type Props = {
  placeholder?: string;
  onSearch: (value: string) => void;
  debounceMs?: number;
};

export function SearchBar({ placeholder = "Search events...", onSearch, debounceMs = 400 }: Props) {
  const [value, setValue] = useState("");
  const debouncedValue = useDebounce(value, debounceMs);

  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue]);

  return (
    <div className="relative min-w-[200px] flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        className="pl-9"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Search events"
      />
    </div>
  );
}
