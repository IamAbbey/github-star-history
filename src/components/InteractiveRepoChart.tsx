"use client";

import {
  convertDataToBarChartData,
  convertDataToLineChartData,
  letYearAsXaxis,
} from "@/common/charts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartType } from "@/lib/utils";
import {
  AreaChartData,
  BarChartData,
  LineChartData,
  RepoData,
} from "@/types/chart";
import dayjs from "dayjs";
import FileSaver from "file-saver";
import { Options as HTML2CanvasOptions } from "html2canvas";
import { ImageDownIcon } from "lucide-react";
import { FC, useCallback, useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { useGenerateImage } from "recharts-to-png";
import { Props as XAxisProps } from "recharts/types/cartesian/XAxis";
import { Props as YAxisProps } from "recharts/types/cartesian/YAxis";
import { useTheme } from "./theme/theme-provider";
import { Button } from "./ui/button";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";

interface InteractiveChartChartProps {
  repoData: RepoData[];
  chart: string;
}

export const InteractiveChartChart: FC<InteractiveChartChartProps> = ({
  repoData: _repoData,
  chart,
}) => {
  const repoData = _repoData;

  const formattedData = useMemo(() => {
    switch (chart) {
      case ChartType.Bar:
      case ChartType.StackedBar:
        return convertDataToBarChartData(repoData);
      case ChartType.Area:
        return convertDataToLineChartData(repoData);
      default:
        return convertDataToLineChartData(repoData);
    }
  }, [repoData, chart]);

  const chartConfig: ChartConfig = {};

  for (let index = 0; index < repoData.length; index++) {
    const element = repoData[index];

    chartConfig[element.repo] = {
      label: element.repo,
      color: `hsl(var(--chart-${index + 1}))`,
    };
  }

  let { theme: systemTheme } = useTheme();

  if (systemTheme === "system") {
    systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  // Implement useGenerateImage to get an image of any element (not just a Recharts component)
  const [getDivJpeg, { ref }] = useGenerateImage<HTMLDivElement>({
    quality: 0.8,
    type: "image/jpeg",
    options: {
      scale: 1,
      backgroundColor: systemTheme == "dark" ? "#0c0a09" : "#ffffff",
      onclone(_, element) {
        element.style.padding = "16px";
      },
    } as HTML2CanvasOptions,
  });

  const handleDownload = useCallback(async () => {
    const jpeg = await getDivJpeg();
    if (jpeg) {
      FileSaver.saveAs(jpeg, `${new Date().getTime()}-${chart}Chart.jpeg`);
    }
  }, [chart, getDivJpeg]);


  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col space-y-0 border-b p-0 sm:flex-row items-stretch">
        <div className="flex flex-1 flex-col justify-center gap-1 px-4 py-5 sm:py-6">
          <CardTitle>
            Star History - <span className="capitalize">{chart}</span> Chart
          </CardTitle>
          <CardDescription>
            Showing Github star trend visitors from{" "}
            {formattedData[0].date.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
            {" - "}
            {formattedData[formattedData.length - 1].date.toLocaleDateString(
              "en-US",
              {
                month: "short",
                year: "numeric",
              }
            )}
          </CardDescription>
        </div>
        <div className="flex md:py-6 pb-3 self-end">
          <Button
            onClick={handleDownload}
            className="mr-2"
            size="sm"
            variant={"outline"}
          >
            <ImageDownIcon className="mr-2 h-4 w-4" /> Image
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:p-4 pt-3" ref={ref}>
        <div className="aspect-auto h-[400px] w-75">
          {(() => {
            switch (chart) {
              case ChartType.Bar:
                return (
                  <InteractiveBarChart
                    chartData={formattedData}
                    chartConfig={chartConfig}
                    stack={false}
                  />
                );
              case ChartType.StackedBar:
                return (
                  <InteractiveBarChart
                    chartData={formattedData}
                    chartConfig={chartConfig}
                    stack={true}
                  />
                );
              case ChartType.Area:
                return (
                  <InteractiveAreaChart
                    chartData={formattedData}
                    chartConfig={chartConfig}
                  />
                );

              default:
                return (
                  <InteractiveLineChart
                    chartData={formattedData}
                    chartConfig={chartConfig}
                  />
                );
            }
          })()}
        </div>
      </CardContent>
    </Card>
  );
};

interface InteractiveLineChartProps {
  chartData: LineChartData[];
  chartConfig: ChartConfig;
}

const InteractiveLineChart = (props: InteractiveLineChartProps) => {
  const { chartData, chartConfig } = props;

  const _useYearAsXaxis = letYearAsXaxis(chartData);

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[400px] w-50">
      <LineChart
        id="chart-svg"
        accessibilityLayer
        data={chartData}
        margin={{
          left: -12,
          right: 12,
        }}
      >
        {CustomXAxis({
          useYearAsXaxis: _useYearAsXaxis,
          padding: { right: 12 },
        })}

        {CustomYAxis({})}
        {GenericChartComponent({})}

        {Object.keys(chartConfig).map((label, index) => (
          <Line
            connectNulls
            key={`line-${index}`}
            dataKey={label}
            type="monotone"
            stroke={chartConfig[label].color}
            strokeWidth={2}
            dot={{
              fill: chartConfig[label].color,
            }}
            activeDot={{
              r: 6,
            }}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
};

interface InteractiveBarChartProps {
  chartData: BarChartData[];
  chartConfig: ChartConfig;
  stack: boolean;
}

const InteractiveBarChart = (props: InteractiveBarChartProps) => {
  const { chartData, chartConfig, stack } = props;

  const _useYearAsXaxis = letYearAsXaxis(chartData);

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[400px] w-50">
      <BarChart
        id="chart-svg"
        accessibilityLayer
        data={chartData}
        margin={{
          left: -12,
          right: 12,
        }}
      >
        {CustomXAxis({
          useYearAsXaxis: _useYearAsXaxis,
        })}

        {CustomYAxis({})}
        {GenericChartComponent({
          cursor: stack,
        })}

        {Object.keys(chartConfig).map((label, index) => (
          <Bar
            key={`bar-${index}`}
            dataKey={label}
            stackId={stack ? "a" : undefined}
            fill={chartConfig[label].color}
            radius={stack ? undefined : 4}
            markerEnd=""
          ></Bar>
        ))}
      </BarChart>
    </ChartContainer>
  );
};
interface InteractiveAreaChartProps {
  chartData: AreaChartData[];
  chartConfig: ChartConfig;
}

const InteractiveAreaChart = (props: InteractiveAreaChartProps) => {
  const { chartData, chartConfig } = props;

  const _useYearAsXaxis = letYearAsXaxis(chartData);

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[400px] w-50">
      <AreaChart
        id="chart-svg"
        accessibilityLayer
        data={chartData}
        margin={{
          left: -12,
          right: 12,
          top: 12,
        }}
        stackOffset="expand"
      >
        {CustomXAxis({
          useYearAsXaxis: _useYearAsXaxis,
          padding: { right: 12 },
        })}

        {CustomYAxis({})}
        {GenericChartComponent({})}
        {Object.keys(chartConfig).map((label, index) => (
          <Area
            connectNulls
            dataKey={label}
            key={`line-${index}`}
            type="monotone"
            fill={chartConfig[label].color}
            fillOpacity={0.4}
            stroke={chartConfig[label].color}
            // stackId="a"
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
};

interface ICustomXAxis extends XAxisProps {
  useYearAsXaxis: boolean;
}

// recharts does not support custom wrapping of components yet
// see https://github.com/recharts/recharts/issues/412
// So custom components needs to be called as seen below
// {CustomXAxis({
//   useYearAsXaxis: _useYearAsXaxis,
// })}
// instead of <CustomXAxis useYearAsXaxis={_useYearAsXaxis} />
const CustomXAxis = (props: ICustomXAxis) => {
  const { useYearAsXaxis: _useYearAsXaxis } = props;
  return (
    <XAxis
      padding={{ right: 20 }}
      dataKey={_useYearAsXaxis ? "elementYear" : "date"}
      tickLine={false}
      axisLine={false}
      tickMargin={8}
      interval={_useYearAsXaxis ? "preserveStartEnd" : 1}
      type={_useYearAsXaxis ? "number" : "category"}
      domain={_useYearAsXaxis ? ["0", "auto - 1"] : undefined}
      tickFormatter={(value, _) => {
        return _useYearAsXaxis
          ? `${Math.floor(Number(value))}`
          : dayjs(value).format("MMM-YYYY");
      }}
      {...props}
    />
  );
};

interface ICustomYAxis extends YAxisProps {}

const CustomYAxis = (_: ICustomYAxis) => {
  return (
    <YAxis
      tickLine={false}
      axisLine={false}
      tickFormatter={(value) =>
        typeof value === "number"
          ? value < 1000
            ? value
            : `${(value / 1000).toFixed(1)}K`
          : value
      }
    />
  );
};

interface IGenericChartComponent {
  cursor?: boolean;
}

const GenericChartComponent = (props: IGenericChartComponent) => {
  const { cursor } = props;
  return [
    <CartesianGrid key="CartesianGrid" vertical={false} />,
    <ChartLegend
      key="ChartLegend"
      className="flex flex-wrap"
      content={<ChartLegendContent />}
    />,
    <ChartTooltip
      key="ChartTooltip"
      cursor={cursor ? false : true}
      content={
        <ChartTooltipContent
          className="w-[200px]"
          labelFormatter={(_, item) => {
            return item[0].payload.date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
          }}
        />
      }
    />,
  ];
};
