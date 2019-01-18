///////////// Budget Controller ////////////////////////

var budgetController = (function() {

  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };
  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;

  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(curr) {
      sum += curr.value;
    });
    data.totals[type] = sum;
  };

  var allExpenses = [];
  var allIncomes = [];
  var totalExpences = 0;

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1

  };
  return {
    addItem: function(type, des, val) {
      var newItem, ID;
      ///make new id

      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }


      //make new item based on inc or exp type
      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }
      //push it into our data structure
      data.allItems[type].push(newItem);
      //return the new element
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;

      ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {
      //calculate total income and total expenses
      calculateTotal('exp');
      calculateTotal('inc');
      //calcuate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;
      //calcuate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }

      // Expense = 100 and income 300, spent 33.333% = 100/300 = .3333 * 100


    },

    calculatePercentages: function() {
      data.allItems.exp.forEach(function(curr) {
        curr.calcPercentage(data.totals.inc);
      });
    },
    getPercentages: function() {
      var allPerc = data.allItems.exp.map(function(curr) {
        return curr.getPercentage();
      });
      return allPerc;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

    testing: function() {
      console.log(data);
    }
  };

})();

///////////// UI Controller ////////////////////////


var uIController = (function() {

  var dOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'

  };

  var formatNumber = function(num, type) {

    var numSplit, int, dec, type;


    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }

    dec = numSplit[1];

    return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;
  };

  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };


  return {
    getinput: function() {
      return {
        type: document.querySelector(dOMstrings.inputType).value, //Will be ether inc or exp
        description: document.querySelector(dOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(dOMstrings.inputValue).value)
      };
    },

    addListItem: function(obj, type) {
      var html, newHtml;
      //make html string with placeholder text
      if (type === 'inc') {
        element = dOMstrings.incomeContainer;

        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp') {
        element = dOMstrings.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      //replace the placeholder with actual text
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      //Insert the html into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function(selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },
    clearFields: function() {
      var fields;

      fields = document.querySelectorAll(dOMstrings.inputDescription + ', ' + dOMstrings.inputValue);

      var fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(curr, idx, arr) {
        curr.value = "";
      });

      fieldsArr[0].focus();

    },
    displayBudget: function(obj) {
      var type;

      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(dOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(dOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(dOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');


      if (obj.percentage > 0) {
        document.querySelector(dOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(dOMstrings.percentageLabel).textContent = '----';
      }


    },

    displayPercentages: function(percentages) {

      var fields = document.querySelectorAll(dOMstrings.expensesPercLabel);

      nodeListForEach(fields, function(curr, index) {
        if (percentages[index] > 0) {
          curr.textContent = percentages[index] + '%';
        } else {
          curr.textContent = '---';
        }
      });
    },

    displayMonth: function() {
      var now, year, months, month;

      now = new Date();
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      month = now.getMonth();

      year = now.getFullYear();
      document.querySelector(dOMstrings.dateLabel).textContent = months[month] + ' ' + year;
    },

    changedType: function() {

      var fields = document.querySelectorAll(dOMstrings.inputType + ',' + dOMstrings.inputDescription + ',' + dOMstrings.inputValue);

      nodeListForEach(fields, function(curr) {
        curr.classList.toggle('red-focus');
      });

    },

    getdOMstrings: function() {
      return dOMstrings;
    }
  };

})();

/////////  Global App controller //////////////

var controller = (function(budgetCtrl, UICtrl) {

  var setupEventListeners = function() {

    var DOM = uIController.getdOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', uIController.changeType);
  };

  var updatePercentages = function() {
    ///1. Calculate Percentages
    budgetController.calculatePercentages();
    ///2. Read percentages from the budget controller
    var percentages = budgetController.getPercentages();
    ///3. Update the UI with the new percentages
    uIController.displayPercentages(percentages);
  };

  var updateBudget = function() {

    //1.  Calcuate the budget
    budgetCtrl.calculateBudget();
    //2. return the budget
    var budget = budgetCtrl.getBudget();
    //3.  Display the budget on the UI
    uIController.displayBudget(budget);

  };



  var ctrlAddItem = function() {

    var input, newItem;

    //1.  get the field input data
    input = uIController.getinput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {


      //2.  add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      //3.  add the item to the UI
      uIController.addListItem(newItem, input.type);

      //4. clear the fields
      uIController.clearFields();

      //5. calcuate and update budget
      updateBudget();

      //6. Calclate and update percentages
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function(event) {

    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {

      //inc-1
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);


      //1. delete item from the data structure
      budgetController.deleteItem(type, ID);

      //2. delete item from the UI
      uIController.deleteListItem(itemID);

      //3.Update and show the new budget
      updateBudget();

      //4. Calclate and update percentages
      updatePercentages();

    }
  };

  return {
    init: function() {
      console.log('Application has started.');
      uIController.displayMonth();
      uIController.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: 0
      });
      setupEventListeners();
    }
  };

})(budgetController, uIController);

controller.init();
