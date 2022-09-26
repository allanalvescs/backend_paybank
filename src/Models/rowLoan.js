class RowTable {
    constructor(debit_balance, fees, adjusted_debt_balance, value_rate) {
        this.debit_balance = debit_balance
        this.fees = fees
        this.adjusted_debt_balance = adjusted_debt_balance
        this.value_rate = value_rate
    }
}

module.exports = RowTable