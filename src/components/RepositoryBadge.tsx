"use client";

import { useChartStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Cross1Icon, ExternalLinkIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";

interface ICustomBadge {
  label: string;
}

export const CustomBadge = (props: ICustomBadge) => {
  const { label } = props;
  const [removeRepository, hideRepository, unhideRepository] = useChartStore(
    (state) => [
      state.removeRepository,
      state.hideRepository,
      state.unhideRepository,
    ]
  );
  const hiddenRepositories = useChartStore((state) => state.hiddenRepositories);

  return (
    <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background h-10">
      <Button
        className="px-2"
        variant="ghost"
        onClick={() => {
          removeRepository(label);
        }}
      >
        <Cross1Icon className="h-3 w-3" />
      </Button>
      <Button
        className="px-2"
        variant={hiddenRepositories.includes(label) ? "secondary" : "ghost"}
        onClick={() => {
          const action = hiddenRepositories.includes(label)
            ? unhideRepository
            : hideRepository;
          action(label);
        }}
      >
        <span
          className={cn(
            "text-xs",
            hiddenRepositories.includes(label) ? "line-through opacity-50" : ""
          )}
        >
          {label}
        </span>
      </Button>
      <a href={`https://github.com/${label}`} target="_blank">
        
      <Button
        className="px-2 hover:bg-accent hover:text-accent-foreground"
        variant="link"
      >
        <ExternalLinkIcon className="h-3 w-3" />
      </Button>
      </a>
    </div>
  );
};
