import { ChartType } from "@/lib/utils";

export type ChartMode = "Date" | "Timeline";

export interface StarRecord {
  date: string;
  count: number;
}

export interface RepoStarData {
  repo: string;
  starRecords: StarRecord[];
}


export interface ChartRepoStarData {
  label: string;
  data: StarRecord[];
}

export interface RepoData extends RepoStarData {
  logoUrl: string;
}

export interface ChartData {
  date: Date;
  elementYear: number;
  [key: string]: number | Date | string;
};

export type LineChartData = ChartData
export type BarChartData = ChartData
export type AreaChartData = ChartData

export interface StoreChartState {
  accessKey?: string | undefined;
  setAccessKey: (accessKey: string) => void;
  openAccessKeyDialog: boolean;
  setOpenAccessKeyDialog: (openAccessKeyDialog: boolean) => void;

  activeChart: ChartType;
  repositories: StoreRepository[];
  hiddenRepositories: string[];
  setHiddenRepositories: (data: string[]) => void;
  addRepository: (label: string) => void;
  hideRepository: (label: string) => void;
  setActiveChart: (chartType: ChartType) => void;
  removeRepository: (label: string) => void;
  unhideRepository: (label: string) => void;
  getRepoData: () => Promise<RepoData[]>;

  repoData: RepoData[];
}

interface StoreRepository {
  label: string;
  hidden: boolean;
}