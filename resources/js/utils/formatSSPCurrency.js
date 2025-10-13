export const formatSSPCurrency = (amount) => {
    const am = Number(amount)
    return `${Math.round(am || 0).toLocaleString('en-US')} SSP`;
};