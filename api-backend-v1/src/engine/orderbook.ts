import { Inr } from "./inr";
import { Stock } from "./stock";

type yesOrNo = 'yes' | 'no'

interface Order {
  userId: string;
  type: 'buy' | 'sell';
  quantity: number;
}
interface Orders {
  [key: number]: Order;
}
interface Book {
  total: number;
  orders: Orders;
  key: number;
}
interface Price {
  [price: number]: Book;
}
interface StockType {
  yes: Price;
  no: Price;
}
interface orderbook {
  [stockSymbol: string]: StockType;
}

export class Orderbook {
  private static instance: Orderbook | null = null;
  private state: orderbook = {};

  private constructor() {
  }

  public static getInstance() {
    if (!Orderbook.instance) {
      Orderbook.instance = new Orderbook()
    }
    return Orderbook.instance;
  }

  public createSymbol(stockSymbol: string) {
    this.state[stockSymbol] = { 'no': {}, 'yes': {} };
  }

  ensurePrice(stockSymbol: string, stockType: 'yes' | 'no', price: number) {
    if (!this.state[stockSymbol][stockType][price]) {
      this.state[stockSymbol][stockType][price] = { total: 0, orders: {}, key: 1 };
    }
  }

  public processOrder(userId: string, stockSymbol: string, stockType: yesOrNo, type: 'buy' | 'sell', price: number, quantity: number) {
    const inr = Inr.getInstance();
    let oppStockType: yesOrNo = stockType === 'yes' ? 'no' : 'yes';
    let oppPrice: number = 1000 - price;
    let cost = type == 'buy' ? quantity * oppPrice : quantity * price;
    inr.lockBal(userId, cost)

    if (type == 'buy') {
      this.ensurePrice(stockSymbol, oppStockType, oppPrice)
      this.state[stockSymbol][oppStockType][oppPrice].total += quantity;
      this.state[stockSymbol][oppStockType][oppPrice].key += 1;
      let key = this.state[stockSymbol][oppStockType][oppPrice].key;
      this.state[stockSymbol][oppStockType][oppPrice].orders[key] = { userId, type, quantity }
      this.matcher(stockSymbol, oppStockType, oppPrice);

    } else {
      this.ensurePrice(stockSymbol, stockType, price);
      this.state[stockSymbol][stockType][price].total += quantity;
      this.state[stockSymbol][stockType][price].key += 1;
      let key = this.state[stockSymbol][stockType][price].key;
      this.state[stockSymbol][stockType][price].orders[key] = { userId, type, quantity }
      this.matcher(stockSymbol, stockType, price);
    }
  }

  public processBuy(userId: string, stockSymbol: string, stockType: yesOrNo, type: 'buy' | 'sell', quantity: number) {
    const inr = Inr.getInstance();
    // sort price key and check for best price and check if quantity is enough

  }

  // Orderbook
  // {
  //  stockSymbol: {
  //    yes: {
  //      price: {
  //        total: number;
  //        orders: { key: {userId, type, quantity} }
  //        key: number
  //      }
  //    }
  //    no: {
  //      
  //    }
  //  }
  // }
  // getInstance
  // getOrderbook
  // createSymbol
  // processOrder
  // Order & Instant
  // buyYes
  // buyNo
  // sellNo
  // sellYes
  // getBestPrice
  // matcher
  // matchOrder


  public getOrderbook() {
    return this.state;
  }

  public getSymbol(stockSymbol: string) {
    return this.state[stockSymbol];
  }

  public getBestPrice(stockSymbol: string, stockType: yesOrNo) {
    let keys = Object.keys(this.state[stockSymbol][stockType])
    let m = 1100;
    for (let i = 0; i < keys.length; i++) {
      m = Math.min(m, parseInt(keys[i]));
    }
    return { bestPrice: m, quantity: this.state[stockSymbol][stockType][m]['total'] }
  }

  public orderBuyYes(userId: string, stockSymbol: string, price: number, quantity: number) {
    this.processOrder(userId, stockSymbol, 'yes', 'buy', price, quantity)
  }

  public orderSellYes(userId: string, stockSymbol: string, price: number, quantity: number) {
    this.processOrder(userId, stockSymbol, 'yes', 'sell', price, quantity)
  }

  public orderBuyNo(userId: string, stockSymbol: string, price: number, quantity: number) {
    this.processOrder(userId, stockSymbol, 'no', 'buy', price, quantity)
  }

  public orderSellNo(userId: string, stockSymbol: string, price: number, quantity: number) {
    this.processOrder(userId, stockSymbol, 'no', 'sell', price, quantity)
  }

  // Not important
  public instantBuyYes(userId: string, stockSymbol: string, quantity: number) {
    this.processBuy(userId, stockSymbol, 'yes', 'buy', quantity)
  }

  public instantSellYes(userId: string, stockSymbol: string, quantity: number) {
    this.processBuy(userId, stockSymbol, 'yes', 'sell', quantity)
  }

  public instantBuyNo(userId: string, stockSymbol: string, quantity: number) {
    this.processBuy(userId, stockSymbol, 'no', 'buy', quantity)
  }

  public instantSellNo(userId: string, stockSymbol: string, quantity: number) {
    this.processBuy(userId, stockSymbol, 'no', 'sell', quantity)
  }

  // TODO: 
  public matcher(stockSymbol: string, stockType: 'yes' | 'no', price: number) {
    // iterate through all the prices and search for matching complimentry price or less, if found sent the transactions to matchOrders
    let oppStockType: yesOrNo = stockType === 'yes' ? 'no' : 'yes';
    let prices = Object.keys(this.state[stockSymbol][oppStockType]).map(Number).sort((a, b) => a - b);
    for (const p of prices) {
      const reqQuant = this.state[stockSymbol][stockType][price].total;
      const availableQuant = this.state[stockSymbol][oppStockType][p].total;
      if ((p <= (1000 - price)) && (availableQuant > 0) && (reqQuant > 0)) {
        this.matchOrders(stockSymbol, stockType, price, p);
      }
    }
  }

  public matchOrders(stockSymbol: string, stockType: 'yes' | 'no', price: number, oppPrice: number) {
    // take two order objects and resolve them and delete the order transaction
    let oppStockType: yesOrNo = stockType === 'yes' ? 'no' : 'yes';
    let side: Book = this.state[stockSymbol][stockType][price]
    let opp: Book = this.state[stockSymbol][oppStockType][oppPrice]
    while (side.total > 0 && opp.total > 0) {
      // get the two highest priority orders from side and opp
      // send these orders to processMatch
      // reduce the quanity returned from side and opp
      const skeys = Object.keys(side.orders).map(Number)
      const okeys = Object.keys(opp.orders).map(Number)
      const s = this.lowestKey(skeys);
      const o = this.lowestKey(okeys);
      const matchedQuant = this.processMatch(stockSymbol, side, opp, s, o, stockType, oppStockType, price, oppPrice)
      side.total -= matchedQuant;
      opp.total -= matchedQuant;
    }
  }

  lowestKey(arr: number[]) {
    const m = arr.reduce((acc, val) => Math.min(acc, val), Number.MAX_VALUE);
    return m;
  }

  public processMatch(stockSymbol: string, side1: Book, side2: Book, key1: number, key2: number, stockType1: 'yes' | 'no', stockType2: 'yes' | 'no', price1: number, price2: number) {
    // save both the users and their type of order
    // deduct locked assets according to oder type
    // delete minimum quantity order and reduce quantity of big one
    // credit the required assets
    // return how much quantity is reduced from both side and opp
    const user1 = side1.orders[key1].userId;
    const type1 = side1.orders[key1].type;
    const quant1 = side1.orders[key1].quantity;
    const cost1 = price1 * quant1;
    const user2 = side2.orders[key2].userId;
    const type2 = side2.orders[key2].type;
    const quant2 = side2.orders[key2].quantity;
    const cost2 = price2 * quant1;

    const inr = Inr.getInstance();
    const stock = Stock.getInstance();

    // deduct user1's locked assets
    if (type1 === 'buy') {
      inr.decreaseLockBal(user1, cost1);
    } else {
      stock.decLockedStock(user1, stockSymbol, stockType1, quant1)
    }

    // deduct user2's locked assets
    if (type2 === 'buy') {
      inr.decreaseLockBal(user2, cost2);
    } else {
      stock.decLockedStock(user2, stockSymbol, stockType2, quant2)
    }

    // delete min quantity from order object and reduce quantity from 
    if (quant1 > quant2) {
      // delete order2 and substract quant1 from order1 quantity
      delete side2['orders'][key2];
      side1['orders'][key1]['quantity'] -= quant2;
    } else if (quant2 > quant1) {
      // delete order1 and substract quant2 from order2 quantity
      delete side1['orders'][key1];
      side2['orders'][key2]['quantity'] -= quant1;
    } else {
      // delete both orders
      delete side1['orders'][key1];
      delete side2['orders'][key2];
    }

    // credit the assets to the users
    if (type1 == 'buy') {
      // credit matched stockType1 stocks to the user1 stock account
      stock.incStock(user1, stockSymbol, stockType1, Math.min(quant1, quant2))
    } else if (type1 == 'sell') {
      // credit matched inr cost to user1 inr account
      inr.increaseBal(user1, cost1);
    }
    if (type2 == 'buy') {
      // credit matched stocks to the user2 stock account
      stock.incStock(user2, stockSymbol, stockType2, Math.min(quant1, quant2))
    } else if (type2 == 'sell') {
      // credit matched inr cost to user2 inr account
      inr.increaseBal(user2, cost2);
    }

    // return min of quant1 and quant2
    return Math.min(quant2, quant1);
  }

  public cancelOrder() {
    // Delete order 
  }

}
