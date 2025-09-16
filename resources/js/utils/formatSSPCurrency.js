export const formatSSPCurrency = (amount) => {
    const am = Number(amount)
    return `${(am || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SSP`;
};