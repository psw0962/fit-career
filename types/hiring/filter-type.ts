// regions
export type City = {
  id: number;
  city: string;
  county: string[];
};

export type RegionsFilterProps = {
  regionFilter: RegionFilter;
  setRegionFilter: React.Dispatch<React.SetStateAction<RegionFilter>>;
};

export type RegionFilter = {
  selectedCity: City | null;
  selectedCounties: string[];
  allSelectedCities: string[];
};

export type PositionFilterProps = {
  positionFilter: string[];
  setPositionFilter: React.Dispatch<React.SetStateAction<string[]>>;
};

export type PeriodFilterProps = {
  periodValueFilter: number[];
  setPeriodValueFilter: React.Dispatch<React.SetStateAction<number[]>>;
};

export type HiringFilterProps = {
  regionFilter: RegionFilter;
  positionFilter: string[];
  periodValueFilter: number[];
};
