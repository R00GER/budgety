// BUDGET CONTROLLER
let budgetController = (function() {

    // function constructor - expenses
    let Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // function constructor - incomes
    let Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    let calculateTotal = function(type) {
        let sum = 0;

        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    };

    // data objetiin tallennetaan käyttäjän lisäämät tiedot
    let data = {
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
            let newItem, ID;

            // id = last ID + 1
            // uusi ID luodaan
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // luodaan uusi item inc tai exp tyypillä
            if (type === "exp") {
                newItem = new Expense(ID, des, val);
            } else if (type === "inc") {
                newItem = new Income(ID, des, val);
            }

            // työnnetään data objetin alltimes objebtin jäsenmuuttuja taulukkoon (exp tai inc)
            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function(type, id) {
            let ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1)
            }
        },

        calculateBudget: function() {

            // calculate total income and expenses
            calculateTotal("exp");
            calculateTotal("inc");

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
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


// UI CONTROLLER
let UIController = (function() {

    let DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expenseContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container"
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            let html, newHtml, element;
            // create html string with placeholder text
            if (type === "inc") {
                element = DOMstrings.incomeContainer;
                html = "<div class='item clearfix' id='inc-%id%'>" +
                    "<div class='item__description'>%description%</div>" +
                    "<div class='right clearfix'>" +
                    "<div class='item__value'>%value%</div>" +
                    "<div class='item__delete'>" +
                    "<button class='item__delete--btn'><i class='ion-ios-close-outline'></i></button>" +
                    "</div>" +
                    "</div>" +
                    "</div>";
            } else if (type === "exp") {
                element = DOMstrings.expenseContainer;
                html = "<div class='item clearfix' id='exp-%id%'>" +
                    "<div class='item__description'>%description%</div>" +
                    "<div class='right clearfix'>" +
                    "<div class='item__value'>%value%</div>" +
                    "<div class='item__delete'>" +
                    "<button class='item__delete--btn'><i class='ion-ios-close-outline'></i></button>" +
                    "</div>" +
                    "</div>" +
                    "</div>";
            }

            // replace placeholder text with actual data
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", obj.value);

            // insert the html into the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
        },

        deleteListItem: function(selectorID) {
            let el = document.getElementById(selectorID)
            el.parentNode.removeChild(el);

        },

        clearFields: function() {
            let fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ", " +
                DOMstrings.inputValue);

            // fieldsArr on lista html luokista/tekstistä, joka muutetaan arrayksi
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });

            // fieldsArr[0] = inputDescription
            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {

            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "---"
            }
        },

        // välitetään DOMstringit controllerille
        getDOMstrings: function() {
            return DOMstrings;
        }
    };
})();


// GLOBAL APP CONTROLLER
let controller = (function(budgetCtrl, UICtrl) {

    let DOM = UICtrl.getDOMstrings();

    let setupEventListeners = function() {

        // DOMstringit on tallennettu DOM -muuttujaan tässä controllerissa
        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", function(event) {

            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }

        });

        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);

    };

    let updateBudget = function() {
        let budget;
        // 1. calculate the budget
        budgetCtrl.calculateBudget();

        // 2. return budget
        budget = budgetCtrl.getBudget();
        // 3. display the budget on the UI
        UICtrl.displayBudget(budget);
    }

    let ctrlAddItem = function() {
        let input, newItem;

        // 1. get the field input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. clear the fields
            UICtrl.clearFields();

            // 5. calculate and update budget
            updateBudget();
        }
    };

    let ctrlDeleteItem = function(event) {
        let itemID, splitID, type;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            splitID = itemID.split("-");

            type = splitID[0];
            ID = parseInt(splitID[1]);

            budgetCtrl.deleteItem(type, ID);

            UICtrl.deleteListItem(itemID);

            updateBudget();
        }
    };

    return {
        init: function() {
            setupEventListeners();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
        }
    };

})(budgetController, UIController);

controller.init();