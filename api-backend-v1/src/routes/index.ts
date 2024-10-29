import { Router } from "express"
import { Orderbook } from "../engine/orderbook";
import { Inr } from "../engine/inr";
import { Stock } from "../engine/stock";

export const router = Router()

// Create a new user entry in INR_BALANCES with unique user Id and default 0 balances 
router.post('/user/create/:userId', (req, res) => {
  const userId = req.params.userId;
  const inr = Inr.getInstance()
  const stock = Stock.getInstance()
  inr.creatUser(userId);
  stock.createUser(userId);
  res.status(201).json({ body: { message: `User ${userId} created` } });
})

// - Create a new symbol in STOCK_BALANCES with default yes and no entries
router.post('/symbol/create/:stockSymbol', (req, res) => {
  const stockSymbol = req.params.stockSymbol;
  const orderbook = Orderbook.getInstance();
  orderbook.createSymbol(stockSymbol)
  res.status(201).json({ body: { message: `Symbol ${stockSymbol} created` } });
})

// Returns the in-memory ORDERBOOK  object
router.get('/orderbook', (req, res) => {
  const orderbook = Orderbook.getInstance();
  res.send(orderbook.getOrderbook());
})

// Returns the in-memory INR_BALANCES object
router.get('/balances/inr', (req, res) => {
  const inr = Inr.getInstance();
  res.send(inr.getInr());
})

// Returns the in-memory STOCK_BALANCES  object
router.get('/balances/stock', (req, res) => {
  const stock = Stock.getInstance();
  res.send(stock.getStock())
})

// resets the in-memory ORDERBOOK , INR_BALANCES , STOCK_BALANCES back to {}
router.post('/reset', () => {

})

// Returns the INR balance of a given user.
router.get('/balance/inr/:userId', (req, res) => {
  const userId = req.params.userId;
  const inr = Inr.getInstance();
  res.send({ data: inr.getBalance(userId) })
})

// Lets the user onramp INR on the platform
router.post('/onramp/inr', (req, res) => {
  //{
  //   "userId": "user1",
  //  "amount": 10000 // make sure amount is in paise and not rs
  //}
  const { userId, amount } = req.body;
  const inr = Inr.getInstance();
  inr.increaseBal(userId, parseInt(amount))
  res.send({ message: "success" });
})

// Returns the stock balance for a user.
router.get('/balance/stock/:userId', (req, res) => {
  const userId = req.params.userId;
  const stock = Stock.getInstance();
  res.send(stock.getStockBalance(userId))
})

// Allows a user to place a buy order for yes  options on a stock. The order will be added to the ORDERBOOK.
router.post('/order/buy', (req, res) => {
  /*  {
      "userId": "123",
      "stockSymbol": "BTC_USDT_10_Oct_2024_9_30",
      "quantity": 100,
      "price": 1000,
      "stockType": "yes",
    } 
    */
  const { userId, stockSymbol, quantity, price, stockType } = req.body;
  const orderbook = Orderbook.getInstance();
  if (stockType === 'yes') {
    orderbook.orderBuyYes(userId, stockSymbol, parseInt(price), parseInt(quantity));
  } else {
    orderbook.orderBuyNo(userId, stockSymbol, parseInt(price), parseInt(quantity));
  }
  res.send({ message: "success" })
})

// Allows a user to place a sell order for  yes options. This will also be added to the ORDERBOOK.
router.post('/order/sell', (req, res) => {
  /*
  
  {
    "userId": "123",
    "stockSymbol": "ABC",
    "quantity": 100,
    "price": 1100,
    "stockType": "yes",
  }
  
   */
  const { userId, stockSymbol, quantity, price, stockType } = req.body;
  const orderbook = Orderbook.getInstance();
  if (stockType === 'yes') {
    orderbook.orderSellYes(userId, stockSymbol, parseInt(price), parseInt(quantity));
  } else {
    orderbook.orderSellNo(userId, stockSymbol, parseInt(price), parseInt(quantity));
  }
  res.send({ message: "success" })

})

//  Returns the current buy and sell orders for a given stock.
router.get('/orderbook/:stockSymbol', (req, res) => {
  const orderbook = Orderbook.getInstance();
  const stockSymbol = req.params.stockSymbol;
  res.send(orderbook.getSymbol(stockSymbol));
})

// /trade/mint
router.post('/trade/mint', () => {
  /*
  {
    "userId": "123",
    "stockSymbol": "ABC",
    "quantity": 100,
  }
   */
})
