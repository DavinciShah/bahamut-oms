'use strict';

// Tax rates by country/state (ISO 3166-1 alpha-2 / subdivision codes)
const TAX_RATES = {
  US: {
    default: 0,
    CA: 0.0725,
    NY: 0.08,
    TX: 0.0625,
    FL: 0.06,
    WA: 0.065,
  },
  GB: { default: 0.20 },
  DE: { default: 0.19 },
  FR: { default: 0.20 },
  CA: { default: 0.05, ON: 0.13, BC: 0.12, QC: 0.15 },
  AU: { default: 0.10 },
};

const taxService = {
  getTaxRate(country, state) {
    const countryRates = TAX_RATES[country?.toUpperCase()];
    if (!countryRates) return 0;

    if (state && countryRates[state.toUpperCase()] !== undefined) {
      return countryRates[state.toUpperCase()];
    }
    return countryRates.default || 0;
  },

  calculateTax(amount, country, state) {
    const rate = this.getTaxRate(country, state);
    const taxAmount = parseFloat((amount * rate).toFixed(2));
    return {
      rate,
      taxAmount,
      total: parseFloat((amount + taxAmount).toFixed(2)),
    };
  },

  formatTaxBreakdown(taxData) {
    return {
      rate:       `${(taxData.rate * 100).toFixed(2)}%`,
      taxAmount:  taxData.taxAmount.toFixed(2),
      subtotal:   (taxData.total - taxData.taxAmount).toFixed(2),
      total:      taxData.total.toFixed(2),
    };
  },
};

module.exports = taxService;
