import { apiFetch } from '@/api/api-client';
import { adminEndpoints } from '@/api/endpoints/admin';

export type InventoryStats = {
  totalStockUnits: number;
  lowStockAlert: number;
  totalInvestmentValue: number;
  totalRetailValue: number;
  deliveredSalesValue: number;
  deliveredCostValue: number;
  totalProfitEarned: number;
  currentInventoryValue: number;
};

/**
 * Map backend snake_case dashboard payload to frontend InventoryStats.
 * Args: raw — API JSON object
 * Returns: typed InventoryStats with safe numeric defaults
 */
function mapInventoryStats(raw: Record<string, unknown>): InventoryStats {
  const num = (key: string, camelKey: string) =>
    Number(raw[key] ?? raw[camelKey] ?? 0) || 0;

  return {
    totalStockUnits: num('total_stock_units', 'totalStockUnits'),
    lowStockAlert: num('low_stock_alert', 'lowStockAlert'),
    totalInvestmentValue: num('total_investment_value', 'totalInvestmentValue'),
    totalRetailValue: num('total_retail_value', 'totalRetailValue'),
    deliveredSalesValue: num('delivered_sales_value', 'deliveredSalesValue'),
    deliveredCostValue: num('delivered_cost_value', 'deliveredCostValue'),
    totalProfitEarned: num('total_profit_earned', 'totalProfitEarned'),
    currentInventoryValue: num('current_inventory_value', 'currentInventoryValue'),
  };
}

/**
 * GET inventory dashboard KPIs.
 * Returns: InventoryStats
 */
export async function fetchInventoryDashboard(): Promise<InventoryStats> {
  const raw = await apiFetch<Record<string, unknown>>(adminEndpoints.inventoryDashboard());
  return mapInventoryStats(raw || {});
}

/**
 * POST relative stock change for one product.
 * Args: productId, delta — units to add/subtract
 */
export async function adjustStock(productId: string, delta: number): Promise<unknown> {
  return apiFetch(adminEndpoints.inventoryAdjust(productId), {
    method: 'POST',
    body: JSON.stringify({ delta }),
  });
}

/**
 * POST set absolute stock quantity.
 * Args: productId, quantity
 */
export async function setStockQuantity(productId: string, quantity: number): Promise<unknown> {
  return apiFetch(adminEndpoints.inventorySetQuantity(productId), {
    method: 'POST',
    body: JSON.stringify({ quantity }),
  });
}

/**
 * POST batch relative stock change.
 * Args: productIds, delta
 */
export async function batchAdjustStock(productIds: string[], delta: number): Promise<unknown> {
  return apiFetch(adminEndpoints.inventoryBatchAdjust(), {
    method: 'POST',
    body: JSON.stringify({ product_ids: productIds, delta }),
  });
}
