import "server-only";
import { cache } from "react";
import { readSalesWorkspace } from "@/domain/sales-workspace-store";
import { publicCampaignProjection } from "@/domain/sales-workspace";

/** Only deliberately published editorial fields leave the private workspace. */
export const publicCampaigns = cache(async () => {
  try {
    const { workspace, migrationRequired } = await readSalesWorkspace();
    if (migrationRequired) return [];
    return workspace.campaigns.flatMap((campaign) => {
      const publicData = publicCampaignProjection(campaign);
      return publicData ? [publicData] : [];
    });
  } catch {
    return [];
  }
});

export const publicCampaign = cache(
  async (slug: string) =>
    (await publicCampaigns()).find((campaign) => campaign.slug === slug) ?? null
);
