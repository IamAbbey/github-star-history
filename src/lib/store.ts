import { getRepoData } from "@/common/charts";
import { THEMES, Theme } from "@/components/theme/theme";
import { StoreChartState } from "@/types/chart";
import { difference } from "es-toolkit/array";
import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { localDefault, repoData } from "./repo-data";
import { ChartType } from "./utils";

const useLocalData = false;

export const useChartStore = create<StoreChartState>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        accessKey: undefined,
        setAccessKey: (accessKey: string) =>
          set({
            accessKey: accessKey,
          }),
        openAccessKeyDialog: false,
        setOpenAccessKeyDialog: (openAccessKeyDialog: boolean) =>
          set({
            openAccessKeyDialog: openAccessKeyDialog,
          }),
        repositories: useLocalData ? localDefault : [],
        hiddenRepositories: [],
        setHiddenRepositories: (data: string[]) =>
          set({
            hiddenRepositories: data,
          }),
        repoData: [],
        activeChart: ChartType.Line,
        addRepository: (repository: string) =>
          set((state) => ({
            repositories: [
              ...state.repositories,
              { label: repository, hidden: false },
            ],
          })),
        hideRepository: (label: string) => {
          set((state) => {
            const found = state.repositories.findIndex(
              (value) => value.label == label
            );

            if (found != -1) {
              state.repositories[found].hidden = true;
            }
          });
        },
        unhideRepository: (label: string) => {
          set((state) => {
            const found = state.repositories.findIndex(
              (value) => value.label == label
            );

            if (found != -1) {
              state.repositories[found].hidden = false;
            }
          });
        },
        removeRepository: (label: string) => {
          set((state) => ({
            repositories: state.repositories.filter(
              (value) => value.label != label
            ),
          }));
        },
        setActiveChart: (chartType: ChartType) =>
          set({ activeChart: chartType }),

        getRepoData: async () => {
          return new Promise((resolve, reject) => {
            const fetchedRepositories = get().repoData.map((data) => data.repo);

            const diff = difference(
              get().repositories.map((value) => value.label),
              fetchedRepositories
            );

            if (diff.length >= 1) {
              if (useLocalData) {
                set({
                  repoData: repoData,
                });
                resolve(repoData);
              } else {
                // Make API request here; only for the new repo since we have new repository
                console.log(`making api call for ${diff}`);
                getRepoData(diff, get().accessKey)
                  .then((data) => {
                    const previousRepoData = get().repoData;
                    set((state) => ({
                      repoData: [...state.repoData, ...data],
                    }));

                    resolve([...previousRepoData, ...data]);
                  })
                  .catch((error) => {
                    reject(error);
                  });
              }
            } else if (diff.length == 0 && get().repositories.length >= 1) {
              resolve(
                get().repoData.filter((data) =>
                  get()
                    .repositories.filter((value) => !value.hidden)
                    .map((repo) => repo.label)
                    .includes(data.repo)
                )
              );
            }
          });
        },
      })),
      {
        name: "github-star-history", // name of item in the storage (must be unique).
        storage: createJSONStorage(() => localStorage), // (optional) by default the 'localStorage' is used.
        partialize: (state) => ({
          accessKey: state.accessKey,
        }),
      }
    )
  )
);

useChartStore.subscribe(
  (state) => state.repositories,
  (repositories) =>
    useChartStore
      .getState()
      .setHiddenRepositories(
        repositories.filter((value) => value.hidden).map((value) => value.label)
      )
);

interface ThemeConfigState {
  activeTheme: Theme;
  setActiveTheme: (theme: Theme) => void;
}

export const useThemeConfigStore = create<ThemeConfigState>()(
  immer((set) => ({
    activeTheme: THEMES[0],
    setActiveTheme: (theme: Theme) =>
      set({
        activeTheme: theme,
      }),
  }))
);
