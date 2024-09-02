import { InteractiveChartChart } from "@/components/InteractiveRepoChart";
import { CustomBadge } from "@/components/RepositoryBadge";
import { RepositoryInputForm } from "@/components/RepositoryInput";
import { ChartTypeSelector } from "@/components/ChartTypeSelector";
import { AccessKeyDialog } from "@/components/accessKeyDialog";
import GithubIcon from "@/components/icons/GithubIcon";
import { THEMES } from "@/components/theme/theme";
import { ThemesSwitcher } from "@/components/theme/theme-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { useChartStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Suspense, lazy } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Loader2 } from "lucide-react";

export function Home() {
  const { toast } = useToast();
  const repositories = useChartStore((state) => state.repositories);
  
  const getRepoData = useChartStore((state) => state.getRepoData);
  const setOpenAccessKeyDialog = useChartStore(
    (state) => state.setOpenAccessKeyDialog
  );
  const activeChart = useChartStore((state) => state.activeChart);

  const themes = THEMES.filter(
    (theme) => !["default-daylight", "default-midnight"].includes(theme.id)
  );

  /* Chart component fetches data and renders chart base on active chart type */
  const Chart = lazy(() =>
    getRepoData().then((data) => {
      /* Returning a component directly since React.lazy expects a module with a default export */
      return {
        default: () => {
          return <InteractiveChartChart repoData={data} chart={activeChart} />;
        },
      };
    })
  );

  const FallbackRender = ({ error, resetErrorBoundary }: FallbackProps) => {
    // Call resetErrorBoundary() to reset the error boundary and retry the render.

    return (
      <Alert className="max-w-screen-md mt-4" variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          <p>{error?.message}</p>
          <div className="flex flex-wrap gap-4">
            {error?.status == 403 ? (
              // We only want to show accessKey input modal if error relates to rate-limit
              <Button
                size="sm"
                variant="destructive"
                className="mt-3"
                onClick={() => setOpenAccessKeyDialog(true)}
              >
                Resolve
              </Button>
            ) : (
              <></>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="mt-3"
              onClick={() => resetErrorBoundary()}
            >
              Retry
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="min-h-screen pt-6 pb-12 lg:px-12 px-3">
      <nav className="w-full flex flex-row gap-2 justify-end">
        <a
          href={"https://github.com/IamAbbey/github-star-history"}
          target="_blank"
          rel="noreferrer"
        >
          <div
            className={cn(
              buttonVariants({
                variant: "ghost",
              }),
              "h-[40px] w-[40px] px-0"
            )}
          >
            <GithubIcon className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">GitHub</span>
          </div>
        </a>
        <ThemeToggle />
      </nav>
      <main className="w-full flex gap-4 mx-auto max-w-screen-lg flex-col items-center">
        <div className="w-full mt-4 justify-center flex">
          <RepositoryInputForm />
        </div>
        <div className="w-full justify-center gap-2 flex flex-wrap my-2">
          {repositories.map((searchRepo, index) => (
            <CustomBadge label={searchRepo.label} key={`label-${index}`} />
          ))}
        </div>
        <div className="w-full justify-between align-middle gap-4 flex flex-wrap my-2">
          <ThemesSwitcher
            themes={themes}
            className="flex bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          />

          <ChartTypeSelector />
        </div>
        {repositories.filter((value) => !value.hidden).length == 0 ? (
          <p className="mt-4">No Entries Yet.</p>
        ) : (
          <ErrorBoundary
            fallbackRender={FallbackRender}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onError={(error: any) => {
              if (error?.message) {
                toast({
                  title: "An error occurred.",
                  description: error?.message,
                  variant: "destructive",
                  duration: 10000,
                });
              }
            }}
          >
            <Suspense
              fallback={
                <div className="flex flex-col justify-self-center self-center justify-center items-center gap-2 mt-4 text-sm">
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  <p>Fetching data...</p>
                </div>
              }
            >
              <Chart />
            </Suspense>
          </ErrorBoundary>
        )}
        <Toaster />
        <AccessKeyDialog />
      </main>
    </div>
  );
}
