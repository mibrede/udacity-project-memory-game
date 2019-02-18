document.addEventListener("DOMContentLoaded", function(event) {
    CreateGame();
});

const fieldSizes = [16, 24, 36];

let playerName = '';
let selectedFieldSize = 0;

let sectionNewGame;
let sectionGame;

function CreateGame() {
	sectionNewGame = document.getElementById('sectionNewGame');
	sectionGame = document.getElementById('sectionGame');
	
	//Init player name input
	const playerNameInput = document.getElementById('playerName');
	playerNameInput.addEventListener('keyup', function() {
		playerName = playerNameInput.value;
	});
	
	//Init start button
	const startButton = document.getElementById('btnStartButton');
	startButton.addEventListener('click', function() {
		if (playerName !== '' && selectedFieldSize !== 0) {
			StartGame();
		} else {
			Notification('alert', 'Please enter your name and select with how many cards you want to play.');
		}
	});
	
	CreateFieldSizeButtons();	
	NewGame();

	function CreateFieldSizeButtons() {
		//Create buttons
		const fieldSizesWrapper = document.getElementById('fieldSizesWrapper');
		let fieldSizeButtons = document.createDocumentFragment();
		for (const fieldSize of fieldSizes) {
			const newButton = document.createElement('button');
			newButton.textContent = fieldSize;
			newButton.setAttribute('class', 'btn-lg');
			newButton.setAttribute('data-size', fieldSize);
			fieldSizeButtons.appendChild(newButton);
		}
		fieldSizesWrapper.appendChild(fieldSizeButtons);
		
		//Set field size
		fieldSizesWrapper.addEventListener('click', function(e) {
			const clickedButton = e.target;
			
			//Check if button was clicked
			if (clickedButton.nodeName === 'BUTTON') {
				
				//Remove 'active' class from all buttons
				let allFieldSizeButtons = fieldSizesWrapper.getElementsByTagName('button');
				for (const fieldSizeButton of allFieldSizeButtons) {
					fieldSizeButton.classList.remove('active');
				}
				
				//Add 'active' class to clicked button
				clickedButton.classList.add('active');
				
				//Set value for selected field size
				selectedFieldSize = parseInt(clickedButton.dataset.size);
			}
		});	
	}
}

function NewGame() {
	//Hide game section
	sectionGame.style.display = 'none';
	
	//Show new game section
	sectionNewGame.style.display = 'block';
}

function StartGame() {	
	//Hide new game section
	sectionNewGame.style.display = 'none';
	
	//Player name
	const playerNameElm = document.getElementById('playerNameValue');
	playerNameElm.textContent = playerName;
	
	//Star rating
	const maxRating = 5;
	let starRatingValue = maxRating;
	const starRatingElm = document.getElementById('starRatingValue');
	starRatingElm.textContent = starRatingValue;
	
	//Game timer
	//Set up game timer
	let gameTimerValue = 0;
	const gameTimerElm = document.getElementById('gameTimerValue');
	gameTimerElm.textContent = gameTimerValue;
	//Start ga,etimer
	let gameTimer = setInterval(function(){
		gameTimerValue++
		gameTimerElm.textContent = gameTimerValue;
		//Reduce star rating to minimum 1
		if (gameTimerValue % Math.floor(selectedFieldSize * 2) === 0 && starRatingValue !== 1) {
			starRatingValue--;
			starRatingElm.textContent = starRatingValue;
		}
	}, 1000);
	
	//Card click
	let cardClicksValue = 0;
	const cardClickElm = document.getElementById('cardClickValue');
	cardClickElm.textContent = cardClicksValue;
	
	//Reset correct cards
	let correctCards = 0;
	
	//Create cards wrapper
	if (document.getElementById('cardsWrapper') !== null) {
		document.getElementById('cardsWrapper').remove();
	}
	let cardsWrapper = document.createElement('div');
	cardsWrapper.setAttribute('id', 'cardsWrapper');
	let cardsPerRow;
	switch (selectedFieldSize) {
		case 16:
			cardsPerRow = 4;
			break;
		case 24: 
			cardsPerRow = 5;
			break;
		case 36:
			cardsPerRow = 6;
			break;
		default:
			cardsPerRow = 4;
	}
	cardsWrapper.classList.add('cardsPerRow' + cardsPerRow);
	
	//Create cards order
	let cardsToRandomize = [];
	let cardIdx = 0;
	for (let i = 0; i < selectedFieldSize; i = i + 2) {
		cardsToRandomize[i] = cardIdx;
		cardsToRandomize[i+1] = cardIdx;
		cardIdx++;
	}
	
	//Create cards
	for (let i = 0; i < selectedFieldSize; i++) {
		const newCardValue = GetRandomCard();
		
		const newCard = document.createElement('div');
		newCard.setAttribute('class', 'card');
		newCard.setAttribute('data-idx', i);
		newCard.setAttribute('data-value', newCardValue);
		
		const newCardButton = document.createElement('button');
		newCardButton.setAttribute('class', 'btn-block');
		
		const newCardContent = document.createElement('img');
		newCardContent.setAttribute('src', 'img/none.svg');
		newCardContent.setAttribute('alt', 'Person ' + i);
						
		newCardButton.appendChild(newCardContent);
		newCard.appendChild(newCardButton);
		cardsWrapper.appendChild(newCard);
	}
	sectionGame.appendChild(cardsWrapper);
	
	//Click card
	let cardSelectedIdx = -1;
	let cardSelectedValue = -1;
	cardsWrapper.addEventListener('click', function(e) {
		CardClicked(e);
	});
	
	//Show game section
	sectionGame.style.display = 'block';
	
	function CardClicked(e) {
		let clickedCard;
		let clickedCardButton;
		let clickedCardImage;
		let cardSelected = false;
		
		if (e.target.nodeName === 'BUTTON') {
			clickedCardButton = e.target;
			cardSelected = true;
		} else if (e.target.nodeName === 'IMG') {
			clickedCardButton = e.target.closest('button');
			cardSelected = true;
		}
		
		if (cardSelected ) {
			clickedCard = clickedCardButton.closest('.card');
			clickedCardImage = clickedCard.getElementsByTagName('img')[0];
			
			//Check if the clicked card is not already selected
			if (!clickedCard.hasAttribute('data-selected')) {
				cardClicksValue++;
				cardClickElm.textContent = cardClicksValue;
				//Reduce star rating to minimum 1
				if (cardClicksValue % Math.floor(selectedFieldSize * 2) === 0 && starRatingValue !== 1) {
					starRatingValue--;
					starRatingElm.textContent = starRatingValue;
				}
				
				clickedCard.setAttribute('data-selected', 'selected');
				clickedCardButton.classList.add('active');
				clickedCardImage.setAttribute('src', 'img/' + clickedCard.dataset.value + '.svg');
				
				//Check if a card has already been selected
				if (cardSelectedIdx === -1) {
					//If not, set clicked card
					cardSelectedIdx = clickedCard.dataset.idx;
					cardSelectedValue = clickedCard.dataset.value;
				} else {
					//If yes, check if they fit
					if (cardSelectedValue === clickedCard.dataset.value) {
						//Selected cards fit
						correctCards = correctCards + 2;
						if (correctCards === selectedFieldSize ) {
							clearInterval(gameTimer);
							Modal('Congratulations ' + playerName + '!', starRatingValue, maxRating, 'It took you only ' + gameTimerValue + ' seconds and ' + cardClicksValue + ' moves.', '', '');
						}
					} else {
						//Selected card don't fit
						UnmarkCard(cardSelectedIdx);
						UnmarkCard(clickedCard.dataset.idx);
					}
					cardSelectedIdx = -1;
					cardSelectedValue = -1;
				};
			}
		}
	}
	
	function GetRandomCard() {
		let randomCardIdx = Math.floor((Math.random() * (cardsToRandomize.length - 1)));
		let randomCardVal = cardsToRandomize[randomCardIdx];
		cardsToRandomize.splice(randomCardIdx, 1);
		return randomCardVal;
	}
	
	function UnmarkCard(idx) {
		setTimeout(function() {
			let card = document.querySelectorAll('[data-idx="' + idx + '"]')[0];
			card.removeAttribute('data-selected');			
			let cardButton = card.getElementsByTagName('button')[0].classList.remove('active');
			let cardImage = card.getElementsByTagName('img')[0].setAttribute('src', 'img/none.svg');
		}, 500);
	}
}

function Modal(title, stars, maxStars, message, buttonText, buttonLink) {
	//Create wrapper
	let modalWrapper = document.createElement('div');
	modalWrapper.classList.add('modalWrapper');
	
	//Create modal
	let modalContent = document.createElement('div');
	modalContent.classList.add('modalContent', 'text-center');
	
	//Create headline
	let modalTitle = document.createElement('h2');
	modalTitle.textContent = title;
	
	//Create stars
	let modalStars = document.createElement('div');
	modalStars.setAttribute('data-value', stars);
	for (let i = 0; i < maxStars; i++) {
		let modalStar = document.createElement('span');
		modalStar.classList.add('fa', 'fa-star');
		if (i < stars) {
			modalStar.classList.add('cl-gold');
		}
		modalStars.appendChild(modalStar);
	}
	
	//Create message
	let modalMessage = document.createElement('h4');
	modalMessage.textContent = message;
	
	//Create button
	let modalButton = document.createElement('button');
	modalButton.classList.add('btn-lg');
	modalButton.addEventListener('click', function() {
		RemoveModal();
		NewGame();
	});
	modalButton.textContent = 'Play again!';
	
	//Put together all elements
	modalContent.appendChild(modalTitle);
	modalContent.appendChild(modalStars);
	modalContent.appendChild(modalMessage);
	modalContent.appendChild(modalButton);
	modalWrapper.appendChild(modalContent);
	document.body.appendChild(modalWrapper);
	
	modalButton.focus();
}

function RemoveModal() {
	const modal = document.getElementsByClassName('modalWrapper')[0];
	modal.remove();
}

function Notification(type, message, duration = 5000) {
	//Create notification
	let notification = document.createElement('div');
	notification.classList.add("notification");
	notification.classList.add(type);
	notification.textContent = message;
	document.body.appendChild(notification);	
	
	//Set timer to remove notification
	setTimeout(function(){
		notification.style.left = '50%';
		setTimeout(function() {
			notification.style.left = '-15em';
			setTimeout(function() {
				notification.remove();
			}, 500);
		}, duration);
	}, 100);
}