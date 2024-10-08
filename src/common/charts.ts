import {
  BarChartData,
  LineChartData,
  RepoData,
  RepoStarData
} from "@/types/chart";
import { uniqBy } from "es-toolkit/array";
import { getRepoLogoUrl, getRepoStarRecords } from "./api";
import { getDateString } from "./utils";

export const DEFAULT_MAX_REQUEST_AMOUNT = 15;

const STAR_HISTORY_LOGO_URL =
  "https://avatars.githubusercontent.com/u/124480067";

export const getReposStarData = async (
  repos: string[],
  token = "",
  maxRequestAmount = DEFAULT_MAX_REQUEST_AMOUNT
): Promise<RepoStarData[]> => {
  const repoStarDataCacheMap = new Map();

  for (const repo of repos) {
    try {
      const starRecords = await getRepoStarRecords(
        repo,
        token,
        maxRequestAmount
      );
      repoStarDataCacheMap.set(repo, starRecords);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      let message = "";
      let status = 500;

      if (error?.response?.status === 404) {
        message = `Repo ${repo} not found`;
        status = 404;
      } else if (error?.response?.status === 403) {
        message = "GitHub API rate limit exceeded";
        status = 403;
      } else if (error?.response?.status === 401) {
        message = "Access Token Unauthorized";
        status = 401;
      } else if (Array.isArray(error?.data) && error.data?.length === 0) {
        message = `Repo ${repo} has no star history`;
        status = 501;
      } else {
        message = "Some unexpected error happened, try again later";
      }

      return Promise.reject({
        message,
        status,
        repo,
      });
    }
  }

  const reposStarData: RepoStarData[] = [];
  for (const repo of repos) {
    const records = repoStarDataCacheMap.get(repo);
    if (records) {
      reposStarData.push({
        repo,
        starRecords: records,
      });
    }
  }

  return reposStarData.sort((d1, d2) => {
    return (
      Math.max(...d2.starRecords.map((s) => s.count)) -
      Math.max(...d1.starRecords.map((s) => s.count))
    );
  });
};

export const getRepoData = async (
  repos: string[],
  token = "",
  maxRequestAmount = DEFAULT_MAX_REQUEST_AMOUNT
): Promise<RepoData[]> => {
  const repoDataCacheMap: Map<
    string,
    {
      star: {
        date: string;
        count: number;
      }[];
      logo: string;
    }
  > = new Map();

  for (const repo of repos) {
    try {
      const starRecords = await getRepoStarRecords(
        repo,
        token,
        maxRequestAmount
      );
      const logo = await getRepoLogoUrl(repo, token);
      repoDataCacheMap.set(repo, { star: starRecords, logo });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      let message = "";
      let status = 500;

      if (error?.response?.status === 404) {
        message = `Repo ${repo} not found`;
        status = 404;
      } else if (error?.response?.status === 403) {
        message = "GitHub API rate limit exceeded";
        status = 403;
      } else if (error?.response?.status === 401) {
        message = "Access Token Unauthorized";
        status = 401;
      } else if (Array.isArray(error?.data) && error.data?.length === 0) {
        message = `Repo ${repo} has no star history`;
        status = 501;
      } else {
        message = "Some unexpected error happened, try again later";
      }

      console.error("Failed to request data:", status, message);

      // If encountering not found or no star error, we will return an empty image so that cache can be set.
      if (status === 404 || status === 501) {
        return [
          {
            repo,
            starRecords: [
              {
                date: getDateString(Date.now(), "yyyy/MM/dd"),
                count: 0,
              },
            ],
            logoUrl: STAR_HISTORY_LOGO_URL,
          },
        ];
      }

      return Promise.reject({
        message,
        status,
        repo,
      });
    }
  }

  const reposStarData: RepoData[] = [];
  for (const repo of repos) {
    const records = repoDataCacheMap.get(repo);
    if (records) {
      reposStarData.push({
        repo,
        starRecords: records.star,
        logoUrl: records.logo,
      });
    }
  }

  return reposStarData.sort((d1, d2) => {
    return (
      Math.max(...d2.starRecords.map((s) => s.count)) -
      Math.max(...d1.starRecords.map((s) => s.count))
    );
  });
};


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const letYearAsXaxis = (data: any[]) => { 
  return uniqBy(data.map((item) => item.elementYear), Math.floor).length >= 5
}

export const convertDataToLineChartData = (
  repoData: RepoData[]
): LineChartData[] => {
  let response: LineChartData[] = [];
  repoData.forEach((data) => {
    response = [
      ...response,
      ...data.starRecords
        .map((item) => {
          const elementYear = new Date(item.date).getFullYear();
          return {
            date: new Date(item.date),
            elementYear:
              elementYear + (new Date(item.date).getMonth() - 1) / 12,
            [data.repo]: item.count,
          };
        })
        .sort((a, b) => a.date.getFullYear() - b.date.getFullYear()),
    ];
  });
  return response.sort((a, b) => a.date.getFullYear() - b.date.getFullYear());
};

export const convertDataToBarChartData = (
  repoData: RepoData[]
): BarChartData[] => {
  const namesAlone: { [key: string]: number } = {};
  for (let index = 0; index < repoData.length; index++) {
    const element = repoData[index];
    namesAlone[element.repo] = 0;
  }
  let response: BarChartData[] = [];

  const allElementYear = []

  for (let index = 0; index < repoData.length; index++) {
    const repoElement = repoData[index];

    for (let _index = 0; _index < repoElement.starRecords.length; _index++) {
      const element = repoElement.starRecords[_index];

      const elementYear = new Date(element.date).getFullYear();

      allElementYear.push({"elementYear": elementYear})
    }
  }

  const _letYearAsXaxis = letYearAsXaxis(allElementYear)

  for (let index = 0; index < repoData.length; index++) {
    const repoElement = repoData[index];

    for (let _index = 0; _index < repoElement.starRecords.length; _index++) {
      const element = repoElement.starRecords[_index];

      const elementYear = new Date(element.date).getFullYear();

      const found = response.findIndex(
        (value) => value["elementYear"] == elementYear
      );
      if (_letYearAsXaxis) {
        if (found == -1) {
          response.push({
            ...namesAlone,
            date: new Date(element.date),
            elementYear: elementYear,
            [repoElement.repo]: element.count,
          });
        } else {
          response[found][repoElement.repo] = element.count;
        }
      }else {
        response.push({
          ...namesAlone,
          date: new Date(element.date),
          elementYear: elementYear,
          [repoElement.repo]: element.count,
        });
      }
      
    }
  }

  response = response.sort(
    (a, b) => a.date.getFullYear() - b.date.getFullYear()
  );

  let previousElement = null;
  for (let index = 0; index < response.length; index++) {
    const element = response[index];

    for (let _index = 0; _index < Object.keys(namesAlone).length; _index++) {
      const label = Object.keys(namesAlone)[_index];

      if (element[label] == 0 && previousElement != null) {
        element[label] = previousElement[label];
      }
    }

    previousElement = element;

    response[index] = element;
  }

  return response.sort((a, b) => a.date.getFullYear() - b.date.getFullYear());
};