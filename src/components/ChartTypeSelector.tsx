"use client";


import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChartStore } from "@/lib/store";
import { ChartType, ChartTypeKeys } from "@/lib/utils";

export function ChartTypeSelector() {

  const activeChart = useChartStore((state) => state.activeChart)
  const setActiveChart = useChartStore((state) => state.setActiveChart)

  const handleChartChange = (value: ChartType) => {  
    setActiveChart(value)
  };

  return (
    <div className='flex justify-end'>
      <Select value={activeChart} onValueChange={handleChartChange}>
        <SelectTrigger className='w-[300px]'>
          <SelectValue placeholder='Select a chart' />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {ChartTypeKeys.map((chart) => (
              <SelectItem key={chart} value={chart}>
                <span className="capitalize">{chart}</span> {`Chart`}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
