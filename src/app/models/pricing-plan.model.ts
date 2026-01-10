export interface PricingPlan {
  id: string;
  name: string;
  displayName: string;
  price: number;
  yearlyPrice: number;
  monthlyEquivalent: number;
  isPopular?: boolean;
  description: string;
  users: number;
  additionalUserPrice: number;
  freeTrainings: number;
  activationFee: number;
  trainingPrice: number;
  features: PlanFeature[];
}

export interface PlanFeature {
  name: string;
  description?: string;
  included: boolean;
  tooltip?: string;
  value?: string | number | boolean;
}

export interface UserPricingPolicy {
  users: number;
  additionalUserPrice: number;
  freeTrainings: number;
  activationFee: number;
}
