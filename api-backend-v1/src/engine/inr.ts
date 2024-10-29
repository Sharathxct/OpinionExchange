interface UserBalance {
  balance: number;
  locked: number;
}

interface InrBalances {
  [userId: string]: UserBalance;
}

export class Inr {
  // {
  //   userId: {
  //      balance: number;
  //      locked: number;
  //   },
  // }
  // getInstance ✅
  // create user ✅
  // getBalance  ✅
  // increaseBal  ✅
  // decreaseBal  ✅
  // lockBal  ✅
  // unlockBal  ✅
  // declockbal  ✅
  // TODO: Balance validation on decrease

  private static instance: Inr | null = null;
  private state: InrBalances = {};

  private constructor() {
  }

  public static getInstance(): Inr {
    if (!Inr.instance) {
      Inr.instance = new Inr();
      return Inr.instance;
    }
    return Inr.instance
  }

  public getInr() {
    return this.state;
  }

  public creatUser(userId: string) {
    this.state[userId] = { balance: 0, locked: 0 }
  }

  public getBalance(userId: string) {
    return this.state[userId]
  }

  public increaseBal(userId: string, amount: number) {
    this.state[userId]['balance'] += amount;
  }

  public decreaseBal(userId: string, amount: number) {
    this.state[userId]['balance'] -= amount;
  }

  public lockBal(userId: string, amount: number) {
    this.decreaseBal(userId, amount);
    this.state[userId]['locked'] += amount;
  }

  public unlockBal(userId: string, amount: number) {
    this.state[userId]['locked'] -= amount;
    this.increaseBal(userId, amount);
  }

  decreaseLockBal(userId: string, amount: number) {
    this.state[userId]['locked'] -= amount;
  }

}
