export const formatRate = (exchange_rate: number) => {
    return `${new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(exchange_rate)} PLN / EUR`;
}
 