'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2022-07-25T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2022-07-22T23:36:17.929Z',
    '2022-07-19T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementsDates = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days`;
  else {
    const options = {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    };

    return new Intl.DateTimeFormat(locale, options).format(date);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const day = `${date.getDate()}`.padStart(2, 0);
    // return `${day}/${month}/${date.getFullYear()}`;
  }
};

const numberFormatting = (mov, acc) => {
  const options = {
    style: 'currency',
    currency: acc.currency,
  };
  return new Intl.NumberFormat(acc.locale, options).format(mov);
};
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';
  const movements = acc.movements;
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementsDates(date, acc.locale);

    const formatMovements = numberFormatting(mov, acc);
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formatMovements}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  const formattedBalance = numberFormatting(acc.balance, acc);
  labelBalance.textContent = formattedBalance;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = numberFormatting(incomes, acc);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = numberFormatting(out, acc);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = numberFormatting(interest, acc);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const setLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // Printing the remaining time with each call
    labelTimer.textContent = `${min}:${sec}`;

    // Stopping when timer hits 0
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
    time--;
  };

  let time = 540;

  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

///////////////////////////////////////
// Event handlers

let currentAccount;
let timer;

// FAKE LOGGED IN FOR CHECKING
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // creating date and time
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long',
    };

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Timer
    if (timer) clearInterval(timer);
    timer = setLogOutTimer();
    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Changing the date
    const now = new Date().toISOString();
    currentAccount.movementsDates.push(now);
    receiverAcc.movementsDates.push(now);
    // Update UI
    updateUI(currentAccount);

    // Reset Timer
    clearInterval(timer);
    timer = setLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // Add date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);
    }, 3500);
  }
  // Reset Timer
  clearInterval(timer);
  timer = setLogOutTimer();
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
  // Reset Timer
  clearInterval(timer);
  timer = setLogOutTimer();
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

/*
// Converting and Checking Numbers
console.log(23 === 23.0);

// Coversion from 64 bit to 10 bit
console.log(Number('23'));
console.log(+'23');

// Parsing
console.log(Number.parseInt('69px'));
console.log(Number.parseInt('e23'));

console.log(Number.parseFloat(' 2.5rem '));
console.log(Number.parseInt(' 2.5rem '));
// console.log(parseFloat(' 2.5rem '));   // both do the same thing, but the one above is encouraged for modern practices

console.log(Number.isNaN(20)); // o/p: false
console.log(Number.isNaN('20')); // o/p: false, this is also because it is already not a number it is a string so it is not checked
console.log(Number.isNaN(+'20x')); // o/p: true
console.log(Number.isNaN(23 / 0)); // o/p: false, also not not a number

// The last case can be checked using, this case properly checks whether it is a number or not.
console.log(Number.isFinite(23 / 0));
console.log(Number.isFinite(20));
console.log(Number.isFinite('23'));
console.log(Number.isFinite(+'20x'));
*/

/*
// Math and Rounding
console.log(Math.sqrt(64));
console.log(64 ** (1 / 2));
console.log(343 ** (1 / 3));
console.log(Math.cbrt(64));

// Max and Min
console.log(Math.max(12, 35, 79, 81, 102, 1)); // max function can do type coercion but not parsing ie.
console.log(Math.max(12, '35', 79, 81, 102, 1));
console.log(Math.max(12, '35px', 79, 81, 102, 1));

console.log(Math.min(12, '35', 79, 81, 102, 1));

// Pi value in javascript to get area of an object from css
console.log(Math.PI * Number.parseFloat('10px') ** 2);

// Previous dice problem
console.log(Math.trunc(Math.random() * 6) + 1);

// Using generating function
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;

console.log(randomInt(1, 6));

// Rounding Integers
console.log(Math.floor(23.7));
console.log(Math.trunc(23.3));
console.log(Math.round(23.7));
console.log(Math.ceil(23.7));

// The difference between floor and trunc comes when we use negative numbers for +ve they're both same
console.log(Math.floor(-23.1));
console.log(Math.trunc(-23.1));

// Selecting to how many fixed decimals the rounding needs to be done.
console.log((2.7).toFixed(0));
console.log((2.7).toFixed(3));
*/

/*
// Working with BigInt
console.log(8320743201472014730142n);
console.log(BigInt(8320743201472014730142)); //Both are same

// Operations
const huge = 32424321488350378374n;
const num = 69;

// console.log(huge * num); // will always give error, which is typeError

// Solution
console.log(huge * BigInt(num));

// Exceptions
console.log(20n > 15); // true: type coercion possible
console.log(20n === 20); // false: because BigInt and Int are not of the same type
console.log(20n == 20); // true: because type does not matter in this equality

console.log(huge + ' is a Really BIG Number');

*/

/*
// DATES METHOD

// Creating Dates
// const dateNow = new Date();
// console.log(dateNow);

// console.log(new Date('Jan 22 2000 22:00'));
// console.log(new Date(account1.movements[0]));

// //Unix time or UTC
// console.log(new Date(0));
// // converting days to miliseconds
// console.log(new Date(3 * 24 * 60 * 60 * 1000)); // This represents 3 days after unix time

// Working with dates
const future = new Date(2069, 10, 19, 15, 45);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getDay()); // This does not give day of the construction but the day of the week i.e. 2 for Tuesday, 5 for Friday etc.
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString());
console.log(future.getTime());

future.setFullYear(2169);
console.log(future);
*/

/*
// Timeout and Intervals
const messages = ['Hello', 'Bye'];
const messageTimer = setTimeout(
  (message1, message2) =>
    console.log(`Here are your two messages "${message1} and ${message2}"`),
  3000,
  ...messages
);
console.log('Waiting');

if (messages.includes('Bye')) clearTimeout(messageTimer);

// setInterval
setInterval(function () {
  const now = new Date();
  const options = {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  };
  console.log(Intl.DateTimeFormat('en-US', options).format(now));
}, 1000);
*/
