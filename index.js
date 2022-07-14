//global class
//Card class declaration and constructor
class Card {
    cardId; //card id - 8 digit int
    name; //card name
    type; //type of card
    desc; //description of card or card effect
    atk = undefined; //attack point statline, NOTE that spells, traps do not have this stat
    def = undefined; //defense point statline, NOTE that spells, traps, links, do not have stat
    level = undefined; // card level (when applicable), NOTE that spells, traps, links, and XYZ do not have levels
    race; //race of card, for spell/trap this describes the type of spell/trap they are 
    attribute = undefined; //attribute, does not apply to spell/trap
    imageUrl;// image url to grab from site, NOT FROM GOOGLE SERVER, else blacklist
    constructor(cardId, name, type, desc, atk, def, level, race, attribute, imageUrl) {
        this.cardId = cardId; this.name = name; this.type = type; this.desc = desc; this.atk = atk; this.def = def; this.level = level; this.race = race; this.attribute = attribute; this.imageUrl = imageUrl;
    }
}

//global variables
let currDeck = ''; //name of current deck
let mainDeck = []; //empty array to hold main deck
let extraDeck = []; //empty array to hold extra deck
let sideDeck = []; //empty array to hold side deck
let listDecks = []; //empty array to hold the list of deck names from db, will use to fill form options

//get urls for Yu-Gi-Oh! Prodeck API
const apiBaseUrl = 'https://db.ygoprodeck.com/api/v7/cardinfo.php?';
const urlCardName = `${apiBaseUrl}name=`;
const urlCardId = `${apiBaseUrl}id=`;
const baseUrlImg = 'https://ygoprodeck.com/pics/';
const decksUrl = 'http://localhost:3000/decks';

//grab elements
const mainDeckBuilder = document.querySelector('.main-deck-builder');
const extraDeckBuilder = document.querySelector('.extra-deck-builder');
const sideDeckBuilder = document.querySelector('.side-deck-builder');
const cardViewImg = document.querySelector('#selected-card-img');
const cardViewName = document.querySelector('#select-card-name');
const cardViewAttributes = document.querySelector('#select-card-attributes');
const cardStats = document.querySelector('#select-card-stats');
const cardEffects = document.querySelector('#select-card-effects');
const deckForm = document.querySelector('#deck-form');
const cardMarketPrice = document.querySelector('#cardmarket-price');
const tcgPlayerPrice = document.querySelector('#tcgplayer-price');
const ebayPrice = document.querySelector('#ebay-price');

//API CALL: fetch request to search by card's name
const fetchByName = async (cardName) => {
    //request from api
    let req = await fetch(`${urlCardName}${cardName}`);
    //get response back as json
    let res = await req.json();
    //return response, JUST THE CARD INFORMATION
    return res['data']['0'];
}

//API CALL: fetch request to search by card's ID
const fetchById = async (cardId) => {
    //request from api
    let req = await fetch(`${urlCardId}${cardId}`);
    //get response back as json
    let res = await req.json();
    //return response, JUST THE CARD INFORMATION
    return res['data']['0'];
}

//DB CALL: fetch list of deck names
const fetchListDecks = async () => {
    let req = await fetch(decksUrl);
    let res = await req.json();
    return Object.keys(res);
}

//DB CALLL: fetch deck information 
const fetchDeck = async (deckName) => {
    let req = await fetch(decksUrl);
    let res = await req.json();
    return res[`${deckName}`];
}

//initalize deck name to first from db
const initalizeDeck = async () => {
    const arrayOfNames = await fetchListDecks()
    currDeck = arrayOfNames[0];
}

//fill up deck arrays
const populateDecks = async (foo) => {
    await foo();
    let deckList = await fetchDeck(currDeck);
    mainDeck = deckList.mainDeck; 
    extraDeck = deckList.extraDeck; 
    sideDeck = deckList.sideDeck;
    console.log(currDeck);
    renderMainDeck();
    renderExtraDeck();
    renderSideDeck();

    const sortedDeck = sortDeck(mainDeck); 
}

const getPrices = async (cardId) => {
    let cardInfo = await fetchById(cardId);
    let prices = [cardInfo.card_prices[0].cardmarket_price, cardInfo.card_prices[0].tcgplayer_price, cardInfo.card_prices[0].ebay_price]
    return prices;
}

//render main deck
const renderMainDeck = () => {
    //clear out builder
    mainDeckBuilder.innerHTML = '';
    if(mainDeck.length > 40 && mainDeck.length <= 50) {
        mainDeckBuilder.classList.remove('deck-ct-40');
        mainDeckBuilder.classList.add('deck-ct-50');
    } else if (mainDeck.length > 40 && mainDeck.length <= 60){
        mainDeckBuilder.classList.remove('deck-ct-40');
        mainDeckBuilder.classList.add('deck-ct-60');
    } else {
        mainDeckBuilder.classList.remove('deck-ct-50');
        mainDeckBuilder.classList.remove('deck-ct-60');
        mainDeckBuilder.classList.add('deck-ct-40');
    }

    //iterate througha array and append
    mainDeck.forEach(something => {
        let tempCard = document.createElement('img');
        tempCard.addEventListener('contextmenu', (e) => {
            e.preventDefault()
            mainDeck.splice(mainDeck.indexOf(something), 1)
            tempCard.remove()
        })
        tempCard.addEventListener('click', async () => {
            cardViewImg.src = tempCard.src
            if (something.type === "Spell Card" || something.type === "Trap Card") {
                cardStats.textContent = ''
            } else if (something.type === "Link Monster") {
                cardStats.textContent = `ATK/${something.atk}`
            } else {
                cardStats.textContent = `ATK/${something.atk} DEF/${something.def}`
            }
            cardViewName.textContent = something.name
            cardViewAttributes.textContent = `[${something.race}/${something.type.split(' ')[0]}]`
            cardEffects.textContent = something.desc
            let prices = await getPrices(something.cardId);
            cardMarketPrice.textContent= `Cardmarket: $${prices[0]}`;
            tcgPlayerPrice.textContent= `TCG Player: $${prices[1]}`;
            ebayPrice.textContent= `Ebay:$${prices[2]}`;
        })
        tempCard.classList.add('builder-img');
        tempCard.src = something['imageUrl'];
        mainDeckBuilder.append(tempCard);
    })
}

//render extra deck
const renderExtraDeck = () => {
    //iterate througha array and appen
    extraDeckBuilder.innerHTML = '';
    extraDeck.forEach(something => {
        let tempCard = document.createElement('img');
        tempCard.addEventListener('contextmenu',(e) => {    
            e.preventDefault()
            extraDeck.splice(extraDeck.indexOf(something), 1)
            tempCard.remove()
        })
        tempCard.addEventListener('click', async () => {
            cardViewImg.src = tempCard.src
            if (something.type === "Spell Card" || something.type === "Trap Card") {
                cardStats.textContent = ''
            } else  if (something.type === "Link Monster") {
                cardStats.textContent = `ATK/${something.atk}`
            } else {
                cardStats.textContent = `ATK/${something.atk} DEF/${something.def}`
            }
            cardViewName.textContent = something.name
            cardViewAttributes.textContent = `[${something.race}/${something.type.split(' ')[0]}]`
            cardEffects.textContent = something.desc
            let prices = await getPrices(something.cardId);
            cardMarketPrice.textContent= `Cardmarket: $${prices[0]}`;
            tcgPlayerPrice.textContent= `TCG Player: $${prices[1]}`;
            ebayPrice.textContent= `Ebay:$${prices[2]}`;
        })
        tempCard.classList.add('builder-img');
        tempCard.src = something['imageUrl'];
        extraDeckBuilder.append(tempCard);
    })
}

//render side deck 
const renderSideDeck = () => {
    sideDeckBuilder.innerHTML = '';
    sideDeck.forEach(something => {
        let tempCard = document.createElement('img');
        tempCard.addEventListener('contextmenu', (e) => {
            e.preventDefault()
            sideDeck.splice(sideDeck.indexOf(something), 1)
            tempCard.remove()
        })
        tempCard.addEventListener('click', async () => {
            cardViewImg.src = tempCard.src
            if (something.type === "Spell Card" || something.type === "Trap Card") {
                cardStats.textContent = ''
            } else if (something.type === "Link Monster") {
                cardStats.textContent = `ATK/${something.atk}`
            } else {
                cardStats.textContent = `ATK/${something.atk} DEF/${something.def}`
            }
            cardViewName.textContent = something.name
            cardViewAttributes.textContent = `[${something.race}/${something.type.split(' ')[0]}]`
            cardEffects.textContent = something.desc
            let prices = await getPrices(something.cardId);
            cardMarketPrice.textContent= `Cardmarket: $${prices[0]}`;
            tcgPlayerPrice.textContent= `TCG Player: $${prices[1]}`;
            ebayPrice.textContent= `Ebay:$${prices[2]}`;
        })
        tempCard.classList.add('builder-img');
        tempCard.src = something['imageUrl'];
        sideDeckBuilder.append(tempCard);
    })
}
//render deck application portion
const renderDeck = () => {
    renderMainDeck();
    renderExtraDeck();
    renderSideDeck();
}

//sort deck according to requirements
const sortDeck = (unsortedDeck) => {
    let linkMonArray = [];
    let xyzMonArray =[];
    let synchroMonArray = [];
    let fusionMonArray =[];
    let monArray = [];
    let spellArray = [];
    let trapArray = [];

    //fill arrays by card type
    unsortedDeck.forEach(card => {
        if(card.type === "Link Monster"){
            linkMonArray.push(card);
        } else if(card.type === "XYZ Monster"){
            xyzMonArray.push(card);
        } else if(card.type === "Synchro Monster"){
            synchroMonArray.push(card);
        } else if(card.type === "Fusion Monster"){
            fusionMonArray.push(card);
        } else if(card.type.includes("Monster")){
            monArray.push(card);
        } else if(card.type === "Spell Card") {
            spellArray.push(card);
        } else if(card.type === "Trap Card") {
            trapArray.push(card)
        }
    })

    //alpa comparator
    const compareCard = (a,b) => {
        if (a.name < b.name) {
            return -1;
        } else if (a.name > b.name){
            return 1;
        } else {
            return 0;
        }
    }

    //sort each array by alpha
    linkMonArray.sort(compareCard);
    xyzMonArray.sort(compareCard);
    synchroMonArray.sort(compareCard);
    fusionMonArray.sort(compareCard);
    monArray.sort(compareCard);
    spellArray.sort(compareCard);
    trapArray.sort(compareCard);
    //return combined array
    return [...linkMonArray, ...xyzMonArray, ...synchroMonArray, ...fusionMonArray, ...monArray, ...spellArray, ...trapArray];
}

const testCardView = async(cardNameOrId) => {
    //undefined var
    let cardSearched; 
    //check to see if it is a number or not
    if(isNaN(cardNameOrId)){
        //not a number -> fetch by Name
        cardSearched = await fetchByName(cardNameOrId);
    } else {
        //is a number -> fetch by ID
        cardSearched = await fetchById(cardNameOrId);
    }

    cardViewImg.src = `https://ygoprodeck.com/pics/${cardSearched['id']}.jpg`;
    cardViewName.textContent = cardSearched['name'];
    cardViewAttributes.textContent = `${cardSearched['race']}/${cardSearched['type']}`;
    cardStats.textContent = `ATK/${cardSearched['atk']}`
    cardEffects.textContent = cardSearched['desc']
}

deckForm.addEventListener('change', () => {
    currDeck = deckForm[0].value;
    populateDecks(() => {});
})

const updateDeckSelector = async () => {
    const options = await fetchListDecks();
    deckForm.innerHTML = `
        <form id="deck-form">
            <label for= "decks" > Choose a Deck:</label >
            <select id="decks" name="deck-selector">

            </select>
        </form> 
        `
    options.forEach(option => {
        const op = document.createElement('option')
        op.value = option
        op.textContent = option
        deckForm[0].append(op)
    })
}

populateDecks(initalizeDeck);


// testCardView(80896940);

