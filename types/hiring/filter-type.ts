// regions
export type City = {
  id: number;
  city: string;
  county: string[];
};

export type RegionFilter = {
  selectedCity: City | null;
  selectedCounties: string[];
  allSelectedCities: string[];
};

export type RegionsFilterProps = {
  regionFilter: RegionFilter;
  setRegionFilter: (
    value: RegionFilter | ((prev: RegionFilter) => RegionFilter)
  ) => void;
};

export type PositionFilterProps = {
  positionFilter: string[];
  setPositionFilter: (value: string[] | ((prev: string[]) => string[])) => void;
};

export type PeriodFilterProps = {
  periodValueFilter: number[];
  setPeriodValueFilter: (
    value: number[] | ((prev: number[]) => number[])
  ) => void;
};

export type HiringFilterProps = {
  regionFilter: RegionFilter;
  positionFilter: string[];
  periodValueFilter: number[];
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
};
