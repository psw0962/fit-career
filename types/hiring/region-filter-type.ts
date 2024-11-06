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
  setRegionFilter: React.Dispatch<React.SetStateAction<RegionFilter>>;
};
