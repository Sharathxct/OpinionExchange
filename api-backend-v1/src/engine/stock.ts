interface Balance {
  balance: number;
  locked: number;
}

interface whichStock {
  yes: Balance;
  no: Balance;
}

interface StockBalance {
  [stockSymbol: string]: whichStock;
}

interface AllStock {
  [userId: string]: StockBalance;
}

export class Stock {
  private static instance: Stock | null = null;
  private state: AllStock = {};

  // {
  //    userId: {
  //      stockSymbol: {
  //        stockType: {
  //          balance: number;
  //          locked: number;
  //        }
  //      }
  //    }
  // }
  // getBalance
  // createUser
  // ensureStock
  // validateStock
  // IncreaseStock
  // DecreaseStock
  // LockStock
  // UnLockStock
  // DecLockedStock
  // TODO: Validation (balance, stockSymbol), ensureStock

  private constructor() {
  }

  public static getInstance() {
    if (!Stock.instance) {
      Stock.instance = new Stock();
    }
    return Stock.instance;
  }

  public getStock() {
    return this.state;
  }

  public getStockBalance(userId: string) {
    return this.state[userId];
  }

  public createUser(userId: string) {
    this.state[userId] = {};
  }

  public ensureStock(userId: string, stockSymbol: string) {
    if (!this.state[userId][stockSymbol]) {
      this.state[userId][stockSymbol] = { yes: { balance: 0, locked: 0 }, no: { balance: 0, locked: 0 } }
    }
  }

  public validateStock(userId: string, stockSymbol: string, quantity: number, account: 'locked' | 'balance') {

  }

  public incStock(userId: string, stockSymbol: string, stockType: 'yes' | 'no', quantity: number) {
    this.ensureStock(userId, stockSymbol)
    this.state[userId][stockSymbol][stockType]['balance'] += quantity;
  }

  public decStock(userId: string, stockSymbol: string, stockType: 'yes' | 'no', quantity: number) {
    this.validateStock(userId, stockSymbol, quantity, 'balance')
    this.state[userId][stockSymbol][stockType]['balance'] -= quantity;
  }

  public lockStock(userId: string, stockSymbol: string, stockType: 'yes' | 'no', quantity: number) {
    this.decStock(userId, stockSymbol, stockType, quantity);
    this.state[userId][stockSymbol][stockType]['locked'] += quantity;
  }

  public unlockStock(userId: string, stockSymbol: string, stockType: 'yes' | 'no', quantity: number) {
    this.state[userId][stockSymbol][stockType]['locked'] -= quantity;
    this.incStock(userId, stockSymbol, stockType, quantity)
  }

  public decLockedStock(userId: string, stockSymbol: string, stockType: 'yes' | 'no', quantity: number) {
    this.state[userId][stockSymbol][stockType]['locked'] -= quantity;
  }
}
