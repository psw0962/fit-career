// regions
export interface City {
  id: number;
  city: string;
  county: string[];
}

export interface RegionFilter {
  selectedCity: City | null;
  selectedCounties: string[];
  allSelectedCities: string[];
}

export interface RegionsFilterProps {
  regionFilter: RegionFilter;
  setRegionFilter: (value: RegionFilter | ((prev: RegionFilter) => RegionFilter)) => void;
}

export interface PositionFilterProps {
  positionFilter: string[];
  setPositionFilter: (value: string[] | ((prev: string[]) => string[])) => void;
}

export interface PeriodFilterProps {
  periodValueFilter: number[];
  setPeriodValueFilter: (value: number[] | ((prev: number[]) => number[])) => void;
}

export interface HiringFilterProps {
  regionFilter: RegionFilter;
  positionFilter: string[];
  periodValueFilter: number[];
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}
