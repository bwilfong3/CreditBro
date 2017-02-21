/* Author: Benjamin Wilfong
 * Date Last Updated: 12/10/16 2:18 AM
 * File Name: creditmath.js
 * Description: This file contains all credit-math based algorithms that need to
 * be performed when the "calculate" button is clicked.
 */

/*
 * This first function, calculate() acts as a driver for all of the credit-math based activities
 * on the web page. It clears any results data and populates the "wallet" with all of the
 * credit card information the user has provided. The wallet is then thrown into an algorithm
 * that "pays off" each credit card simultaneously, given a budgeted amount. Each payment
 * is reported into an HTML table, which can be shown after the calculations have finished.
 * A small summary regarding the total interest paid is also displayed on the page.
 *
 * The function will also store the wallet object as a cookie so that it can be
 * reloaded when the user leaves the page.
 */

function calculate(){

	//document.getElementById("resultsDiv").innerHTML = "" ; // clear summary field
	document.getElementById("tabdiv").innerHTML = "";
	var wallet = populateWallet();
	setCookie(wallet);
	var combinedInterest = payCards(wallet);

	document.getElementById("resultsDiv").innerHTML += "Total Interest Paid: $" + combinedInterest.toFixed(2);
}


/*
 * populateWallet() grabs all of the information out of the text fields and returns an array
 * of credit card objects. Each credit card object is also used to add a table container
 * to the document.
 *
 * Javascript noob explanation: The reason why I am multiplying
 * the array elements by 1 is because the minimum payment attribute is being interpreted
 * as a string once the data is being sent to the HTML table. toFixed(2) does not work
 * on strings- only numeric types. The payment attribute is still a string when it gets sent to
 * addPaymentEntry(). This is because it is the only attribute that doesn't have any operations
 * (mathematical) performed on it before it gets to the function. I multiplied all of them for
 * consistency.
 */

function populateWallet(){
	var wallet = []; // holds all the credit cards!

	var titles = document.getElementsByClassName("titleField");
	var balances = document.getElementsByClassName("balanceField");
	var aprs = document.getElementsByClassName("aprField");
	var minPayments = document.getElementsByClassName("minPayField");

	for(var i = 0; i < numberOfCards; i++){
		wallet.push({
			title: titles[i].value,
			balance: balances[i].value * 1,
			apr: aprs[i].value * 1,
			minPayment: minPayments[i].value * 1,
			monthlyInterestRate: ((aprs[i].value / 100) / 12), // for instance, 22.99% APR wil become
															   // 0.0191583333333333333333333333333%
			totalInterest: 0.00, // running total of interest charged
			paidOff: false // set to true when the balance drops below 0
		});

		addTable(wallet[i]);
	}

	var cardReport = "";

	for (var i = 0; i < wallet.length; i++)
		cardReport += wallet[i].title + '\n' + wallet[i].balance + '\n'
			+ wallet[i].apr + '\n' + wallet[i].minPayment + '\n' + '\n';

	return wallet;
}


/*
 * Currently, this function will continually make payments on the credit cards until they
 * are all found to have a zero balance by debtFree(). As of now, the minimum payments are
 * being used as the amounts to pay per credit card. In the future, I would like to test out
 * several combinations of payments (given a certain montly budget) that at the minimum satisfy
 * the minimum payment per card. The configuration garnering the least total interest between
 * all of the cards is the end goal.
 *
 * If a card is not paid off and has a balance, a payment will be made with the given payment amount.
 * If a card has a negative balance (meaning it was paid off by the last payment), a flag is
 * set within the object that signifies that the card is paid off and will appear as such
 * when debtFree() is called. The "extra" amount that was overpaid is distributed
 * evenly and paid to all unpaid cards remaining in the wallet. As of right now, after a card is paid
 * off, the remaining unpaid cards continue to pay their respective minimum payments. In the future,
 * the now-unused portion of the budget will need to be distributed to the remaining unpaid cards.
 */

function payCards(wallet){
	var totalInterest = 0.00;
	var monthCount = 1;

	while(!debtFree(wallet)){
		for(var i = 0; i < wallet.length; i++){
			if((!wallet[i].paidOff) && wallet[i].balance > 0) // normal case, the card is not paid off and not flagged
				totalInterest += makePayment(wallet[i], wallet[i].minPayment, monthCount);
			else if((!wallet[i].paidOff) && wallet[i].balance <= 0){ // the card was paid off last payment
				wallet[i].paidOff = true;							 // the flag must be set and the leftovers must be redistributed

				document.getElementById("resultsDiv").innerHTML += wallet[i].title + " paid off in " + monthCount +
												  " months at $" + wallet[i].minPayment + " a month with $" +
												  wallet[i].totalInterest.toFixed(2) + " paid in interest.<br>";

				distributeLeftovers(wallet, wallet[i].balance, monthCount); // the negative amount paid on the card will be split and sent to the others

				console.log("Leftovers Distributed!");
			}
		}

		monthCount++;
	}

	return totalInterest;
}


/*
 * makePayment() will take a credit card object, a given payment, and the current month (for
 * reporting purposes). It first calculates the projected monthly interest and sees if the minimum payment
 * exceeds the amount of interest being charged (infinite loop if not). It then deducts the payment,
 * adds the amount of interest to the total interest charged on the credit card object, and adds on
 * the calculated interest to the total balance of the card. A log entry is added to the table,
 * and the interest charged is returned to get a running total of the amount of interest charged
 * between ALL of the specified cards.
 */

function makePayment(creditCard, payment, month){

	var interestCharged = creditCard.balance * creditCard.monthlyInterestRate;

	if((interestCharged) >= payment){
		alert("Interest charged exceeds minimum payment. You'll have to try harder than that!");
	}

	else{
			creditCard.balance -= payment; // subtract the monthly payment off of the balance
			creditCard.totalInterest += interestCharged; // add amount to total interest paid
			creditCard.balance += interestCharged; // add the amount to the total balance left
		}

	addPaymentEntry(creditCard, month, interestCharged, payment);

	return interestCharged; // return for total sum of interest on all cards
}


/*
 * This function simply cycles through all credit cards and checks to
 * see if every one has the paidOff flag set to true. If any one of the cards
 * is found to NOT be paid off, the function instantly returns a false result.
 * IF it makes it all the way through, true is returned and the payments no longer
 * need to be made.
 */

function debtFree(wallet){

	for(var i = 0; i < wallet.length; i++)
	{
		if(!wallet[i].paidOff)
			return false; // there is a card that still needs paid off
	}

	return true; // no cards require payment
}


/*
 * distributeLeftovers() currently will only be activated if a card was "overpaid"
 * on its final payment. If that is true, then the remainder of the payment amount
 * is evenly dispersed to all credit cards that are NOT currently paid off. It counts
 * the amount of unpaid cards first, to see how to divide the remainder, then
 * makes a payment on each unpaid card and adds an entry to the table.
 */

function distributeLeftovers(wallet, remainder, month){
	var paymentAmount = remainder * -1; // balance will only be zero or negative, so flip sign

	var cardsToBePaid = 0;

	for (var i = 0; i < wallet.length; i++){
		if (!wallet[i].paidOff)
			cardsToBePaid++; // increment count of number of cards to pay
	}

	if(cardsToBePaid > 0) // there was a card left over to distribute the remaining balance
	{
		paymentAmount /= cardsToBePaid; // divide up the remainder for cards unpaid

		for (var i = 0; i < wallet.length; i++){
			if (!wallet[i].paidOff){
				wallet[i].balance -= paymentAmount;
				addPaymentEntry(wallet[i], month, 0.00, paymentAmount); // no interest for splitting payment
			}
		}
	}
}


/*
 * This is the logging function for any sort of payment made to a card. It will
 * append a row to a credit card's own table element given the parameters. If
 * a card has a negative balance, the balance is shown to be 0, as the remainder
 * will be divided out to the other unpaid credit cards.
 */

function addPaymentEntry(creditCard, month, interest, payment){
	var balance = 0.00;

	if(creditCard.balance >= 0.00) // If the balance is non-negative, use it on table.
		balance = creditCard.balance; // If it IS negative, show a 0 balance, as the overpayment
									  // will be distributed among the other cards

	creditCard.table.innerHTML += "<tr>" +
								  	"<td>" + month + "</td>" +
								  	"<td>$" + interest.toFixed(2) + "</td>" +
								  	"<td>$" + payment.toFixed(2) + "</td>" +
								  	"<td>$" + balance.toFixed(2) + "</td>" +
								  "</tr>";
}


/*
 * This function creates the report elements needed per credit card.
 * It grabs the <center> element (only one exists on page), then creates and
 * appends a container containing a table and the proper headers. It also
 * Creates a "tab" for the credit card so that, when clicked, the page
 * will display the respective credit card's "payment plan".
 */

function addTable(creditCard){
	var centerDiv = document.getElementById("resultsDiv"); // get the center tag to append the table info
	var tableDiv = document.createElement("div"); // create table container with headers

	tableDiv.id = creditCard.title;
	tableDiv.className = "tabcontent";
	tableDiv.innerHTML = "<table class=\"paymentTable\"><tr><th>Month</th><th>Interest Charged</th><th>Amount Paid</th><th>Remaining Balance</th></tr>";

	creditCard.table = tableDiv.getElementsByTagName("table")[0];



	document.getElementById("tabdiv").innerHTML += "<li><a href=\"javascript:void(0)\" class=\"tablinks\""
												+ " onclick=\"openCity(event, '" + creditCard.title + "')\">" + creditCard.title + "</a></li>";

  centerDiv.appendChild(tableDiv);

}

function setCookie(wallet) {
	var cookie;

	var d = new Date();
	d.setTime(d.getTime() + (7*24*60*60*1000));
	var expires = "expires="+ d.toUTCString();

	cookie = "budget=" + document.getElementsByClassName("budgetField")[0].value + ";"
							+ "wallet=" + JSON.stringify(wallet) + ";"
							+ "expires=" + expires + ";";

	document.cookie = cookie;

	console.log(cookie);
}
