import { cache } from "react";
import {
  getSiteData,
  getTenantData,
  getProductsForSite,
  getProductData,
} from "../fetcher";
import { getAllTenants } from "../utils/tenant-utils";

export const getCachingSiteData = cache(getSiteData);
export const getCachingTenantData = cache(getTenantData);
export const getCachingProductsForSite = cache(getProductsForSite);
export const getCachingProductData = cache(getProductData);

export const getCachingAllTenants = cache(getAllTenants);
