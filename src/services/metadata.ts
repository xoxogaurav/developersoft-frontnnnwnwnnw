import api from './api';

export interface ValidationRules {
  min_review_length?: number;
  must_keep_installed?: string;
  min_word_count?: number;
  must_be_original?: boolean;
  must_be_logged_in?: boolean;
  must_stay_liked?: string;
  must_stay_followed?: string;
  min_comment_length?: number;
  min_answer_length?: number;
  must_be_detailed?: boolean;
  must_test_features?: boolean;
  must_visit_pages?: number;
  must_scroll?: boolean;
  must_be_relevant?: boolean;
  must_stay_subscribed?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  min_reward: string;
  proof_types: string[];
  min_duration: number;
  validation_rules: ValidationRules;
}

export interface Country {
  code: string;
  name: string;
  min_reward: string;
}

export interface CountryTiers {
  tier1: Country[];
  tier2: Country[];
  tier3: Country[];
}

export interface Metadata {
  categories: Category[];
  countries: CountryTiers;
}

class MetadataService {
  private static instance: MetadataService;
  private metadata: Metadata | null = null;

  private constructor() {}

  public static getInstance(): MetadataService {
    if (!MetadataService.instance) {
      MetadataService.instance = new MetadataService();
    }
    return MetadataService.instance;
  }

  public async getMetadata(): Promise<Metadata> {
    if (this.metadata) {
      return this.metadata;
    }

    try {
      const response = await api.get('https://bookmaster.fun/api/advertiser/metadata');
      this.metadata = response.data.parsed.data;
      return this.metadata;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch metadata');
    }
  }

  public calculateMinReward(selectedCountries: string[], category: Category | null): number {
    if (!this.metadata || !category) return 0;

    // Get minimum reward for the category
    const categoryMinReward = parseFloat(category.min_reward);

    // Get minimum rewards for selected countries
    const countryMinRewards = selectedCountries.map(code => {
      const country = [
        ...this.metadata!.countries.tier1,
        ...this.metadata!.countries.tier2,
        ...this.metadata!.countries.tier3
      ].find(c => c.code === code);

      return country ? parseFloat(country.min_reward) : 0;
    });

    // Use the highest minimum reward between category and countries
    const highestCountryMinReward = Math.max(...countryMinRewards, 0);
    return Math.max(categoryMinReward, highestCountryMinReward);
  }

  public getCategory(slug: string): Category | null {
    if (!this.metadata) return null;
    return this.metadata.categories.find(c => c.slug === slug) || null;
  }

  public getAllCountries(): Country[] {
    if (!this.metadata) return [];
    return [
      ...this.metadata.countries.tier1,
      ...this.metadata.countries.tier2,
      ...this.metadata.countries.tier3
    ];
  }
}

export default MetadataService.getInstance();