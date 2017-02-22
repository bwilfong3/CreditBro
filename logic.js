var numberOfCards = 1;
var cardId = 0;
var selection = 0;
var buttonOn = false;

window.setInterval(function(){
	switch(selection){
		case 0:
  		$('body').css('backgroundImage', 'url(./images/cbbg1draw.svg)');
			break;
		case 1:
			$('body').css('backgroundImage', 'url(./images/cbbg2draw.svg)');
		}

	selection = ++selection % 2;


}, 30 * 1000);

function addCard(){
	var div = document.createElement("div");

	div.className = "creditCard";

	div.id = "cc" + cardId;
	cardId++; // increment card ID as to not be reused

	div.innerHTML = "<form>Card Name:<input type=\"text\" class=\"titleField\"><br>" +
						"Balance:<input type=\"number\" class=\"balanceField\"><br>" +
						"APR:<input type=\"number\" class=\"aprField\"><br>" +
						"Minimum Payment:<input type=\"number\" class=\"minPayField\"><br></form>" +
						"<span class=\"close\" onClick=deleteCard(this)>";

	$(div).hide();

	document.getElementById("cardHolder").appendChild(div);

	$(div).fadeIn(1000);

	numberOfCards++; // increment the number of cards
	console.log(numberOfCards);
}

function deleteCard(card){
	var creditDiv = card.parentElement;

	if(numberOfCards == 1)
		alert("We can't remove ALL of your credit cards! Why are you even here?")

	else{
		$(card).fadeOut(1000);
		creditDiv.remove();

		numberOfCards--;
		console.log(numberOfCards);
	}
}

function toggleButton(){
	if(!buttonOn) {
		$("#addButton").css("color", "#4779d1");
		$("#addButton").css("background-color", "white");
	}

	else{
		$("#addButton").css("color", "white");
		$("#addButton").css("background-color", "#4779d1");
	}

	buttonOn = !buttonOn;

}
